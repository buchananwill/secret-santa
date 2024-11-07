'use server'
import {Resend} from 'resend';
import {elf_mail} from "@prisma/client";

export async function resendTest(message: elf_mail, recipientEmail?: string) {
    if (!message.recipient || !message.content || recipientEmail === undefined) {
        throw Error('Missing recipient or message')
    }
    const resend = new Resend(process.env.RESEND_API_KEY_TEST_MESSAGES);

    return await resend.emails.send({
        from: 'Secret Santa <elves@shipbornsoftwaresolutions.co.uk>',
        to: [recipientEmail],
        subject: 'You are winning',
        html: `${message.content}`,
    });
}

