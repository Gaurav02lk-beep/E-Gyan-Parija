
import React, { useState } from 'react';
import { BookOpenIcon, InstagramIcon, FacebookIcon, TwitterIcon } from '../components/icons';

const Footer: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        console.log({ name, email, message });
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <footer id="contact" className="bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-12">
                    
                    {/* Branding & Mission */}
                    <div className="md:col-span-4 lg:col-span-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <BookOpenIcon className="h-8 w-8 text-indigo-600" />
                            <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-white">E-Gyan Parija</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                           E-Gyan Parija is dedicated to revolutionizing digital reading. We provide an intelligent platform that empowers readers, supports authors, and streamlines publishing.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wider uppercase mb-4">Navigation</h3>
                        <ul className="space-y-3">
                            <li><a href="#about" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">About Us</a></li>
                            <li><a href="#features" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">Features</a></li>
                            <li><a href="#testimonials" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">Testimonials</a></li>
                            <li><a href="#pricing" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">Pricing</a></li>
                            <li><a href="#contact" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">Contact</a></li>
                        </ul>
                    </div>
                    
                    {/* Social Links */}
                     <div className="lg:col-span-2">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wider uppercase mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"><span className="sr-only">Instagram</span><InstagramIcon className="h-6 w-6"/></a>
                            <a href="#" className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"><span className="sr-only">Facebook</span><FacebookIcon className="h-6 w-6"/></a>
                            <a href="#" className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"><span className="sr-only">Twitter</span><TwitterIcon className="h-6 w-6"/></a>
                        </div>
                    </div>
                    
                    {/* Contact Form */}
                    <div className="md:col-span-4 lg:col-span-4">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-wider uppercase mb-4">Contact Us</h3>
                        {submitted ? (
                            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm font-semibold p-4 rounded-lg">
                                Thank you for your suggestion!
                            </div>
                        ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full text-sm px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                            <textarea placeholder="Your suggestion..." value={message} onChange={e => setMessage(e.target.value)} required rows={3} className="w-full text-sm px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">
                                Send Suggestion
                            </button>
                        </form>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs">
                    <p>&copy; {new Date().getFullYear()} E-Gyan Parija made with ❤️ Team SSBG. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;