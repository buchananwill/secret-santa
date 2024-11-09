"use client";
import { fetchAllSantaCircles } from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import SecretSantaCircle from "@/app/elf-ville/secret-santa-circles/SecretSantaCircle";
import CreateSecretSantaCircle from "@/components/forms/santa-circles/create-secret-santa-circle";
import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton } from "@mantine/core";

export default function SecretSantaCircles() {
  let { data, isFetching, isPending } = useQuery({
    queryKey: ["secret_santa_circles", "all"],
    queryFn: () => fetchAllSantaCircles(),
  });

  return (
    <div className={"grid grid-cols-1 md:grid-cols-3 gap-2"}>
      {!data && isFetching && (
        <Card className={"gap-2"}>
          <Skeleton h={30} />
          <Skeleton h={30} />
          <Skeleton h={30} />
          <Skeleton h={30} />
          <Skeleton h={30} />
        </Card>
      )}
      {data &&
        data.map((circle) => (
          <SecretSantaCircle santaCircle={circle} key={circle.id} />
        ))}
      <CreateSecretSantaCircle />
    </div>
  );
}
