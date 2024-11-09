"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchMailAction } from "@/api/fetch-mail-action";
import { Paper, ScrollArea, Text } from "@mantine/core";
import { motion } from "framer-motion";
import { NewMessage } from "@/components/elf-mail/NewMessage";

export function ConversationThread({
  userId,
  recipient,
  circleId,
}: {
  userId: string;
  recipient: string;
  circleId?: bigint;
}) {
  let { data, isFetching, isLoading } = useQuery({
    queryKey: ["elf_mail", userId, recipient, circleId?.toString()],
    queryFn: () => fetchMailAction(recipient, circleId ? circleId : undefined),
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
      <NewMessage recipient={recipient} circleId={circleId} />
    </div>
  );
}
