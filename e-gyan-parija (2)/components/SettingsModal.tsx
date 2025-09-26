
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { UserPreferences } from '../types';
import { XMarkIcon, SunIcon, MoonIcon, UserCircleIcon, EyeIcon, KeyIcon, SparklesIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TabButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-left ${
            isActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ThemeToggle: React.FC<{
    preferences: UserPreferences;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}> = ({ preferences, setPreferences }) => {
    const isDark = preferences.theme === 'dark';
    const toggleTheme = () => {
        setPreferences(prev => ({...prev, theme: isDark ? 'light' : 'dark'}));
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-8 w-14 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
        >
            <span className={`absolute left-1 transition-transform transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
                {isDark ? <MoonIcon className="h-6 w-6 text-indigo-400" /> : <SunIcon className="h-6 w-6 text-yellow-500" />}
            </span>
        </button>
    );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('appearance');
    
    if (!isOpen || !context) return null;

    const { preferences, setPreferences, currentUser } = context;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 relative max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Preferences</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white rounded-full p-1">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex p-6 space-x-8">
                    <aside className="w-1/4">
                        <nav className="flex flex-col space-y-2">
                            <TabButton label="Appearance" icon={<EyeIcon className="h-5 w-5" />} isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                            <TabButton label="Accessibility" icon={<SparklesIcon className="h-5 w-5" />} isActive={activeTab === 'accessibility'} onClick={() => setActiveTab('accessibility')} />
                            <TabButton label="Account" icon={<UserCircleIcon className="h-5 w-5" />} isActive={activeTab === 'account'} onClick={() => setActiveTab('account')} />
                            <TabButton label="Security" icon={<KeyIcon className="h-5 w-5" />} isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                        </nav>
                    </aside>
                    <main className="w-3/4">
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Appearance</h3>
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-100">Interface Theme</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Select a light or dark theme.</p>
                                    </div>
                                    <ThemeToggle preferences={preferences} setPreferences={setPreferences} />
                                </div>
                            </div>
                        )}
                         {activeTab === 'accessibility' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Accessibility</h3>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                    <p className="font-medium text-slate-800 dark:text-slate-100 mb-2">Font Size</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Adjust the font size for comfortable reading.</p>
                                    <div className="flex space-x-2 p-1 bg-slate-200 dark:bg-slate-600 rounded-lg">
                                        {(['sm', 'base', 'lg'] as const).map(size => (
                                            <button 
                                                key={size}
                                                onClick={() => setPreferences(prev => ({...prev, fontSize: size}))}
                                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${preferences.fontSize === size ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                {size.charAt(0).toUpperCase() + size.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Account</h3>
                                {currentUser && (
                                <form className="space-y-4">
                                     <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                                        <input type="text" defaultValue={currentUser.name} className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Email Address</label>
                                        <input type="email" defaultValue={currentUser.email} className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" onClick={(e) => { e.preventDefault(); onClose(); }} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Save Changes</button>
                                    </div>
                                </form>
                                )}
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Security</h3>
                                <form className="space-y-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">For security reasons, this is a mock form.</p>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Current Password</label>
                                        <input type="password" placeholder="••••••••" className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">New Password</label>
                                        <input type="password" placeholder="••••••••" className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" onClick={(e) => { e.preventDefault(); onClose(); }} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Update Password</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
