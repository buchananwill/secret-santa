import { secret_santa_circles, secret_santas } from "@prisma/client";
import {
  fetchElfProfile,
  fetchElfProfileIdFromSantaId,
  fetchSantaIdForElf,
} from "@/app/elf-ville/secret-santa-circles/santa-circle-actions";
import ElfMailTabs from "@/components/elf-mail/ElfMailTabs";

export default async function ElfMailLoader({
  secretSanta,
  secretSantaCircle,
}: {
  secretSanta: secret_santas;
  secretSantaCircle: secret_santa_circles;
}) {
  const [santaToThisElf, elfToThisSanta] = await Promise.all([
    fetchSantaIdForElf(secretSanta.id),
    fetchElfProfileIdFromSantaId(secretSanta.acts_as_santa_to),
  ]);

  const santaId = santaToThisElf?.user_id;
  const elfId = elfToThisSanta?.user_id;

  const elfProfile = elfId
    ? ((await fetchElfProfile(elfId)) ?? undefined)
    : undefined;

  return (
    <ElfMailTabs
      circleId={secretSantaCircle.id}
      asElf={santaId}
      userId={secretSanta.user_id}
      asSanta={elfId}
      elfProfileForSanta={elfProfile}
    />
  );
}
