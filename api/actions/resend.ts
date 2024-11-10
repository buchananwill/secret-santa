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
  if (message === null || recipientEmail === undefined) {
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
  for (const secretSanta of santasWithElfMatches) {
    console.log(`Processing ${secretSanta.id}`);
    if (secretSanta.acts_as_santa_to !== null) {
      console.log("Acts as santa to was not null, triggered notification.");
      await notifyOfMatching(secretSanta, secretSanta.acts_as_santa_to);
    } else {
      console.log("Notification failed: acts_as_santa_to was null");
    }
  }
}
