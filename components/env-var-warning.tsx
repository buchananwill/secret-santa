import Link from "next/link";
import {Badge, Button} from "@mantine/core";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Badge variant={"outline"} className="font-normal"
          color={'red'}
      >
        Supabase environment variables required
      </Badge>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={"outline"}
          component={Link}
          disabled
          className="opacity-75 cursor-none pointer-events-none"
              href="/sign-in"
        >

              Sign in
        </Button>
        <Button
          size="sm"
          variant={"default"}
          disabled
          component={Link}
          className="opacity-75 cursor-none pointer-events-none"
              href="/sign-up"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}
