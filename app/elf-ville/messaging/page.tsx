'use client'
import {Button} from "@mantine/core";
import {resendTest} from "@/api/actions/resend";

export default function Page() {

    return <Button onClick={async () => {
        console.log('sending message')
        let createEmailResponse = await resendTest();
        console.log(createEmailResponse)
    }}>Test!</Button>
}