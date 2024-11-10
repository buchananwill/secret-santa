import { NextRequest, NextResponse } from "next/server";
import { withAuthorizationHeader } from "@/app/api/notify-by-email/withAuthorizationHeader";
import { secret_santas } from "@prisma/client";
import { tryToPerformMatching } from "@/app/elf-ville/secret-santa-circles/try-to-perform-matching-action";
import { notifyOfMatching } from "@/app/api/notify-matching/notifyOfMatching";

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
        await notifyOfMatching(record, record.acts_as_santa_to).catch((e) =>
          console.error(e),
        );
        nextResponse = new NextResponse(null, { status: 201 });
      } else if (record.is_ready && !old_record.is_ready) {
        console.log("Matching triggered.");
        await tryToPerformMatching(record.secret_santa_circle)
          .then((response) => console.log(response))
          .catch((e) => {
            console.error(record);
            console.error(e);
          });
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
