"use server";
import { elf_profiles, secret_santas } from "@prisma/client";
import prismaClient from "@/api/prisma-client";
import { resendNotification } from "@/api/actions/resend";

function getSantaAnnouncement(santa: elf_profiles, elf: elf_profiles) {
  return `<h1>Hi ${santa.st_nick_name}!</h1><p>You've been matched to give presents to the elf: <strong>${elf?.st_nick_name}</strong>. You may now message them with your identity hidden!</p>`;
}

export async function notifyOfMatching(
  record: secret_santas,
  elfId: number | bigint,
) {
  const [elf, userProfile, santaProfile] = await Promise.all([
    prismaClient.secret_santas.findUnique({
      where: {
        id: elfId,
      },
    }),
    prismaClient.users.findUnique({
      where: {
        id: record.user_id,
      },
    }),
    prismaClient.elf_profiles.findUnique({
      where: {
        id: record.user_id,
      },
    }),
  ]);
  if (elf && userProfile) {
    const elfProfile = await prismaClient.elf_profiles.findUnique({
      where: {
        id: elf.user_id,
      },
    });

    if (elfProfile && santaProfile && userProfile?.email) {
      await resendNotification(
        {
          content: getSantaAnnouncement(santaProfile, elfProfile),
          subject: `You've been matched to an elf!`,
        },
        userProfile.email,
      );
    }
  }
}
