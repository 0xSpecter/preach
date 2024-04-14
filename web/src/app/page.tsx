"use client"
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import Modal from "@/Modal";

const operations = ["+", "-", "*", "/"];
const maxWords = 30;

type Word = {
    word: string;
    operation: string;
}

export default function Home() {
    const [words, setWords] = useState<Array<Word>>([]);
    const [word, setWord] = useState<string>("");
    const [operation, setOperation] = useState<string>(operations[0]);
    const [inital, setInitial] = useState<boolean>(true);
    const [displayModal, setDisplayModal] = useState<boolean>(false);

    const inputref = useRef<HTMLInputElement>();

    function addWord() {
        if (word && words.length < maxWords) {
            if (inital) setWords([{word, operation: "None"}]);
            else setWords([...words, {word, operation}]);
            setWord("");
        }
    }

    function validate() {
        fetch("http://127.0.0.1:8000/validate", {
            method: "POST",
            body: JSON.stringify({ operations: words }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.text())
            .then(data => {
                if (data === "true") {
                    setDisplayModal(true);
                } else {
                    alert("please remove word: " + data)
                }
            })
    }

    useEffect(() => {
        if (words.length !== 0) {
            setInitial(false);
        } else if (words.length === 0) {
            setInitial(true);
        }
    }, [words])

    useEffect(() => {
        let operation = window.localStorage.getItem("operation");

        if (operation) {
            setOperation(operation);
        }
    }, [])

    return (
        <main className="w-screen h-screen grid place-items-center p-5 text-2xl font-bold">
            <div className="w-full h-full bg-zinc-700/60 flex flex-col items-center p-10 gap-10 shadow-xl shadow-emerald-700/50 rounded-md">
                <div className="w-full h-20 flex items-center shadow-2xl">
                    <div className="w-1/3 h-full flex items-center justify-end mr-10 rounded-md">
                        { true ?
                            <div className="w-2/3 h-full">
                                <Operators operation={operation} setOperation={setOperation} />
                            </div>
                        :
                            <>
                                <span> Operation </span>
                                <Dropdown className="pl-5 font-semibold italic text-center disabled:opacity-10 disabled:cursor-not-allowed" 
                                    options={operations} 
                                    onChange={event => setOperation(event.value)} 
                                    value={operation}
                                    disabled={inital}
                                />
                            </>
                        }
                    </div>
                    <input className="w-1/3 h-full bg-zinc-600/20 outline-none ring-emerald-500/60 focus:ring-2 text-2xl p-5 text-center font-semibold" 
                        placeholder="Add a word..." 
                        type="text"
                        ref={inputref}
                        value={word}
                        onChange={event => {
                            setWord(event.target.value)
                        }}

                        onKeyPress={event => {
                            if (event.key === "Enter") {
                                addWord()
                            }
                        }}
                    />
                    <button className="ml-10 text-center hover:scale-[1.1] cursor-pointer"
                        onClick={() => {addWord(); inputref.current.focus()}}
                    >
                        Add
                    </button>
                </div>

                <div className="w-full h-full flex flex-row gap-5 p-10">
                    <AnimatePresence>
                        {
                            words.map((word, index) => {
                                return (
                                    <div key={index}>
                                        <DisplayWord 
                                            word={word.word} 
                                            operation={word.operation} 
                                            index={index} 
                                            setWords={setWords} 
                                        />
                                    </div>
                                )
                            })
                        }
                    </AnimatePresence>
                </div>

                <div className="w-full h-20 flex items-center justify-center shadow-lg rounded-md">
                    <button
                        onClick={() => {
                            if (words.length === 0) alert("Please add a word")
                            else if (words.length === 1) alert("Please add an operation")
                            else validate()
                        }}
                    >
                        Send
                    </button>
                </div>

            </div>
            <AnimatePresence>
                { displayModal &&
                    <>
                        <Modal words={words} />

                        <motion.button className="absolute z-[100] top-10 right-12 text-4xl"
                            onClick={() => setDisplayModal(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                        >
                            X
                        </motion.button>
                    </>
                }
            </AnimatePresence>
        </main>
    );
}

function DisplayWord({ word, operation, index, setWords } : { word: string, operation: string, index: number, setWords: any }) {
    const [hovering, setHovering] = useState<boolean>(false);

    return (
        <motion.div className="relative rounded-sm p-3 border-2 border-zinc-400/30 bg-zinc-300/10 flex items-center justify-center gap-5 cursor-pointer"
            onClick={() => setWords(prev => {
                let newArr = [...prev]
                newArr.splice(index, 1)

                if (operation === "None" && newArr.length !== 0) {
                    alert("You can't remove the first word withour removeing the operation first.")
                    return prev
                } else {
                    return newArr
                }
            })}

            onMouseOver={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}

            whileHover={{ scale: 1.05, borderColor: "#aaa" }}

            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {operation !== "None" && <span> {operation} </span>}
            <span> {word} </span>
            
            <AnimatePresence>
                { hovering &&
                    <motion.span className="absolute -top-6 -right-20 bg-transparent backdrop-blur-xl ring-1 ring-white px-2 py-1 text-nowrap text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        Click to remove
                    </motion.span>
                }
            </AnimatePresence>
        </motion.div>
    )
}

function Operators({ operation, setOperation }) {
    const [hoveringOperation, setHoveringOperation] = useState<number>(null);
    const [hovering, setHovering] = useState<boolean>(false);
    
    const placeholder = useRef<HTMLDivElement>(null);
    const selected = useRef<HTMLDivElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const add = useRef<HTMLDivElement>(null);
    const sub = useRef<HTMLDivElement>(null);
    const mul = useRef<HTMLDivElement>(null);
    const div = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const containerRect = container.current.getBoundingClientRect();
        placeholder.current.style.top = containerRect.height + placeholder.current.offsetHeight / 6  + "px"
        switch (hoveringOperation) {
            case 0:
                placeholder.current.style.left = add.current.offsetLeft + containerRect.left - placeholder.current.offsetWidth / 4 + "px"
                break
            
            case 1:
                placeholder.current.style.left = sub.current.offsetLeft + containerRect.left - placeholder.current.offsetWidth / 4 + "px"
                break
            
            case 2:
                placeholder.current.style.left = mul.current.offsetLeft + containerRect.left - placeholder.current.offsetWidth / 4 + "px"
                break
            
            case 3:
                placeholder.current.style.left = div.current.offsetLeft + containerRect.left - placeholder.current.offsetWidth / 4 + "px"
                break
        } 
    }, [hoveringOperation])

    useEffect(() => {
        const containerRect = container.current.getBoundingClientRect();
        selected.current.style.left = placeholder.current.offsetLeft + "px"
        selected.current.style.top = placeholder.current.offsetTop + "px"
    }, [operation])
    
    return (
        <>
            <motion.div className="relative cursor-none w-full flex items-center justify-evenly h-full"
                onMouseMove={event => {
                    let bounds = (event.target as HTMLDivElement).getBoundingClientRect();
                    let step = bounds.width / 4

                    console.log(event.clientX, bounds.left)

                    if (event.clientX - bounds.left < step) {
                        setHoveringOperation(0)
                    } else if (event.clientX - bounds.left < step * 2) {
                        setHoveringOperation(1)
                    } else if (event.clientX - bounds.left < step * 3) {
                        setHoveringOperation(2)
                    } else {
                        setHoveringOperation(3)
                    }
                }}
                
                onClick={() => {
                    if (hoveringOperation !== null) {
                        setOperation(operations[hoveringOperation])
                        window.localStorage.setItem("operation", operations[hoveringOperation])
                    }
                }}
                onMouseLeave={() => setHoveringOperation(null)}

                onHoverStart={() => setHovering(true)}
                onHoverEnd={() => setHovering(false)}

                ref={container}
            >


                <span className="pointer-events-none" ref={add}> + </span>
                <span className="pointer-events-none" ref={sub}> - </span>
                <span className="pointer-events-none" ref={mul}> * </span>
                <span className="pointer-events-none" ref={div}> / </span>
            </motion.div>
            
            <motion.div className="absolute transition-all duration-300 rounded-full border-[2px] border-white w-10 h-10 z-20 pointer-events-none"
                style={hovering ? { opacity: 1 } : { opacity: 0 }}
                ref={placeholder}
            />

            <motion.div className="absolute transition-all duration-300 rounded-full border-[2px] border-emerald-500 w-10 h-10 z-30 pointer-events-none"
                ref={selected}
            />

        </>
    )
}