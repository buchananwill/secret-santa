"use server";

import { PrismaClient } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";

const prismaClient = new PrismaClient();

export async function fetchMailAction(recipient: string) {
  let supabaseClient = await createClient();
  let session = await supabaseClient.auth.getUser();
  let userId = session.data.user?.id;

  return prismaClient.elf_mail.findMany({
    where: {
      OR: [
        {
          created_by: userId,
          recipient,
        },
        {
          created_by: recipient,
          recipient: userId,
        },
      ],
    },
  });
}
