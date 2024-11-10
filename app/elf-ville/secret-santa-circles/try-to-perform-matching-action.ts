"use server";
import prismaClient from "@/api/prisma-client";
import { elf_profiles, secret_santas } from "@prisma/client";
import { SecretSanta } from "@/utils/santa-matcher";
import { matchElvesToSantas } from "@/utils/match-elves-to-santas";

export async function tryToPerformMatching(circleId: bigint) {
  let response = {
    message: "Unknown error",
    status: 500,
  };

  try {
    await prismaClient.$transaction(async (transaction) => {
      console.log("Fetching secret_santa_circle with id:", circleId);
      if (!circleId) {
        throw Error(`No circleId provided. ${circleId}`);
      }
      let circle = await transaction.secret_santa_circles.findUnique({
        where: {
          id: circleId,
        },
      });
      if (!circle) {
        console.log("Circle not found.");
        response = {
          message: "Could not find circle!",
          status: 400,
        };
      } else if (circle.status > 2) {
        console.log("Circle already matched. Cannot re-match.");
        response = {
          message: "Circle already matched. Cannot re-match.",
          status: 400,
        };
      } else {
        console.log("Circle found and open for matching:", circle);
        console.log("Fetching secret_santas in the circle...");
        let secretSantasDb = await transaction.secret_santas.findMany({
          where: {
            secret_santa_circle: circleId,
          },
        });
        console.log("Fetched secret_santas:", secretSantasDb);

        const allSantasReady = !secretSantasDb.some((santa) => !santa.is_ready);
        console.log("All santas ready:", allSantasReady);

        if (!allSantasReady) {
          response = {
            status: 200,
            message: "Not all elves ready.",
          };
          console.log("Not all elves are ready.");
        } else {
          console.log("All elves ready, moving circle to closed status.");
          await transaction.secret_santa_circles.update({
            where: { id: circleId },
            data: { ...circle, status: 2 },
          });

          console.log("Fetching elf profiles...");
          let userIdList = secretSantasDb.map((santa) => santa.user_id);
          let users = await transaction.elf_profiles.findMany({
            where: {
              id: {
                in: userIdList,
              },
            },
          });
          console.log("Fetched elf profiles:", users);

          let idToElfProfileMap = users.reduce(
            (prev, curr) => prev.set(curr.id, curr),
            new Map<string, elf_profiles>(),
          );
          console.log("Mapped elf profiles to ids.");

          let elvesList = secretSantasDb.map((santa) => {
            const partner = idToElfProfileMap.get(santa.user_id)?.partner;
            const nextSanta: SecretSanta = {
              name: santa.user_id,
              partnerName: partner ?? undefined,
            };
            return nextSanta;
          });
          console.log("Created elvesList for matching:", elvesList);

          let santas = matchElvesToSantas(elvesList);
          if (!santas) {
            console.warn("Matching failed: unable to match all elves.");
            await transaction.secret_santa_circles.update({
              where: { id: circleId },
              data: { ...circle, status: 1 },
            });
            response = {
              status: 200,
              message:
                "Elves ready, but unable to match all elves without matching partners or cycles of length 2.",
            };
          } else {
            console.log("Elves matched successfully:", santas);

            let userIdToSantaMap = secretSantasDb.reduce(
              (prev, curr) => prev.set(curr.user_id, curr),
              new Map<string, secret_santas>(),
            );
            console.log("Mapped santas to elf ids.");

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
            console.log(
              "Prepared santasWithElfIds for updating:",
              santasWithElfIds,
            );

            let updatePromises = santasWithElfIds.map((santa) => {
              console.log("Updating santa record:", santa);
              return transaction.secret_santas.update({
                where: {
                  id: santa.id,
                },
                data: santa,
              });
            });
            let updates = await Promise.all(updatePromises);
            console.log("Update promises resolved:", updates);

            response = { message: "Matching successful!", status: 201 };
          }
        }
      }
    });
  } catch (e) {
    // console.error("An error occurred:", e);
    response.message = `${response.message} - ${String(e)}`;
  }

  console.log("Final response:", response);
  return response;
}
