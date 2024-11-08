"use server";

import { withUser } from "@/utils/supabase/with-user";
import prismaClient from "@/app/elf-ville/elf-mail/prisma-client";

export async function fetchMailAction(recipient: string) {
  return withUser((user) => {
    return prismaClient.elf_mail.findMany({
      where: {
        OR: [
          {
            created_by: user.id,
            recipient,
          },
          {
            created_by: recipient,
            recipient: user.id,
          },
        ],
      },
    });
  });
}
