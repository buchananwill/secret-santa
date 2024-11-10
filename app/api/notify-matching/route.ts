import { NextRequest, NextResponse } from "next/server";
import { withAuthorizationHeader } from "@/app/api/notify-by-email/withAuthorizationHeader";
import { resendNotification } from "@/api/actions/resend";
import { elf_profiles, secret_santas } from "@prisma/client";
import prismaClient from "@/api/prisma-client";
import { tryToPerformMatching } from "@/app/elf-ville/secret-santa-circles/try-to-perform-matching-action";

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

async function notifyOfMatching(record: secret_santas, elfId: number | bigint) {
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

export async function POST(request: NextRequest) {
  return withAuthorizationHeader(async () => {
    let nextResponse = new NextResponse(null, { status: 404 });
    const newVar: WebHookPayload<secret_santas> = await request.json();
    if (newVar.type === "UPDATE") {
      const { record, old_record } = newVar;
      if (
        record.acts_as_santa_to !== null &&
        old_record.acts_as_santa_to === null
      ) {
        notifyOfMatching(record, record.acts_as_santa_to).catch((e) =>
          console.error(e),
        );
        nextResponse = new NextResponse(null, { status: 201 });
      } else if (record.is_ready && !old_record.is_ready) {
        console.log("Matching triggered.");
        tryToPerformMatching(record.secret_santa_circle)
          .then((response) => console.log(response))
          .catch((e) => console.error(e));
        nextResponse = new NextResponse(null, { status: 201 });
      } else {
        nextResponse = new NextResponse(null, { status: 200 });
      }
    } else {
      nextResponse = new NextResponse(null, { status: 400 });
    }
    return nextResponse;
  });
}
