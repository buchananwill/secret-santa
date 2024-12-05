import { SantaIcon } from "@/resources/santa-claus-svgrepo-com";

export default async function Index() {
  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <SantaIcon
          width={96}
          style={{
            color: "var(--mantine-color-text)",
            // stroke: "var(--mantine-color-text)",
            fill: "var(--mantine-color-text)",
          }}
        ></SantaIcon>
      </main>
    </>
  );
}
