"use server";
import { elf_profiles, secret_santas } from "@prisma/client";
import prismaClient from "@/api/prisma-client";
import { resendNotification } from "@/api/actions/resend";

function getSantaAnnouncement(santa: elf_profiles, elf: elf_profiles) {
  return `<h1>Hi ${santa.st_nick_name}!</h1><p>You've been matched to give presents to the elf: <strong>${elf?.st_nick_name}</strong>. You may now message them with your identity hidden!</p>`;
}

export async function notifyOfMatching(
  santaRecord: secret_santas,
  elfId: number | bigint,
) {
  console.log(`Attempting to notify ${santaRecord.id}`);
  // Get
  // - the ELF for the secret_santa identity of the receiving elf.
  // the USER PROFILE for the email address of the santa we are emailing,
  // the ELF_PROFILE_OF_SANTA of the santa, so we can address them by their St Nickname
  const [elf, userProfileOfSanta, elfProfileOfSanta] = await Promise.all([
    prismaClient.secret_santas.findUnique({
      where: {
        id: elfId,
      },
    }),
    prismaClient.users.findUnique({
      where: {
        id: santaRecord.user_id,
      },
    }),
    prismaClient.elf_profiles.findUnique({
      where: {
        id: santaRecord.user_id,
      },
    }),
  ]);
  if (elf && userProfileOfSanta) {
    console.log("Found elf and Santa user profile");
    // now get the ELF PROFILE of the elf, so we can tell SANTA the elf's St Nickname.
    const elfProfile = await prismaClient.elf_profiles.findUnique({
      where: {
        id: elf.user_id,
      },
    });

    if (elfProfile && elfProfileOfSanta && userProfileOfSanta?.email) {
      console.log("sending match notification!");
      await resendNotification(
        {
          content: getSantaAnnouncement(elfProfileOfSanta, elfProfile),
          subject: `You've been matched to an elf!`,
        },
        userProfileOfSanta.email,
      );
    }
  } else {
    console.error("Missing profile data.");
  }
}
