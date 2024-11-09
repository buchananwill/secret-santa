"use server";

import { withUser } from "@/utils/supabase/with-user";
import prismaClient from "@/api/prisma-client";

export async function fetchMailAction(recipient: string, circleId?: bigint) {
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
        santa_circle_context: circleId ? circleId : null,
      },
    });
  });
}
