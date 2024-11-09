"use server";
import { withUser } from "@/utils/supabase/with-user";
import prismaClient from "@/app/elf-ville/elf-mail/prisma-client";

export async function fetchProfileAction() {
  return withUser((user) => {
    return prismaClient.elf_profiles.findUnique({
      where: {
        id: user.id,
      },
    });
  });
}
export async function findStNicknameById(elfProfileId: string) {
  return withUser((user) => {
    return prismaClient.elf_profiles.findUnique({
      where: {
        id: elfProfileId,
      },
      select: {
        st_nick_name: true,
      },
    });
  });
}

export async function findProfilesByStNickname(stNickName: string) {
  return withUser((user) => {
    return prismaClient.elf_profiles.findMany({
      where: {
        NOT: {
          id: user.id,
        },
        AND: [
          {
            st_nick_name: {
              contains: stNickName.trim(),
              mode: "insensitive",
            },
          },
          {
            OR: [
              {
                partner: null,
              },
              {
                partner: user.id,
              },
            ],
          },
        ],
      },
    });
  });
}
