"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type Word = {
    word: string;
    operation: string;
}

const variants = {
    calculating: { 
        width: "20%", 
        height: "20%",
    },

    display: { 
        width: "98%", 
        height: "95%",
        opacity: 1,
    },
    
    exit: { // currently not playing
        width: "0%", 
        height: "0%",
        opacity: 0,
    }
}

export default function Modal({ words } : { words: Array<Word> }) {
    const [ansawer, setAnswer] = useState<any>(null)
    const [showProbability, setShowProbability] = useState<boolean>(false)

    function fetchWords() {
        fetch("http://127.0.0.1:8000/run", {
            method: "POST",
            body: JSON.stringify({ operations: words }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setTimeout(() => {
                    setAnswer(data)
                }, 1000);
            })
    }

    useEffect(() => {
        fetchWords()
    }, [words])

    return (
        <motion.main className="absolute w-screen h-screen grid place-items-center p-16 z-50">
            <motion.div className="relative bg-zinc-500/10 backdrop-blur-xl border-2 border-black/20 overflow-hidden"
                variants={variants}
                animate={ansawer === null ? "calculating" : "display"}
                exit="exit"

                transition={{ duration: 0.5, type: "spring"}}
            >
                { ansawer === null ?
                    <div className="w-full h-full flex flex-col items-center justify-center shadow-2xl">
                        Calculating...
                    </div>
                    :
                    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden p-10 gap-5">
                        {
                            ansawer.map((ans: any, i: number) => (
                                <motion.span className="text-2xl font-bold"
                                    key={`${i}uwu`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, transition: { delay: 0.2 * i } }}
                                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                > 
                                    {i}: {ans[0]} 
                                </motion.span>
                            ))
                        }
                    </div>
                }

            </motion.div>
        </motion.main>
    )
}