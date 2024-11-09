"server only";
import { headers } from "next/headers";

export async function withAuthorizationHeader(handler: () => Promise<any>) {
  const headerObj = await headers();
  const authorization = headerObj.get("Authorization");
  const apiKey = authorization?.split(" ")?.pop();
  if (!apiKey || apiKey !== process.env.NOTIFICATION_KEY) {
    return new Response(JSON.stringify({ message: "Not authorized" }), {
      status: 401,
    });
  } else return handler();
}
