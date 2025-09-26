
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { RobotIcon, XMarkIcon, PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons';
import Spinner from './Spinner';
import { getChatbotResponse } from '../services/geminiService';
import { UserRole } from '../types';
import { Content } from "@google/genai";

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
    const context = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ text: "Hello! I'm your AI assistant. How can I help you navigate E-Gyan Parija today?", sender: 'bot' }]);
        }
    }, [isOpen, messages.length]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const role = context?.currentUser?.role || UserRole.GUEST;
            const history: Content[] = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            const botResponseText = await getChatbotResponse(inputValue, role, history);
            const botMessage: Message = { text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: Message = { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-50"
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? <XMarkIcon className="h-7 w-7"/> : <RobotIcon className="h-7 w-7" />}
            </button>
            <div
                className={`fixed bottom-24 right-6 w-[90vw] max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out z-50 ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
            >
                <header className="flex items-center justify-between p-4 border-b dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-indigo-500"/>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">AI Assistant</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </header>

                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                             {msg.sender === 'bot' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center"><RobotIcon className="h-5 w-5 text-indigo-500"/></div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${
                                msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-lg' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'
                            }`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center"><RobotIcon className="h-5 w-5 text-indigo-500"/></div>
                            <div className="max-w-[80%] p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 rounded-bl-lg">
                                <div className="flex items-center space-x-1">
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t dark:border-slate-700 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask me anything..."
                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </form>
                </footer>
            </div>
        </>
    );
};

export default Chatbot;
