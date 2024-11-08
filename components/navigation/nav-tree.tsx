import { Button } from "@mantine/core";
import Link from "next/link";

type NavNode = {
  pathSegment: string;
  text: string;
  description?: string;
  ignore?: boolean;
  children?: NavNode[];
};
export const root: NavNode = {
  pathSegment: "",
  text: "Home",
  children: [
    {
      pathSegment: "elf-ville",
      text: "Elf Ville",
      children: [
        {
          pathSegment: "elf-mail",
          text: "Elf Mail",
        },
      ],
    },
  ],
};

export function LinkTree({
  navNode,
  path,
}: {
  navNode: NavNode;
  path: string;
}) {
  const { children, description, text, pathSegment } = navNode;

  const href = `${path}${path.endsWith("/") ? "" : "/"}${pathSegment}`;
  return (
    <>
      <Button
        component={Link}
        href={href}
        variant={"subtle"}
        classNames={{ root: "w-fit" }}
      >
        {text}
      </Button>
      {children && children.length > 0 && (
        <div className={"flex flex-col ml-2"}>
          {children.map((childNode) => (
            <LinkTree
              navNode={childNode}
              path={href}
              key={childNode.pathSegment}
            />
          ))}
        </div>
      )}
    </>
  );
}
