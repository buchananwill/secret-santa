import { secret_santa_circles } from "@prisma/client";
import { Button } from "@mantine/core";
import Link from "next/link";

export default async function ElfMailCircleList({
  santaCircles,
}: {
  santaCircles: secret_santa_circles[];
}) {
  return santaCircles.map((circle) => (
    <Button
      component={Link}
      href={`/elf-ville/elf-mail?circleId=${circle.id.toString()}`}
      key={`elf-channel-${circle.id.toString()}`}
    >
      {circle.name}
    </Button>
  ));
}
