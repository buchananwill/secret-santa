"use client";
import { secret_santa_circles } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Button, NumberInput, Paper, TextInput } from "@mantine/core";
import React, { useCallback } from "react";
import { DateTimePicker, DateValue } from "@mantine/dates";
import { createClient } from "@/utils/supabase/client";
import "./Form.css";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const client = createClient();

export default function CreateSecretSantaCircle() {
  const { handleSubmit, register, watch, setValue, trigger } =
    useForm<secret_santa_circles>();

  const deliveryDay = watch("delivery_day");
  let queryClient = useQueryClient();

  const handleDateTimeChange = useCallback(
    (value: DateValue) => {
      setValue("delivery_day", value);
      trigger("delivery_day");
    },
    [setValue, trigger],
  );

  const handleSpendLimitChange = useCallback(
    (value: number | string) => {
      if (typeof value === "number") {
        setValue("spend_limit", value);
      } else {
        setValue("spend_limit", parseInt(value, 10));
      }
      trigger("spend_limit");
    },
    [setValue, trigger],
  );

  const onSubmit = useCallback(
    async (data: secret_santa_circles) => {
      let response = await client.from("secret_santa_circles").insert(data);
      queryClient.invalidateQueries({
        queryKey: ["secret_santa_circles", "all"],
      });
      // TODO HANDLE RESPONSE
      console.log(response);
    },
    [queryClient],
  );

  return (
    <Paper component={motion.div} layoutId={"create-circle"}>
      <form className={"flex-form"} onSubmit={handleSubmit(onSubmit)}>
        <TextInput {...register("name")} label={"Circle Name"} />
        <NumberInput
          label={"Spend Limit"}
          onChange={handleSpendLimitChange}
          min={0}
          max={32767}
          prefix={"£ "}
          thousandSeparator={" "}
          defaultValue={20}
          classNames={{ input: "text-right pr-8" }}
        />
        <DateTimePicker
          onChange={handleDateTimeChange}
          value={deliveryDay}
          label={"Delivery Day"}
        />
        <Button type={"submit"}>Create Circle</Button>
      </form>
    </Paper>
  );
}
