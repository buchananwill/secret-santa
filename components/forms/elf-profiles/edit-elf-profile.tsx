"use client";

import { Button, Paper, TextInput } from "@mantine/core";
import { elf_profiles } from "@prisma/client";
import { FormProvider, useForm } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { useCallback } from "react";
import ChoosePartner from "@/app/elf-ville/elf-profile/ChoosePartner";

const client = createClient();

export default function EditElfProfile({ profile }: { profile: elf_profiles }) {
  const formContext = useForm<elf_profiles>({
    defaultValues: profile,
  });
  let { register, handleSubmit } = formContext;

  const onSubmit = useCallback(
    async (data: elf_profiles) => {
      console.log(data);
      const response = await client
        .from("elf_profiles")
        .update(data)
        .eq("id", profile.id);

      // TODO: handle response
      console.log(response);
    },
    [profile.id],
  );

  return (
    <FormProvider {...formContext}>
      <Paper
        component={"form"}
        className={"flex-form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextInput
          {...register("st_nick_name")}
          w={300}
          label={"St Nickname"}
        />
        <ChoosePartner />
        <Button type={"submit"}>Update Profile</Button>
      </Paper>
    </FormProvider>
  );
}
