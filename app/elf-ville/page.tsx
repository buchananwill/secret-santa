'use client'
import {createSummary, SecretSanta, testElves} from "@/utils/santa-matcher";
import {useEffect, useState} from "react";
import {matchElvesToSantas} from "@/utils/match-elves-to-santas";

export default function Page() {

    let [elves, setElves] = useState<SecretSanta[][]>([]);

    useEffect(() => {
        let elvesToSantas = matchElvesToSantas(structuredClone(testElves));
        console.log({testElves, elvesToSantas})

        setElves(elvesToSantas)
    }, []);

    let summary = createSummary(elves);

    return <pre>{JSON.stringify(summary, null, 2)}</pre>
}