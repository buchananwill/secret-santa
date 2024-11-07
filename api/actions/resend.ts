'use server'
import {Resend} from 'resend';
import {elf_mail} from "@prisma/client";

export async function resend(message: elf_mail, recipientEmail?: string) {
    if (!message.recipient || !message.content || recipientEmail === undefined) {
        throw Error('Missing recipient or message')
    }
    const resend = new Resend(process.env.RESEND_API_KEY_TEST_MESSAGES);

    return await resend.emails.send({
        from: 'Secret Santa <elves@shipbornsoftwaresolutions.co.uk>',
        to: [recipientEmail],
        subject: 'You have elf-mail',
        html: `<p>${message.content}</p><p><a href="${process.env.NEXT_PUBLIC_ROOT_URL}/elf-ville/elf-mail">Click Here to Reply - this email address cannot receive incoming mail.</a></p>`,
    });
}

