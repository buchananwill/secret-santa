import {
  assignSanta,
  checkForCycle,
  randomIndex,
  SecretSanta,
  sequencesAreEqual,
  unassignSanta,
  validateMatch,
} from "@/utils/santa-matcher";

/**
 * Makes a copy of the elves before beginning.
 * Returns objects with recursive reference structure.
 * */
export function matchElvesToSantas(
  elves: SecretSanta[],
): SecretSanta[][] | undefined {
  const unMatchedElves = [
    ...elves.map((elf) => ({
      ...elf,
      actsAsElfFrom: undefined,
      actsAsSantaTo: undefined,
    })),
  ] as SecretSanta[];
  const unMatchedSantas = [...unMatchedElves] as SecretSanta[];
  const santaSequence: SecretSanta[] = [];
  const failedSequences: SecretSanta[][] = [];

  if (elves.length < 3) throw Error("Not enough elves to form a valid cycle.");

  let loop = 0;

  while (unMatchedElves.length > 0) {
    loop++;
    const nextElf = unMatchedElves.pop();
    if (nextElf === undefined) throw Error("No elf in array.");
    const validSantas = unMatchedSantas.filter((santa) =>
      validateMatch(santa, nextElf),
    );
    let assignedSanta = false;
    while (validSantas.length > 0 && !assignedSanta) {
      const tryIndex = randomIndex(validSantas);
      const [nextSanta] = validSantas.splice(tryIndex, 1);
      const resultingSequence = [...santaSequence, nextSanta];
      if (
        !failedSequences.some((seq) =>
          sequencesAreEqual(seq, resultingSequence),
        )
      ) {
        assignSanta(nextSanta, nextElf);
        unMatchedSantas.splice(unMatchedSantas.indexOf(nextSanta), 1);
        santaSequence.push(nextSanta);
        assignedSanta = true;
      }
    }

    if (validSantas.length === 0 && !assignedSanta) {
      unMatchedElves.push(nextElf);
      failedSequences.push([...santaSequence]);
      const wrongSanta = santaSequence.pop();
      const prevElf = wrongSanta && unassignSanta(wrongSanta);
      if (prevElf) unMatchedElves.push(prevElf);
      if (wrongSanta) unMatchedSantas.push(wrongSanta);
    }
  }

  let cycles: SecretSanta[][] = [];
  let lastCycle: SecretSanta[] = [];
  let santasToCycle = [...santaSequence];

  if (santaSequence.length === elves.length) {
    while (santasToCycle.length > 0) {
      santasToCycle = santasToCycle.filter(
        (santa) => !lastCycle.includes(santa),
      );
      let nextSanta = santasToCycle.pop();
      if (nextSanta) {
        lastCycle = checkForCycle(nextSanta, santaSequence.length);
        cycles.push(lastCycle);
      }
    }
  } else {
    console.error({ santaSequence, elves });
    return undefined;
  }

  return cycles;
}
