"use client";
import { secret_santa_circles } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  announceReady,
  fetchCircleMembership,
} from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import { Button } from "@mantine/core";
import { useCallback, useTransition } from "react";
import { tryToPerformMatching } from "@/app/elf-ville/secret-santa-circles/try-to-perform-matching-action";
import { notifications } from "@mantine/notifications";

export function ReadyStatus({
  santaCircle,
  userIsInCircle,
}: {
  santaCircle: secret_santa_circles;
  userIsInCircle: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  let queryClient = useQueryClient();
  let queryKey = ["secret_santa", santaCircle.id.toString()];

  const { data: secretSanta, isPending: userPending } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchCircleMembership(santaCircle.id),
  });

  const onClick = useCallback(() => {
    startTransition(async () => {
      let prismaSecretSantasClient = await announceReady(santaCircle.id).catch(
        console.error,
      );
      await queryClient.invalidateQueries({ queryKey });
      // let { message, status } = await tryToPerformMatching(santaCircle.id);
      // notifications.show({
      //   message,
      //   id: "matching-outcome",
      //   color: getStatusColor(status),
      // });
    });
  }, [santaCircle.id, startTransition, queryClient, queryKey]);

  return (
    <Button
      disabled={
        !userIsInCircle ||
        santaCircle.status.toString() !== "1" ||
        secretSanta?.is_ready
      }
      onClick={onClick}
      loading={isPending}
    >
      {userIsInCircle
        ? secretSanta?.is_ready
          ? "Ready!"
          : "Ready?"
        : "Join first."}
    </Button>
  );
}

const statusColors = {
  "200": "blue",
  "201": "green",
  "400": "orange",
  "500": "red",
} as const;

function getStatusColor(status: number) {
  return String(status) in statusColors
    ? statusColors[String(status) as keyof typeof statusColors]
    : "red";
}
