import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { CheckIcon, BookOpenIcon } from '../components/icons';
import PaymentModal from '../components/PaymentModal';

interface PlanDetails {
    name: string;
    price: number;
    cycle: 'monthly' | 'yearly';
    description: string;
    features: string[];
    isPopular?: boolean;
}

interface SubscriptionPageProps {
    user: User;
    onComplete: (user: User, plan: PlanDetails) => void;
    onSkip: () => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ user, onComplete, onSkip }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);

    const readerPlan = {
        name: `Plus Pack ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
        price: billingCycle === 'monthly' ? 849 : 8499,
        cycle: billingCycle,
        description: billingCycle === 'monthly' ? 'Read without limits' : 'Best value for avid readers',
        features: [
            'Unlimited reading access',
            'Purchase and own books',
            'Write and view reviews',
            'Early access to new arrivals'
        ],
        isPopular: true,
    };
    
    const proPlan = {
        name: 'Pro Pass',
        price: 999,
        cycle: 'yearly' as const,
        description: 'For authors and publishers.',
        features: [
            'AI-powered book recommendations',
            'Adaptive UI & personalized dashboards',
            'Automated review moderation with NLP',
            'ML-based insights on trends & engagement'
        ],
        // Fix: Added isPopular property to ensure consistent object shape in plansToShow array.
        isPopular: false,
    };

    const handleSelectPlan = (plan: PlanDetails) => {
        setSelectedPlan(plan);
    };

    const handlePaymentSuccess = () => {
        if (selectedPlan) {
            onComplete(user, selectedPlan);
        }
        setSelectedPlan(null);
    };
    
    const plansToShow = [readerPlan, proPlan];
    
    const paymentItem = selectedPlan ? {
        type: 'Subscription' as const,
        name: selectedPlan.name,
        description: `Billed ${selectedPlan.cycle}`,
        price: selectedPlan.price
    } : null;


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-500">
            <div className="absolute top-8 left-8 flex items-center space-x-3">
                <BookOpenIcon className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-white">E-Gyan Parija</h1>
            </div>
            <div className="text-center max-w-3xl mx-auto animate-fade-in-down">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-50 mb-4">Welcome, {user.name}!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-10 text-lg">
                   One last step. Choose a plan to unlock the full potential of your account.
                </p>
            </div>

            <div className="flex justify-center items-center mb-10 space-x-4 animate-fade-in-up">
                <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Monthly</span>
                <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="relative inline-flex h-7 w-14 items-center rounded-full bg-slate-300 dark:bg-slate-700">
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white dark:bg-slate-900 shadow-md transition ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className={`font-semibold ${billingCycle === 'yearly' ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Yearly <span className="text-sm text-green-500 dark:text-green-400 font-bold">(Save 17%)</span></span>
            </div>
            
             <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 animate-fade-in-up [animation-delay:200ms]">
                {plansToShow.map(plan => (
                    <div key={plan.name} className={`bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border w-full max-w-sm flex flex-col ${plan.isPopular ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{plan.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 flex-grow">{plan.description}</p>
                        <p className="text-5xl font-bold text-slate-900 dark:text-white my-6">
                            ₹{plan.price}
                            <span className="text-base font-medium text-slate-500 dark:text-slate-400">/{plan.cycle === 'yearly' ? 'year' : 'month'}</span>
                        </p>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-300 text-sm mb-8">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-start"><CheckIcon className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0"/><span>{feature}</span></li>
                            ))}
                        </ul>
                        <button onClick={() => handleSelectPlan(plan)} className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105">
                            Get Started
                        </button>
                    </div>
                ))}
            </div>
            
            <button onClick={onSkip} className="mt-12 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Skip for now
            </button>
            
            <PaymentModal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                item={paymentItem}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default SubscriptionPage;