"server only";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export async function withUser<T>(needsUser: (user: User) => Promise<T>) {
  let supabaseClient = await createClient();
  let session = await supabaseClient.auth.getUser();
  let user = session.data.user;
  if (user) return needsUser(user);
  else {
    throw Error("Client not signed in.");
  }
}
