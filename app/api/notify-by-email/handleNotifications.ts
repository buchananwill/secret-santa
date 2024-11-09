"server only";
import prismaClient from "@/api/prisma-client";
import { elf_mail } from "@prisma/client";
import { resend } from "@/api/actions/resend";

const MAX_BATCH_SIZE = 5;
const RETRY_DELAY = 5000; // 5 seconds for debounced retry
const PENDING_CODE = BigInt(1);
const PROCESSING_CODE = BigInt(2);
const SENT_CODE = BigInt(3);

export async function handleNotifications(retryCount = 0): Promise<void> {
  try {
    const successIds: bigint[] = [];
    const failureIds: bigint[] = [];

    await prismaClient.$transaction(async (transaction) => {
      // Step 1: Fetch messages with row-level locking
      const messages = await transaction.$queryRaw<
        elf_mail[]
      >`SELECT * FROM "elf_mail"
         WHERE notification_status = ${PENDING_CODE}
          AND recipient is not null AND content is not null 
         ORDER BY id
         LIMIT ${MAX_BATCH_SIZE}
         FOR UPDATE SKIP LOCKED`;

      if (messages.length === 0) {
        console.log("No pending messages found.");
        return;
      } else {
        console.log(`Found ${messages.length} messages.`);
      }

      const messageIds = messages.map((msg) => msg.id);
      const recipientIds = messages
        .map((msg) => msg.recipient)
        .filter((id) => id !== null);
      let usersWithEmails = await transaction.users.findMany({
        where: {
          id: {
            in: recipientIds,
          },
        },
        select: {
          id: true,
          email: true,
        },
      });
      const userIdToEmailMap = usersWithEmails.reduce(
        (prev, curr) => prev.set(curr.id, curr.email ?? undefined),
        new Map<string, string | undefined>(),
      );
      await transaction.elf_mail.updateMany({
        where: { id: { in: messageIds } },
        data: { notification_status: PROCESSING_CODE },
      });

      // Step 2: Send notifications
      const sendPromises = messages.map((message) =>
        resend(message, userIdToEmailMap.get(message.recipient as string)),
      );

      // Step 3: Await all promises and handle success/failure
      const results = await Promise.allSettled(sendPromises);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successIds.push(messages[index].id);
        } else {
          failureIds.push(messages[index].id);
        }
      });

      // Step 4: Update statuses based on results
      if (successIds.length > 0) {
        await transaction.elf_mail.updateMany({
          where: { id: { in: successIds } },
          data: { notification_status: SENT_CODE },
        });
      }
      if (failureIds.length > 0) {
        await transaction.elf_mail.updateMany({
          where: { id: { in: failureIds } },
          data: { notification_status: PENDING_CODE },
        });
      }
    });

    // Step 5: Retry if there were failures
    if (failureIds.length > 0) {
      console.log(`Retrying for failed messages in ${RETRY_DELAY}ms...`); // KEEP LOG
      // setTimeout(() => handleNotifications(retryCount + 1), RETRY_DELAY);
    }
  } catch (error) {
    console.error("Error processing notifications:");
    console.error(typeof error);
    if (error !== null) {
      console.error(error);
    } else {
      console.error("Other error received.");
    }
  }
}
