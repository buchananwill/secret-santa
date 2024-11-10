"use server";
import { Resend } from "resend";
import { elf_mail } from "@prisma/client";
import prismaClient from "@/api/prisma-client";
import { notifyOfMatching } from "@/app/api/notify-matching/notifyOfMatching";
import { isNotUndefined } from "@/hooks/useStringSelectionListToIdListCallback";

export async function resendElfMail(
  message: elf_mail,
  recipientEmail?: string,
) {
  if (!message.recipient || !message.content || recipientEmail === undefined) {
    throw Error("Missing recipient or message");
  }
  const resend = new Resend(process.env.RESEND_API_KEY_TEST_MESSAGES);

  return await resend.emails.send({
    from: "Secret Santa <elves@shipbornsoftwaresolutions.co.uk>",
    to: [recipientEmail],
    subject: "You have elf-mail",
    html: `<p>${message.content}</p><p><a href="${process.env.NEXT_PUBLIC_ROOT_URL}/elf-ville/elf-mail">Click here to reply - this email address cannot receive incoming mail.</a></p>`,
  });
}

export async function resendNotification(
  message: { content: string; subject: string },
  recipientEmail?: string,
) {
  if (!message || recipientEmail === undefined) {
    throw Error("Missing recipient or message");
  }
  const resend = new Resend(process.env.RESEND_API_KEY_TEST_MESSAGES);

  return await resend.emails.send({
    from: "Secret Santa <elves@shipbornsoftwaresolutions.co.uk>",
    to: [recipientEmail],
    subject: message.subject ?? "You have elf-mail",
    html: `<p>${message.content}</p><p><a href="${process.env.NEXT_PUBLIC_ROOT_URL}/elf-ville">Click here to visit Elfville - this email address cannot receive incoming mail.</a></p>`,
  });
}
export async function informMatchedElves(santaCircle: number | bigint) {
  const santasWithElfMatches = await prismaClient.secret_santas.findMany({
    where: {
      secret_santa_circle: santaCircle,
    },
  });
  await Promise.all(
    santasWithElfMatches
      .map((secretSanta) => {
        if (secretSanta.acts_as_santa_to) {
          return notifyOfMatching(secretSanta, secretSanta.acts_as_santa_to);
        } else {
          return undefined;
        }
      })
      .filter(isNotUndefined),
  );
}
