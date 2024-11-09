"use client";
import { useCallback } from "react";
import {
  fetchProfileAction,
  findProfilesByStNickname,
  findStNicknameById,
} from "@/app/elf-ville/elf-profile/fetch-profile-action";
import { useFormContext } from "react-hook-form";
import { elf_profiles } from "@prisma/client";
import { AsyncAutocomplete } from "@/app/elf-ville/elf-profile/AsyncAutocomplete";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader, LoadingOverlay, TextInput } from "@mantine/core";

export default function ChoosePartner() {
  let { watch, setValue } = useFormContext<elf_profiles>();

  let partnerId = watch("partner");
  let { data, isFetching } = useQuery({
    queryKey: ["elf_partner"],
    queryFn: () => (partnerId ? findStNicknameById(partnerId) : null),
  });

  const updatePartner = useCallback(
    (id: string | null) => {
      setValue("partner", id);
    },
    [setValue],
  );

  if (isFetching) {
    return (
      <TextInput
        label={"Add Partner"}
        rightSection={<Loader size={"sm"} />}
        disabled
      ></TextInput>
    );
  }

  return (
    <AsyncAutocomplete
      label={"Add Partner"}
      placeholder="type to search"
      initialValue={data?.st_nick_name}
      onChange={updatePartner}
      getAsyncData={findProfilesByStNickname}
      labelPath={"st_nick_name"}
    />
  );
}
