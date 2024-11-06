'use client'
import {Badge, Button} from "@mantine/core";
import Link from "next/link";

export default function NoEnvHeader() {

return <div className="flex gap-4 items-center">
    <div>
        <Badge
            color={'green'}
            // className="font-normal pointer-events-none"
        >
            Please update .env.local file with anon key and url
        </Badge>
    </div>
    <div className="flex gap-2">
        <Button
            component={Link}
            size="sm"
            variant={"outline"}
            color={'red'}
            disabled
            href="/sign-in"
            className="opacity-75 cursor-none pointer-events-none"
        >
            Sign in
        </Button>
        <Button
            size="sm"
            variant={"default"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
            component={Link}
            href={'/sign-up'}
        >
            Sign up
        </Button>
    </div>
</div>

}
