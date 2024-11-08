"use client";
import { secret_santa_circles } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Button, NumberInput, Paper, TextInput } from "@mantine/core";
import React, { useCallback } from "react";
import { DateTimePicker, DateValue } from "@mantine/dates";
import { createClient } from "@/utils/supabase/client";
import "./Form.css";

const client = createClient();

export default function CreateSecretSantaCircle() {
  const { handleSubmit, register, watch, setValue, trigger } =
    useForm<secret_santa_circles>();

  const deliveryDay = watch("delivery_day");

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

  const onSubmit = useCallback(async (data: secret_santa_circles) => {
    let response = await client.from("secret_santa_circles").insert(data);
    // TODO HANDLE RESPONSE
    console.log(response);
  }, []);

  return (
    <Paper
      component={"form"}
      className={"flex-form"}
      // classNames={{ root: "flex-form" }}
      // styles={{
      //   root: {
      //     alignItems: "center",
      //     display: "flex",
      //     flexDirection: "column",
      //     gap: "1em",
      //   },
      // }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput {...register("name")} label={"Circle Name"} />
      <NumberInput
        label={"Spend Limit"}
        onChange={handleSpendLimitChange}
        min={0}
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
    </Paper>
  );
}
