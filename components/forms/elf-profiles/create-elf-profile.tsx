"use client";

import { Button, Paper, TextInput } from "@mantine/core";
import { elf_profiles } from "@prisma/client";
import { useForm } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { useCallback } from "react";

const client = createClient();

export default function CreateElfProfile() {
  let { register, handleSubmit } = useForm<elf_profiles>();

  const onSubmit = useCallback(async (data: elf_profiles) => {
    const response = await client.from("elf_profiles").insert(data);
    // TODO: handle response
    console.log(response);
  }, []);

  return (
    <Paper
      component={"form"}
      className={"flex-form"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput {...register("st_nick_name")} />
      <Button type={"submit"}>Create Profile</Button>
    </Paper>
  );
}
