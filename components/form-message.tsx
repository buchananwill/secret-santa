import {Alert} from "@mantine/core";

export type Message =
    | { success: string }
    | { error: string }
    | { message: string };

export function FormMessage({message}: { message: Message }) {

    return (
        <div className="flex flex-col gap-2 w-full max-w-md text-sm">
            {"success" in message && (
                <Alert color={'green'} styles={{message: {color: 'var(--mantine-color-green-text)'}}}>
                    {message.success}
                </Alert>
            )}
            {"error" in message && (
                <Alert
                    color={'red'}
                    styles={{message: {color: 'var(--mantine-color-red-text)'}}}
                >
                    {message.error}
                </Alert>
            )}
            {"message" in message && (
                <div className="text-foreground border-l-2 px-4">{message.message}</div>
            )}
        </div>
    );
}
