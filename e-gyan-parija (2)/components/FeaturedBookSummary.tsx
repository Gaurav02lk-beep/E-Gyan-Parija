import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { Book } from '../types';
import { AINarratorIcon, PlayIcon, PauseIcon, StopIcon, SparklesIcon } from './icons';

const FeaturedBookSummary: React.FC = () => {
    const context = useContext(AppContext);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const featuredBook = context?.books.find(b => b.id === 1); // "The Future of AI"

    const summaryText = "Explore the transformative power of artificial intelligence in 'The Future of AI'. This book delves into how AI is set to revolutionize society, from healthcare and transportation to our daily lives. It examines the ethical considerations and societal impacts of this rapidly advancing technology, offering a comprehensive look at what lies ahead in the age of intelligent machines. A must-read for anyone curious about the future.";

    useEffect(() => {
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(summaryText);
        utteranceRef.current = u;

        u.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };
        
        // Cleanup on component unmount
        return () => {
            synth.cancel();
        };
    }, [summaryText]);

    const handlePlay = () => {
        const synth = window.speechSynthesis;
        if (!utteranceRef.current) return;

        if (isPaused) {
            synth.resume();
        } else {
            synth.cancel(); // Cancel any previous speech
            synth.speak(utteranceRef.current);
        }
        setIsSpeaking(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        const synth = window.speechSynthesis;
        synth.pause();
        setIsSpeaking(false);
        setIsPaused(true);
    };

    const handleStop = () => {
        const synth = window.speechSynthesis;
        synth.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    if (!featuredBook) return null;
    
    const author = context?.users.find(u => u.id === featuredBook.authorId)?.name || 'Unknown Author';

    return (
        <section className="bg-gradient-to-tr from-indigo-50 dark:from-indigo-900/50 via-white dark:via-slate-800 to-indigo-50 dark:to-indigo-900/50 p-6 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700 animate-fade-in-up">
            <h2 className="text-2xl font-bold font-serif mb-4 flex items-center text-slate-800 dark:text-slate-100">
                <SparklesIcon className="mr-3 text-indigo-500 h-7 w-7 animate-ai-glow" />
                AI Feature Spotlight: Audio Summary
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
                <img src={featuredBook.coverImage} alt={featuredBook.title} className="w-48 h-64 object-cover rounded-lg shadow-xl flex-shrink-0" />
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{featuredBook.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">by {author}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{summaryText}</p>
                    
                    <div className="flex items-center space-x-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                        <AINarratorIcon className="h-16 w-16 text-slate-400" isSpeaking={isSpeaking} />
                        <div className="flex items-center space-x-4">
                            {!isSpeaking && !isPaused ? (
                                <button onClick={handlePlay} className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-transform hover:scale-110" aria-label="Play Summary">
                                    <PlayIcon className="h-8 w-8" />
                                </button>
                            ) : (
                                <>
                                    {isSpeaking ? (
                                        <button onClick={handlePause} className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-transform hover:scale-110" aria-label="Pause Summary">
                                            <PauseIcon className="h-8 w-8" />
                                        </button>
                                    ) : (
                                         <button onClick={handlePlay} className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-transform hover:scale-110" aria-label="Resume Summary">
                                            <PlayIcon className="h-8 w-8" />
                                        </button>
                                    )}
                                    <button onClick={handleStop} className="p-3 bg-slate-500 text-white rounded-full shadow-lg hover:bg-slate-400 transition-transform hover:scale-110" aria-label="Stop Summary">
                                        <StopIcon className="h-6 w-6" />
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {isSpeaking ? 'Narrating...' : (isPaused ? 'Paused' : 'Listen to the AI Summary')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedBookSummary;
