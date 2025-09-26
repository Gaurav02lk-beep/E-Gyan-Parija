import React, { useState } from 'react';
import { BookOpenIcon, PencilSquareIcon, BuildingStorefrontIcon, CheckIcon, QuoteIcon } from '../components/icons';

interface LandingPageProps {
  onLoginClick: () => void;
}

const testimonials = [
    {
        quote: "E-Gyan Parija has completely transformed my reading habits. The AI recommendations are spot-on and I've discovered so many hidden gems!",
        name: "Sanjib sahu",
        title: "Avid Reader",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    },
    {
        quote: "As an author, the submission process is seamless. The AI keyword suggestions are a game-changer for visibility. Highly recommended.",
        name: "Sai yagyadutta sethy",
        title: "Sci-Fi Author",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e"
    },
    {
        quote: "Managing our catalog has never been easier. The publisher dashboard provides incredible insights and simplifies our entire workflow.",
        name: "Bholasankar Sethi",
        title: "Publisher, Nova Press",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f"
    },
];

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-0 -mt-16 overflow-x-hidden">
        {/* Section 1: Hero */}
        <section id="about" className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
            <div 
                className="absolute inset-0 h-full w-full bg-cover bg-center animate-ken-burns"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto.format&fit=crop')" }}
            ></div>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-brightness-75"></div>
            <div className="relative z-10 container mx-auto px-4">
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-fade-in-down drop-shadow-xl">
                    Discover a Universe of Stories.
                </h1>
                <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 animate-fade-in-down [animation-delay:200ms]" style={{ opacity: 0 }}>
                    Your centralized and intelligent digital library. Access a world of knowledge with features tailored for readers, authors, and publishers.
                </p>
                <button
                    onClick={onLoginClick}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full text-lg transition-all shadow-lg shadow-indigo-500/50 animate-subtle-pulse [animation-delay:400ms]"
                >
                    Start Exploring Now
                </button>
            </div>
        </section>
        
        {/* Section 2: Features */}
        <section id="features" className="relative py-20 md:py-28 bg-slate-50 dark:bg-slate-900">
            <div className="container mx-auto px-4 animate-fade-in-up" style={{ opacity: 0 }}>
                 <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-4">A Platform for Everyone</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-16 text-lg">
                        E-Gyan Parija is crafted to provide a seamless and powerful experience for every member of the literary world.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-slate-200/80 dark:border-slate-700/50 group hover:shadow-indigo-500/20">
                        <div className="flex-shrink-0 flex justify-center items-center h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-200">
                            <BookOpenIcon className="h-8 w-8"/>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">For Readers</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Dive into a vast library, enjoy AI-powered recommendations, track your progress, and listen with text-to-speech summaries.</p>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-slate-200/80 dark:border-slate-700/50 group hover:shadow-indigo-500/20">
                        <div className="flex-shrink-0 flex justify-center items-center h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-200">
                            <PencilSquareIcon className="h-8 w-8"/>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">For Authors</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Easily upload your manuscripts, get AI suggestions for keywords, track your book's performance, and view powerful analytics.</p>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-slate-200/80 dark:border-slate-700/50 group hover:shadow-indigo-500/20">
                        <div className="flex-shrink-0 flex justify-center items-center h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-200">
                            <BuildingStorefrontIcon className="h-8 w-8"/>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">For Publishers</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Manage submissions efficiently, review manuscripts with ease, approve or reject books, and monitor platform-wide analytics.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 3: Testimonials */}
        <section id="testimonials" className="py-20 md:py-28 bg-slate-100 dark:bg-slate-900/70">
             <div className="container mx-auto px-4 animate-fade-in-up [animation-delay:200ms]" style={{ opacity: 0 }}>
                 <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-4">What Our Readers Say</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-16 text-lg">
                        Join a community of thousands who have elevated their literary experience with E-Gyan Parija.
                    </p>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-start">
                            <QuoteIcon className="h-10 w-10 text-indigo-300 dark:text-indigo-600 mb-4" />
                            <p className="text-slate-600 dark:text-slate-200 mb-6 flex-grow">"{testimonial.quote}"</p>
                            <div className="flex items-center space-x-4">
                                <img src={testimonial.avatar} alt={testimonial.name} className="h-12 w-12 rounded-full" />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{testimonial.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>

        {/* Section 4: Subscription Plan Info */}
         <section id="pricing" className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-[length:200%_200%] animate-gradient-pan">
            <div className="absolute inset-0 bg-slate-900/30"></div>
            <div className="relative z-10 container mx-auto px-4 animate-fade-in-up [animation-delay:400ms]" style={{ opacity: 0 }}>
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-lg">Choose Your Perfect Plan</h2>
                    <p className="text-indigo-200 mb-10 text-lg">
                       Simple, transparent pricing to unlock the full potential of E-Gyan Parija.
                    </p>
                </div>
                <div className="flex justify-center items-center mb-10 space-x-4">
                    <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-indigo-200'}`}>Monthly</span>
                    <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="relative inline-flex h-7 w-14 items-center rounded-full bg-indigo-400/50">
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                    <span className={`font-semibold ${billingCycle === 'yearly' ? 'text-white' : 'text-indigo-200'}`}>Yearly <span className="text-sm text-green-300 font-bold">(Save 17%)</span></span>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
                    {/* Guest Plan */}
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/20 h-full flex flex-col transition-transform hover:scale-105 duration-300 text-white">
                        <h3 className="text-xl font-bold">Guest Pass</h3>
                        <p className="text-indigo-200 mt-2 flex-grow">Perfect for a quick look around.</p>
                        <p className="text-5xl font-bold my-6">Free</p>
                        <ul className="space-y-3 text-indigo-200 text-sm mb-8">
                            <li className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-green-300 flex-shrink-0"/><span>Access a limited selection of books</span></li>
                            <li className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-green-300 flex-shrink-0"/><span>Read previews of books</span></li>
                            <li className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-green-300 flex-shrink-0"/><span>15-day trial period</span></li>
                        </ul>
                        <button onClick={onLoginClick} className="w-full mt-auto bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors">Get Started</button>
                    </div>

                    {/* Popular Plan */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border-4 border-white/50 relative h-full flex flex-col scale-105 z-10 text-slate-800 dark:text-slate-100">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                             <span className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">Most Popular</span>
                        </div>
                        <h3 className="text-xl font-bold">{billingCycle === 'yearly' ? 'Plus Pack Yearly' : 'Plus Pack Monthly'}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 flex-grow">{billingCycle === 'yearly' ? 'Best value for avid readers' : 'Read without limits'}</p>
                        <p className="text-5xl font-bold text-slate-900 dark:text-white my-6">
                            {billingCycle === 'yearly' ? '₹8,499' : '₹849'}
                            <span className="text-base font-medium text-slate-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                        </p>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-300 text-sm mb-8">
                            <li className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0"/><span>Unlimited reading access</span></li>
                            <li className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0"/><span>Purchase and own books</span></li>
                            <li className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0"/><span>Write and view reviews</span></li>
                             <li className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0"/><span>Early access to new arrivals</span></li>
                        </ul>
                        <button onClick={onLoginClick} className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Sign Up Now</button>
                    </div>
                    
                    {/* Pro Plan (Author/Publisher) */}
                    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/20 h-full flex flex-col transition-transform hover:scale-105 duration-300 text-white">
                        <h3 className="text-xl font-bold">Pro Pass</h3>
                        <p className="text-indigo-200 mt-2">For authors and publishers.</p>
                        <p className="text-5xl font-bold my-6">
                            ₹999
                            <span className="text-base font-medium text-indigo-200"> / year</span>
                        </p>
                        <ul className="space-y-4 text-indigo-200 text-sm mb-8 flex-grow">
                           <li className="flex items-start">
                                <CheckIcon className="h-5 w-5 mr-3 mt-0.5 text-green-300 flex-shrink-0"/>
                                <span>AI-powered book recommendations for readers.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckIcon className="h-5 w-5 mr-3 mt-0.5 text-green-300 flex-shrink-0"/>
                                <span>Adaptive UI & personalized dashboards.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckIcon className="h-5 w-5 mr-3 mt-0.5 text-green-300 flex-shrink-0"/>
                                <span>Automated review moderation with NLP.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckIcon className="h-5 w-5 mr-3 mt-0.5 text-green-300 flex-shrink-0"/>
                                <span>ML-based insights on trends & engagement.</span>
                            </li>
                        </ul>
                        <button onClick={onLoginClick} className="w-full mt-auto bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-colors">Register as Pro</button>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
};

export default LandingPage;