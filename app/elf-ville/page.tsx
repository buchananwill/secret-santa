"use client";
import { createSummary, SecretSanta, testElves } from "@/utils/santa-matcher";
import { useEffect, useState } from "react";
import { matchElvesToSantas } from "@/utils/match-elves-to-santas";
import { Card } from "@mantine/core";

export default function Page() {
  let [elves, setElves] = useState<SecretSanta[][]>([]);

  useEffect(() => {
    let elvesToSantas = matchElvesToSantas(structuredClone(testElves));
    if (elvesToSantas) setElves(elvesToSantas);
  }, []);

  let summary = createSummary(elves);

  return (
    <Card w={600}>
      <iframe
        style={{ borderRadius: "12px" }}
        src="https://open.spotify.com/embed/album/5XmvYQG5vNDdAfeQiVVxqy?utm_source=generator"
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
      <pre>{JSON.stringify(summary, null, 2)}</pre>
    </Card>
  );
}
