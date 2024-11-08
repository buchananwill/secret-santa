'use client'
import {FormMessage, Message} from "@/components/form-message";
import Link from "next/link";
import {Label} from "@/components/ui/label";
import {SubmitButton} from "@/components/submit-button";
import {PasswordInput, TextInput} from "@mantine/core";
import {signInAction} from "@/app/(auth-pages)/actions";

export function BasicLogin(
    {searchParams}:
        { searchParams: Message }
) {
    return <form className="flex-1 flex flex-col min-w-64" onSubmit={async (formEvent) => {
        formEvent.preventDefault();
        await signInAction(new FormData(formEvent.currentTarget))
    } }>
        <h1 className="text-2xl font-medium">Sign in</h1>
        <p className="text-sm text-foreground">
            Don't have an account?{" "}
            <Link className="text-foreground font-medium underline" href="/sign-up">
                Sign up
            </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <TextInput name="email" placeholder="you@example.com" required/>
            <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                    className="text-xs text-foreground underline"
                    href="/forgot-password"
                >
                    Forgot Password?
                </Link>
            </div>
            <PasswordInput
                type="password"
                name="password"
                placeholder="Your password"
                required
            />
            <SubmitButton pendingText="Signing In..." >
                Sign in
            </SubmitButton>
            <FormMessage message={searchParams}/>
        </div>
    </form>;
}