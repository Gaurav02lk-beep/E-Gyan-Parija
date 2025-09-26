import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { BookOpenIcon, UserCircleIcon, LogoutIcon, Cog6ToothIcon, ChevronDownIcon } from '../components/icons';
import { SubscriptionStatus, UserRole } from '../types';

interface HeaderProps {
    onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
    const context = useContext(AppContext);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userSubscription = useMemo(() => {
        if (!context || !context.currentUser) return null;
        return context.subscriptions.find(sub => sub.userId === context.currentUser!.id && sub.status === SubscriptionStatus.ACTIVE);
    }, [context?.subscriptions, context?.currentUser]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);


    return (
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <BookOpenIcon className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-white">E-Gyan Parija</h1>
                </div>
                <nav>
                    {context?.currentUser ? (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <UserCircleIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                <div className="text-left text-sm hidden sm:block">
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{context.currentUser.name}</span>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">{context.currentUser.role}</p>
                                </div>
                                <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 overflow-hidden animate-fade-in-down">
                                    <div className="p-4 border-b dark:border-slate-700">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{context.currentUser.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{context.currentUser.email}</p>
                                         {(context.currentUser.role === UserRole.READER || context.currentUser.role === UserRole.GUEST) && userSubscription && (
                                            <div className="mt-2">
                                                <span className="font-semibold text-indigo-700 dark:text-indigo-400 capitalize bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full text-xs">
                                                    {userSubscription.plan} Plan
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <ul>
                                        <li>
                                            <button onClick={() => { context.openMyAccountModal(); setDropdownOpen(false); }} className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                <UserCircleIcon className="h-5 w-5"/>
                                                <span>My Account</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => { context.openSettingsModal(); setDropdownOpen(false); }} className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                <Cog6ToothIcon className="h-5 w-5"/>
                                                <span>Preferences</span>
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => { context.logout(); setDropdownOpen(false); }} className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                <LogoutIcon className="h-5 w-5"/>
                                                <span>Logout</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4 md:space-x-8">
                            <ul className="hidden md:flex items-center space-x-8">
                                <li><a href="#about" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</a></li>
                                <li><a href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a></li>
                                <li><a href="#testimonials" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Testimonials</a></li>
                                <li><a href="#pricing" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a></li>
                            </ul>
                            <button
                                onClick={onLoginClick}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition-transform hover:scale-105"
                            >
                                Login / Register
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;