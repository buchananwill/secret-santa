"use server";
//TODO: run this with transactional lock
import { withUser } from "@/utils/supabase/with-user";
import prismaClient from "@/app/elf-ville/elf-mail/prisma-client";
import { elf_profiles, secret_santas } from "@prisma/client";
import { SecretSanta } from "@/utils/santa-matcher";
import { matchElvesToSantas } from "@/utils/match-elves-to-santas";

export async function tryToPerformMatching(circleId: bigint) {
  return withUser(async (user) => {
    let response = {
      message: "Unknown error",
      status: 500,
    };
    let circle = await prismaClient.secret_santa_circles.findUnique({
      where: {
        id: circleId,
      },
    });
    if (!circle) {
      response = {
        message: "Could not find circle!",
        status: 400,
      };
    } else if (circle.status > 1) {
      response = {
        message: "Circle already closed. Cannot re-match.",
        status: 400,
      };
    } else {
      let secretSantasDb = await prismaClient.secret_santas.findMany({
        where: {
          secret_santa_circle: circleId,
        },
      });
      const allSantasReady = !secretSantasDb.some((santa) => !santa.is_ready);

      if (!allSantasReady) {
        response = {
          status: 200,
          message: "Not all elves ready.",
        };
      } else {
        await prismaClient.secret_santa_circles.update({
          where: { id: circleId },
          data: { ...circle, status: 2 },
        });
        let userIdList = secretSantasDb.map((santa) => santa.user_id);
        let users = await prismaClient.elf_profiles.findMany({
          where: {
            id: {
              in: userIdList,
            },
          },
        });
        let idToElfProfileMap = users.reduce(
          (prev, curr) => prev.set(curr.id, curr),
          new Map<string, elf_profiles>(),
        );
        let elvesList = secretSantasDb.map((santa) => {
          const nextSanta: SecretSanta = {
            name: santa.user_id,
            partnerName: idToElfProfileMap.get(user.id)?.partner ?? undefined,
          };
          return nextSanta;
        });
        let santas = matchElvesToSantas(elvesList);
        if (!santas) {
          console.warn("elves did not match");
          await prismaClient.secret_santa_circles.update({
            where: { id: circleId },
            data: { ...circle, status: 1 },
          });
          response = {
            status: 200,
            message:
              "Elves ready, but unable to match all elves without matching partners or cycles of length 2.",
          };
        } else {
          let userIdToSantaMap = secretSantasDb.reduce(
            (prev, curr) => prev.set(curr.user_id, curr),
            new Map<string, secret_santas>(),
          );
          const santasWithElfIds = santas
            .flatMap((list) => [...list])
            .map((santa) => {
              let elf = userIdToSantaMap.get(santa.name);
              let secretSanta = santa.actsAsSantaTo?.name
                ? userIdToSantaMap.get(santa.actsAsSantaTo?.name)
                : undefined;
              if (!elf || !secretSanta)
                throw Error("Santa or Elf not found in map");
              return { ...secretSanta, acts_as_santa_to: elf.id };
            });
          let updatePromises = santasWithElfIds.map((santa) => {
            return prismaClient.secret_santas.update({
              where: {
                id: santa.id,
              },
              data: santa,
            });
          });
          let updates = await Promise.all(updatePromises);

          response = { message: "Matching successful!", status: 201 };
        }
      }
    }

    return response;
  });
}
