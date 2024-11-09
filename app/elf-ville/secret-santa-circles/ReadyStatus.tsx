"use client";
import { secret_santa_circles } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  announceReady,
  fetchCircleMembership,
  tryToPerformMatching,
} from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import { Button } from "@mantine/core";
import { useCallback, useTransition } from "react";

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
    console.log("CLICKED");
    startTransition(async () => {
      let prismaSecretSantasClient = await announceReady(santaCircle.id);
      console.log({ message: "now updated", prismaSecretSantasClient });
      await queryClient.invalidateQueries({ queryKey });
      let response = await tryToPerformMatching(santaCircle.id);
      console.log(response);
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
      Ready! HELLO
    </Button>
  );
}
