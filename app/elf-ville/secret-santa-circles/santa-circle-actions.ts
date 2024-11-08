"use server";

import { withUser } from "@/utils/supabase/with-user";
import prismaClient from "@/app/elf-ville/elf-mail/prisma-client";
import { secret_santa_circles, secret_santas } from "@prisma/client";
import { NextResponse } from "next/server";

export async function fetchCircleMemberships() {
  return withUser((user) => {
    return prismaClient.secret_santas.findMany({
      where: {
        user_id: user.id,
      },
    });
  });
}

export async function fetchCircleMembership(circleId: bigint) {
  return withUser((user) => {
    return prismaClient.secret_santas.findUnique({
      where: {
        user_id_secret_santa_circle: {
          user_id: user.id,
          secret_santa_circle: circleId,
        },
      },
    });
  });
}

export async function fetchSantaCircles(circleIdList: bigint[]) {
  return withUser((user) => {
    return prismaClient.secret_santa_circles.findMany({
      where: {
        id: {
          in: circleIdList,
        },
      },
    });
  });
}

export async function fetchAllSantaCircles() {
  return withUser((user) => {
    return prismaClient.secret_santa_circles.findMany();
  });
}

export async function joinCircleAction(circleId: bigint) {
  return withUser((user) => {
    const santa: secret_santas = {
      user_id: user.id,
      created_at: new Date(),
      secret_santa_circle: circleId,
      acts_as_santa_to: null,
    } as secret_santas;
    return prismaClient.secret_santas.create({ data: santa });
  });
}

export async function leaveCircleAction(circleId: bigint) {
  return withUser((user) => {
    return prismaClient.secret_santas.delete({
      where: {
        user_id_secret_santa_circle: {
          user_id: user.id,
          secret_santa_circle: circleId,
        },
      },
    });
  });
}

export async function userIsInCircle(circleId: bigint) {
  return withUser(async (user) => {
    let count = await prismaClient.secret_santas.count({
      where: { user_id: user.id, secret_santa_circle: circleId },
    });
    return count > 0;
  });
}

export async function announceReady(circleId: bigint) {
  return withUser(async (user) => {
    return prismaClient.secret_santas.update({
      where: {
        user_id_secret_santa_circle: {
          user_id: user.id,
          secret_santa_circle: circleId,
        },
      },
      data: { is_ready: true },
    });
  });
}

//TODO: run this with transactional lock
export async function tryToPerformMatching(circleId: bigint) {
  return withUser(async (user) => {
    let circle = await prismaClient.secret_santa_circles.findUnique({
      where: {
        id: circleId,
      },
    });
    if (!circle || circle?.status > 1)
      return new Response(null, { status: 400 });

    let secretSantas = await prismaClient.secret_santas.findMany({
      where: {
        secret_santa_circle: circleId,
      },
    });
    const allSantasReady = !secretSantas.some((santa) => !santa.is_ready);

    if (allSantasReady) {
      await prismaClient.secret_santa_circles.update({
        where: { id: circleId },
        data: { ...circle, status: 2 },
      });
    } else {
      return new Response(JSON.stringify({ isReady: false }), { status: 200 });
    }
  });
}
