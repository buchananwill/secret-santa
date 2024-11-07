import {signOutAction} from "@/app/(auth-pages)/actions";
import {hasEnvVars} from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import {createClient} from "@/utils/supabase/server";
import {Button} from "@mantine/core";
import NoEnvHeader from "@/components/NoEnvHeader";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <NoEnvHeader/>
    );
  }
  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button component={Link} href="/sign-in" size="sm" variant={"outline"}>
        Sign in
      </Button>
    </div>
  );
}
