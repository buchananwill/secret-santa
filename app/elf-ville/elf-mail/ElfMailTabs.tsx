"use client";
import {
  ActionIcon,
  Paper,
  ScrollArea,
  Tabs,
  Text,
  Textarea,
} from "@mantine/core";
import { SantaIcon } from "@/resources/santa-claus-svgrepo-com";
import { IconGift, IconSleigh } from "@tabler/icons-react";
import { elf_mail } from "@prisma/client";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMailAction } from "@/app/elf-ville/elf-mail/fetch-mail-action";

function NewMessage({ recipient }: { recipient?: string }) {
  let client = createClient();
  let { data, isFetching } = useQuery({
    queryKey: ["user"],
    queryFn: () => client.auth.getUser(),
  });

  const queryClient = useQueryClient();

  let userId = data?.data?.user?.id;
  const { register, handleSubmit, reset } = useForm<elf_mail>({
    defaultValues: {
      created_by: userId,
      created_at: new Date(),
      recipient: recipient,
    },
  });

  const onSubmit = useCallback(
    async (message: elf_mail) => {
      const messageToSend = {
        ...message,
        created_by: userId,
        recipient,
        created_at: new Date(),
      };
      let { error } = await client.from("elf_mail").insert(messageToSend);
      if (error) {
        alert(error.message);
      } else {
        reset();
        queryClient.invalidateQueries({ queryKey: ["elf_mail", recipient] });
      }
    },
    [userId, recipient, reset, client, queryClient],
  );

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit(onSubmit)();
      }
    },
    [handleSubmit, onSubmit],
  );

  return (
    <>
      <form
        className={"flex gap-1 align-middle items-center pr-2"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Textarea
          placeholder={"Type your seasonal message here."}
          classNames={{
            root: "grow text-wrap whitespace-normal",
            input: "text-wrap whitespace-normal",
          }}
          className={"flex-wrap "}
          {...register("content")}
          onKeyDown={handleKeyDown}
        />
        <ActionIcon
          type={"submit"}
          h={48}
          w={48}
          disabled={isFetching || !data}
          styles={{
            root: {
              borderRadius: "55% 16px 55% 75%",
              transform: "rotate(45deg)",
            },
          }}
        >
          <IconSleigh style={{ transform: "rotate(-45deg)" }} />
        </ActionIcon>
      </form>
    </>
  );
}

export default function ElfMailTabs({
  asElf,
  asSanta,
  userId,
}: {
  asSanta: string;
  asElf: string;
  userId: string;
}) {
  return (
    <Tabs defaultValue="santa">
      <Tabs.List>
        <Tabs.Tab
          value="santa"
          leftSection={<SantaIcon width={48} height={48} />}
        >
          As Santa
        </Tabs.Tab>
        <Tabs.Tab
          value="elf"
          leftSection={<IconGift height={48} width={48} strokeWidth={1} />}
        >
          As Elf
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="santa">
        <ConversationThread
          recipient={"79d90fac-8c5b-47c0-9eda-31bd143d3e0f"}
          userId={userId}
        />
      </Tabs.Panel>
      <Tabs.Panel value="elf">
        <ConversationThread
          recipient={"a021c3eb-78e0-4e87-b7e1-1ba3b4494ddd"}
          userId={userId}
        />
      </Tabs.Panel>

      <Tabs.Panel value="settings">Settings tab content</Tabs.Panel>
    </Tabs>
  );
}

function ConversationThread({
  userId,
  recipient,
}: {
  userId: string;
  recipient: string;
}) {
  let { data, isFetching, isLoading } = useQuery({
    queryKey: ["elf_mail", userId, recipient],
    queryFn: () => fetchMailAction(recipient),
  });

  const messages = data ? data : [];

  return (
    <div className={"flex flex-col gap-2"}>
      <ScrollArea
        className={"bg-gradient-to-b from-red-50 to-red-200 rounded-lg"}
        h={400}
      >
        <div className={"flex flex-col gap-1 h-fit w-96 p-4 "}>
          {messages.map((mail) => {
            const isSelf = mail.created_by === userId;
            return (
              <Paper
                key={mail.id}
                component={motion.div}
                layoutId={String(mail.id)}
                shadow={"md"}
                p={4}
                px={8}
                styles={{
                  root: {
                    position: "relative",
                    width: "fit-content",
                    maxWidth: "92%",
                    alignSelf: isSelf ? "end" : "start",
                    borderRadius: isSelf
                      ? "16px 0px 16px 16px"
                      : "0px 16px 16px 16px",
                    backgroundColor:
                      mail.created_by === userId
                        ? "var(--mantine-color-green-1)"
                        : "var(--mantine-color-white)",
                  },
                }}
              >
                <Text fz={"sm"}>{mail.content}</Text>
                <div
                  style={{
                    position: "absolute",
                    top: "0%", // Position the arrow vertically center on the side
                    left: isSelf ? "auto" : "-8px", // Position the arrow on the left for received, adjust for sent
                    right: isSelf ? "-8px" : "auto", // Position the arrow on the right for sent
                    // transform: isSelf ? "rotate(135deg)" : "rotate(-45deg)", // Rotate based on side
                    width: "10px",
                    height: "10px",
                    backgroundColor:
                      mail.created_by === userId
                        ? "var(--mantine-color-green-1)"
                        : "var(--mantine-color-white)",
                    borderRadius: "4px",
                    clipPath: isSelf
                      ? "polygon(0 0, 100% 0, 0 100%)"
                      : "polygon(100% 100%, 100% 0, 0 0)", // Create triangle shape
                  }}
                />
              </Paper>
            );
          })}
        </div>
      </ScrollArea>
      <NewMessage recipient={recipient} />
    </div>
  );
}
