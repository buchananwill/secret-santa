"use client";
import { secret_santa_circles } from "@prisma/client";
import { Badge, Button, Card } from "@mantine/core";
import { SantaIcon } from "@/resources/santa-claus-svgrepo-com";
import {
  announceReady,
  fetchCircleMembership,
  joinCircleAction,
  leaveCircleAction,
  userIsInCircle,
} from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

function ReadyStatus({
  santaCircle,
  userIsInCircle,
}: {
  santaCircle: secret_santa_circles;
  userIsInCircle: boolean;
}) {
  const client = createClient();
  let queryClient = useQueryClient();
  let queryKey = ["secret_santa", santaCircle.id.toString()];

  const { data: secretSanta, isPending: userPending } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchCircleMembership(santaCircle.id),
  });

  return (
    <Button
      disabled={
        !userIsInCircle ||
        santaCircle.status.toString() !== "1" ||
        secretSanta?.is_ready
      }
      onClick={async () => {
        await announceReady(santaCircle.id);
        queryClient.invalidateQueries({ queryKey });
      }}
    >
      Ready!
    </Button>
  );
}

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
            console.log(response);
          } else {
            const response = await leaveCircleAction(santaCircle.id);
            console.log(response);
          }
          queryClient.invalidateQueries({
            queryKey: ["userInCircle", santaCircle.id.toString()],
          });
          queryClient.invalidateQueries({
            queryKey: ["secret_santa", santaCircle.id.toString()],
          });
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
          styles={{ input: { color: "black" } }}
        />
      </div>
      <ReadyStatus santaCircle={santaCircle} userIsInCircle={data ?? false} />
    </Card>
  );
}

const circleStatus = ["OPEN", "CLOSED", "MATCHED", "DELIVERED"] as const;
