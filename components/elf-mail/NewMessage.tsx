"use client";
import { createClient } from "@/utils/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { elf_mail } from "@prisma/client";
import { useCallback } from "react";
import { ActionIcon, Textarea } from "@mantine/core";
import { IconSleigh } from "@tabler/icons-react";

export function NewMessage({
  recipient,
  circleId,
}: {
  recipient?: string;
  circleId?: bigint;
}) {
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
        santa_circle_context: circleId ? circleId.toString() : null,
      };
      let { error } = await client.from("elf_mail").insert(messageToSend);
      if (error) {
        alert(error.message);
      } else {
        reset();
        queryClient.invalidateQueries({
          queryKey: ["elf_mail", userId, recipient, circleId?.toString()],
        });
      }
    },
    [userId, recipient, reset, client, queryClient, circleId],
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
