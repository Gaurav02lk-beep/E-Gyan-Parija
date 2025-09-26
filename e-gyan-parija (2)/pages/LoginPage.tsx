import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { UserRole } from '../types';
import { EnvelopeIcon, LockClosedIcon, UserIcon as UserNameIcon, XMarkIcon, BookOpenIcon, EyeIcon, EyeSlashIcon } from '../components/icons';

interface LoginPageProps {
    isOpen: boolean;
    onClose: () => void;
}

const InputField: React.FC<{
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    rightIcon?: React.ReactNode;
}> = ({ icon, type, placeholder, value, onChange, required = true, rightIcon }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
        </div>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-12 py-3 bg-white/10 text-white border border-slate-300/30 rounded-lg shadow-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            required={required}
        />
        {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {rightIcon}
            </div>
        )}
    </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.READER);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Reset state when switching between login/register or when modal opens
    useEffect(() => {
        setError('');
        setPasswordError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setRole(UserRole.READER);
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, [isRegister, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setPasswordError('');
        let success = false;
        if (isRegister) {
            if (!name || !email || !password || !confirmPassword) {
                setError("All fields are required for registration.");
                return;
            }
            if (password !== confirmPassword) {
                setPasswordError("Passwords do not match.");
                return;
            }
            success = context?.register(name, email, role) ?? false;
            if (!success) setError("An account with this email already exists.");
        } else {
            success = context?.login(email, password) ?? false;
            if (!success) setError("Invalid email or password.");
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 rounded-2xl shadow-2xl w-full max-w-md m-4 text-white animate-fade-in-down border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <BookOpenIcon className="h-12 w-12 mx-auto text-indigo-300 mb-2"/>
                        <h2 className="text-3xl font-bold font-serif">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                        <p className="text-slate-300 mt-1">{isRegister ? 'Join our community of readers and creators.' : 'Sign in to continue your journey.'}</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isRegister && (
                            <>
                                <InputField
                                    icon={<UserNameIcon className="h-5 w-5 text-slate-300" />}
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <div className="text-sm">
                                    <p className="text-slate-200 mb-2">I am a...</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[UserRole.READER, UserRole.AUTHOR, UserRole.PUBLISHER, UserRole.ADMIN].map(r => (
                                            <button 
                                                type="button" 
                                                key={r}
                                                onClick={() => setRole(r)}
                                                className={`flex-1 py-2 px-3 rounded-md font-semibold transition-colors min-w-[5rem] ${role === r ? 'bg-white/90 text-indigo-700 shadow-md' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        <InputField
                            icon={<EnvelopeIcon className="h-5 w-5 text-slate-300" />}
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <InputField
                            icon={<LockClosedIcon className="h-5 w-5 text-slate-300" />}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (passwordError) setPasswordError('');
                            }}
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            }
                        />
                         {isRegister && (
                            <div>
                                <InputField
                                    icon={<LockClosedIcon className="h-5 w-5 text-slate-300" />}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (passwordError) setPasswordError('');
                                    }}
                                    rightIcon={
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-300 hover:text-white" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                                            {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                        </button>
                                    }
                                />
                                {passwordError && <p className="text-red-300 text-sm mt-2 text-center font-semibold">{passwordError}</p>}
                            </div>
                        )}
                        
                        {error && <p className="text-red-300 bg-red-900/50 p-3 rounded-lg text-sm font-semibold text-center">{error}</p>}
                        
                        <button type="submit" className="w-full bg-white/90 hover:bg-white text-indigo-700 font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105 shadow-lg">
                            {isRegister ? 'Register' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-slate-300 hover:text-white transition-colors">
                            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;