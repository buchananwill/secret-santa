import ElfMailTabs from "@/components/elf-mail/ElfMailTabs";
import {
  fetchCircleMemberships,
  fetchSantaCircles,
} from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import ElfMailCircleList from "@/components/elf-mail/ElfMailCircleList";
import ElfMailLoader from "@/components/elf-mail/EmailMailLoader";

export default async function Page(props: {
  searchParams: Promise<{ circleId?: string; tab?: "elf" | "santa" }>;
}) {
  const searchParams = await props.searchParams;
  const { circleId, tab } = searchParams;
  const secretSantas = await fetchCircleMemberships();
  const circleIdList = secretSantas.map((santa) => santa.secret_santa_circle);
  const santaCircles = await fetchSantaCircles(circleIdList);
  const circleIdBigInt = circleId ? BigInt(circleId) : undefined;
  const secretSanta = secretSantas.find(
    (santa) => santa.secret_santa_circle === circleIdBigInt,
  );
  const santaCircle = santaCircles.find(
    (circle) => circle.id === circleIdBigInt,
  );

  return (
    <>
      {secretSanta && santaCircle ? (
        <ElfMailLoader
          secretSanta={secretSanta}
          secretSantaCircle={santaCircle}
        />
      ) : (
        <ElfMailCircleList santaCircles={santaCircles} />
      )}
    </>
  );
}
