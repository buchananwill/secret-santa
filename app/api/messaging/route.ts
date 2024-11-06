import {resendTest} from "@/api/actions/resend.ts";

export async function POST(request: any) {
    await resendTest(JSON.stringify(request))
}