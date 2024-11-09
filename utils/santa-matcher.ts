// Outcome is DAG

// Minimum cycle length is 3

// Partners not allowed to be connected

// Outcome target gets emailed directly to source

import { matchElvesToSantas } from "@/utils/match-elves-to-santas";

export type SecretSanta = {
  name: string;
  actsAsSantaTo?: SecretSanta;
  actsAsElfFrom?: SecretSanta;
  partnerName?: string;
};

export function validateMatch(santa: SecretSanta, elf: SecretSanta) {
  if (santa.actsAsElfFrom === elf) {
    return false;
  }
  if (santa.partnerName === elf.name) {
    return false;
  }
  return santa !== elf;
}

export function checkForCycle(
  santa: SecretSanta,
  limit: number,
): SecretSanta[] {
  const seen = new Set<SecretSanta>();
  let santaNode: SecretSanta = santa;
  while (seen.size < limit) {
    if (santaNode.actsAsSantaTo === undefined) {
      return []; // Open chain case
    }
    if (seen.has(santaNode)) {
      return [...seen.values()]; // Closed cycle case
    } else {
      seen.add(santaNode);
      santaNode = santaNode.actsAsSantaTo; // Continue cycle case
    }
  }
  return [...seen.values()]; // Hamiltonian cycle case
}

export function randomIndex(items: any[]) {
  return Math.floor(Math.random() * items.length);
}

export function assignSanta(santa: SecretSanta, elf: SecretSanta) {
  santa.actsAsSantaTo = elf;
  elf.actsAsElfFrom = santa;
}

export function unassignSanta(santa: SecretSanta) {
  const elf = santa.actsAsSantaTo;
  if (elf === undefined) return undefined;
  elf.actsAsElfFrom = undefined;
  santa.actsAsSantaTo = undefined;
  return elf;
}

export function sequencesAreEqual(
  santaSequence: SecretSanta[],
  otherSequence: SecretSanta[],
) {
  if (santaSequence.length === 0 && otherSequence.length === 0) return true;
  if (santaSequence === otherSequence) return true;
  if (santaSequence.length !== otherSequence.length) return false;
  for (let i = 0; i < santaSequence.length; i++) {
    if (santaSequence[i] !== otherSequence[i]) {
      return false;
    }
  }
  return true;
}

export const testElves: SecretSanta[] = [
  { name: "Charlotte", partnerName: "Sam Marsh" },
  { name: "Sam Marsh", partnerName: "Charlotte" },
  { name: "Sam NEW", partnerName: "Ciara" },
  { name: "Ciara", partnerName: "Sam NEW" },
  { name: "Will", partnerName: "Coralie" },
  { name: "Coralie", partnerName: "Will" },
  { name: "Jeran" },
  { name: "Ian" },
] as const;

export function createSummary(cycles: SecretSanta[][]) {
  const summaryList: { elf: string; santa?: string }[][] = [];
  cycles.forEach((cycle) => {
    const innerList: { elf: string; santa?: string }[] = [];
    cycle.forEach((elf) => {
      innerList.push({
        elf: elf.name,
        santa: elf.actsAsElfFrom?.name,
      });
    });
    summaryList.push(innerList);
  });
  return summaryList;
}
