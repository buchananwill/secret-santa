"use client";
import { fetchAllSantaCircles } from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import SecretSantaCircle from "@/app/elf-ville/secret-santa-circles/SecretSantaCircle";
import CreateSecretSantaCircle from "@/components/forms/santa-circles/create-secret-santa-circle";
import { useQuery } from "@tanstack/react-query";

export default function SecretSantaCircles() {
  let { data, isFetching, isPending } = useQuery({
    queryKey: ["secret_santa_circles", "all"],
    queryFn: () => fetchAllSantaCircles(),
  });

  return (
    <div className={"grid grid-cols-3 gap-2"}>
      {data &&
        data.map((circle) => (
          <SecretSantaCircle santaCircle={circle} key={circle.id} />
        ))}
      <CreateSecretSantaCircle />
    </div>
  );
}
