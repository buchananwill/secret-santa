'use client'
import {Button} from "@mantine/core";
import {googleSignInAction} from "@/components/auth/google-sign-in-action";

export default function GoogleSignIn() {

    return <Button onClick={() => googleSignInAction()}>Use Gmail</Button>
}