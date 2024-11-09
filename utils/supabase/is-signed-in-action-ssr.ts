import { createClient } from "@/utils/supabase/server";

("server only");

export async function isSignedIn() {
  return createClient()
    .then((client) => {
      return client.auth.getUser();
    })
    .then((session) => {
      return session.data.user ?? undefined;
    })
    .catch((e) => {
      console.error(e);
      return undefined;
    });
}
