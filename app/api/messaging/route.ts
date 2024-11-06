import {resendTest} from "@/api/actions/resend";

export async function POST(request: any) {
    await resendTest(JSON.stringify(request))
}