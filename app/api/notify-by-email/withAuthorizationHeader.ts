"server only";
import { headers } from "next/headers";

export async function withAuthorizationHeader(handler: () => Promise<any>) {
  const headerObj = await headers();
  console.log(headerObj);
  const authorization = headerObj.get("Authorization");
  console.log(authorization);
  const apiKey = authorization?.split(" ")?.pop();
  console.log(apiKey);
  if (!apiKey || apiKey !== process.env.NOTIFICATION_KEY) {
    return new Response(JSON.stringify({ message: "Not authorized" }), {
      status: 401,
    });
  } else return handler();
}
