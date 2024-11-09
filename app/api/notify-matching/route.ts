import { NextRequest, NextResponse } from "next/server";
import { withAuthorizationHeader } from "@/app/api/notify-by-email/withAuthorizationHeader";
import { resendNotification } from "@/api/actions/resend";
import { elf_profiles, secret_santas } from "@prisma/client";
import prismaClient from "@/api/prisma-client";

type InsertPayload<T> = {
  type: "INSERT";
  table: string;
  schema: string;
  record: T;
  old_record: null;
};
type UpdatePayload<T> = {
  type: "UPDATE";
  table: string;
  schema: string;
  record: T;
  old_record: T;
};
type DeletePayload<T> = {
  type: "DELETE";
  table: string;
  schema: string;
  record: null;
  old_record: T;
};

type WebHookPayload<T> = InsertPayload<T> | UpdatePayload<T> | DeletePayload<T>;

function getSantaAnnouncement(santa: elf_profiles, elf: elf_profiles) {
  return `<h1>Hi ${santa.st_nick_name}!</h1><p>You've been matched to give presents to the elf: <strong>${elf?.st_nick_name}</strong>. You may now message them with your identity hidden!</p>`;
}

export async function POST(request: NextRequest) {
  return withAuthorizationHeader(async () => {
    let nextResponse = new NextResponse(null, { status: 404 });
    const newVar: WebHookPayload<secret_santas> = await request.json();
    if (newVar.type === "UPDATE") {
      const { record } = newVar;
      if (record.acts_as_santa_to !== null) {
        const [elf, userProfile, santaProfile] = await Promise.all([
          prismaClient.secret_santas.findUnique({
            where: {
              id: record.acts_as_santa_to,
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
            nextResponse = new NextResponse(null, { status: 201 });
          }
        }
      }
    } else {
      nextResponse = new NextResponse(null, { status: 400 });
    }
    await resendNotification(
      { content: JSON.stringify(newVar), subject: "testing" },
      "willwritescode@gmail.com",
    );
    return nextResponse;
  });
}
