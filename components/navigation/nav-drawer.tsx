"use client";
import { Button, Drawer } from "@mantine/core";
import { IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { PropsWithChildren } from "react";

export default function NavDrawer({
  signedIn,
  children,
}: { signedIn: boolean } & PropsWithChildren) {
  let [opened, { open, close, toggle }] = useDisclosure(false);
  return (
    <>
      <Button
        disabled={!signedIn}
        rightSection={<IconLayoutSidebarLeftExpand />}
        onClick={toggle}
      >
        Elfville
      </Button>
      <Drawer opened={opened} onClose={close}>
        {children}
      </Drawer>
    </>
  );
}
