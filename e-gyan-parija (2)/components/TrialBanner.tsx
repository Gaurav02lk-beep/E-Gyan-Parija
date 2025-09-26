import React, { useContext } from 'react';
import { AppContext } from '../App';
import { SubscriptionStatus } from '../types';
import { ClockIcon } from './icons';

const TrialBanner: React.FC = () => {
    const context = useContext(AppContext);
    const { currentUser, openSubscriptionModal } = context || {};

    if (!currentUser || currentUser.subscriptionStatus !== SubscriptionStatus.TRIAL || !currentUser.trialStartDate) {
        return null;
    }

    const trialStartDate = new Date(currentUser.trialStartDate);
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 15);
    const now = new Date();

    const remainingTime = trialEndDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

    if (remainingDays <= 0) {
        return null;
    }

    const handleSubscribeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        openSubscriptionModal?.();
    }

    return (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-r-lg shadow-md mb-8 flex items-center space-x-4 animate-fade-in-down">
            <ClockIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <div>
                <p className="font-bold">You are in Trial Mode.</p>
                <p className="text-sm">You have <span className="font-bold">{remainingDays} {remainingDays === 1 ? 'day' : 'days'}</span> left in your trial. <a href="#" onClick={handleSubscribeClick} className="underline font-semibold hover:text-yellow-600 dark:hover:text-yellow-100">Subscribe now</a> to unlock all features.</p>
            </div>
        </div>
    );
};

export default TrialBanner;
