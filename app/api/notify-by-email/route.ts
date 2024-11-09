import { NextRequest } from "next/server";
import { handleNotifications } from "@/app/api/notify-by-email/handleNotifications";

export async function POST(request: NextRequest) {
  try {
    console.log({ request: JSON.stringify(request), message: "notifying.." }); // KEEP LOG
    await handleNotifications(0);
    return new Response(JSON.stringify({ message: "notifications sent" }), {
      status: 201,
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
