"use client";
import { secret_santa_circles } from "@prisma/client";
import { Badge, Button, Card } from "@mantine/core";
import { SantaIcon } from "@/resources/santa-claus-svgrepo-com";
import {
  joinCircleAction,
  leaveCircleAction,
  userIsInCircle,
} from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { motion } from "framer-motion";
import { ReadyStatus } from "@/app/elf-ville/secret-santa-circles/ReadyStatus";

export default function SecretSantaCircle({
  santaCircle,
}: {
  santaCircle: secret_santa_circles;
}) {
  const { data, isPending, isFetching } = useQuery({
    queryKey: ["userInCircle", santaCircle.id.toString()],
    queryFn: () => userIsInCircle(santaCircle.id),
  });

  const queryClient = useQueryClient();

  return (
    <Card
      className={"gap-2"}
      component={motion.div}
      layoutId={`santa-circle-${santaCircle.id}`}
    >
      <Card.Section
        px={"md"}
        className={"flex items-center justify-between pt-4"}
      >
        <SantaIcon width={48} />
        {santaCircle.name}
        {santaCircle.status.toString() === "1" ? (
          <IconLockOpen width={48} />
        ) : (
          <IconLock />
        )}
      </Card.Section>
      <Button
        color={data ? "red" : "green"}
        disabled={santaCircle.status > 1}
        onClick={async () => {
          if (data === false) {
            let response = await joinCircleAction(santaCircle.id);
          } else {
            const response = await leaveCircleAction(santaCircle.id);
          }
          queryClient
            .invalidateQueries({
              queryKey: ["userInCircle", santaCircle.id.toString()],
            })
            .catch(console.error);
          queryClient
            .invalidateQueries({
              queryKey: ["secret_santa", santaCircle.id.toString()],
            })
            .catch(console.error);
        }}
        loading={isPending || isFetching}
      >
        {!data ? "Join" : "Leave"}
      </Button>
      <div className={"flex items-center gap-2 ml-auto mr-auto"}>
        Spend Limit: <Badge>£{santaCircle.spend_limit}</Badge>
      </div>
      <div className={"flex items-center gap-2 ml-auto mr-auto"}>
        Delivery Day:{" "}
        <DateInput
          value={santaCircle.delivery_day}
          disabled
          styles={{ input: { color: "var(--foreground)" } }}
        />
      </div>
      <ReadyStatus santaCircle={santaCircle} userIsInCircle={data ?? false} />
    </Card>
  );
}

const circleStatus = ["OPEN", "CLOSED", "MATCHED", "DELIVERED"] as const;
