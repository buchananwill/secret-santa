import { NextRequest, NextResponse } from "next/server";
import { withAuthorizationHeader } from "@/app/api/notify-by-email/withAuthorizationHeader";
import { resendNotification } from "@/api/actions/resend";

export async function POST(request: NextRequest) {
  return withAuthorizationHeader(async () => {
    const newVar = await request.json();
    await resendNotification(
      { content: JSON.stringify(newVar), subject: "testing" },
      "willwritescode@gmail.com",
    );
    return new NextResponse();
  });
}
