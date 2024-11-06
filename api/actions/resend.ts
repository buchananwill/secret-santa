'use server'
import {Resend} from 'resend';

export async function resendTest(body?: string) {
    const resend = new Resend(process.env.RESEND_API_KEY_TEST_MESSAGES);

    return await resend.emails.send({
        from: 'Secret Santa <elves@shipbornsoftwaresolutions.co.uk>',
        to: ['willwritescode@gmail.com'],
        subject: 'You are winning',
        html: `${body}`,
    });
}

