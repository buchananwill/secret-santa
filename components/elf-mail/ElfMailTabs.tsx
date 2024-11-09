"use client";
import { Button, Tabs } from "@mantine/core";
import { SantaIcon } from "@/resources/santa-claus-svgrepo-com";
import { IconArrowLeft, IconGift } from "@tabler/icons-react";
import Link from "next/link";
import { ConversationThread } from "@/components/elf-mail/ConversationThread";
import { elf_profiles } from "@prisma/client";

export default function ElfMailTabs({
  asElf,
  asSanta,
  userId,
  circleId,
  elfProfileForSanta,
}: {
  asSanta?: string;
  asElf?: string;
  userId?: string;
  circleId?: bigint;
  elfProfileForSanta?: elf_profiles;
}) {
  return (
    <>
      <Button
        leftSection={<IconArrowLeft />}
        component={Link}
        variant={"subtle"}
        href={"/elf-ville/elf-mail"}
      >
        Other Circles
      </Button>
      {asElf && asSanta && userId && circleId && (
        <Tabs defaultValue="santa">
          <Tabs.List>
            <Tabs.Tab
              value="santa"
              leftSection={<SantaIcon width={48} height={48} />}
            >
              You Are Santa
            </Tabs.Tab>
            <Tabs.Tab
              value="elf"
              leftSection={<IconGift height={48} width={48} strokeWidth={1} />}
            >
              You Are Elf
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="santa">
            <ConversationThread
              recipient={asSanta}
              userId={userId}
              circleId={circleId}
              stNickname={elfProfileForSanta?.st_nick_name}
            />
          </Tabs.Panel>
          <Tabs.Panel value="elf">
            <ConversationThread
              recipient={asElf}
              userId={userId}
              circleId={circleId}
            />
          </Tabs.Panel>

          <Tabs.Panel value="settings">Settings tab content</Tabs.Panel>
        </Tabs>
      )}
    </>
  );
}
