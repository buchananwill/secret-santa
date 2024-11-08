import { PrismaClient, Prisma, elf_mail } from "@prisma/client";
import { NextRequest } from "next/server";
import { resend } from "@/api/actions/resend";
import prismaClient from "@/app/elf-ville/elf-mail/prisma-client";

const MAX_BATCH_SIZE = 10;
const RETRY_DELAY = 5000; // 5 seconds for debounced retry

export async function POST(request: NextRequest) {
  try {
    console.log(JSON.stringify(request));
    await handleNotifications(0);
    return new Response(null, { status: 201 });
  } catch (e) {
    console.error(e);
  }
}

const PENDING_CODE = 1;
const PROCESSING_CODE = 2;
const SENT_CODE = 3;

async function handleNotifications(retryCount = 0): Promise<void> {
  try {
    const successIds: bigint[] = [];
    const failureIds: bigint[] = [];

    await prismaClient.$transaction(async (transaction) => {
      // Step 1: Fetch messages with row-level locking
      const messages = await prismaClient.$queryRaw<
        elf_mail[]
      >`SELECT * FROM "elf_mail"
         WHERE notification_status = ${PENDING_CODE}
          AND recipient is not null AND content is not null 
         ORDER BY id
         LIMIT ${MAX_BATCH_SIZE}
         FOR UPDATE SKIP LOCKED`;

      if (messages.length === 0) {
        console.log("No pending messages found. Exiting.");
        return;
      }

      const messageIds = messages.map((msg) => msg.id);
      const recipientIds = messages
        .map((msg) => msg.recipient)
        .filter((id) => id !== null);

      let usersWithEmails = await prismaClient.users.findMany({
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

      // Update messages to 'PROCESSING' status
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
          console.log(result.value.data);
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
      console.log(`Retrying for failed messages in ${RETRY_DELAY}ms...`);
      setTimeout(() => handleNotifications(retryCount + 1), RETRY_DELAY);
    }
  } catch (error) {
    console.error("Error processing notifications:", error);
  }
}
