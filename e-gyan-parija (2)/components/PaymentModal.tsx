
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, UpiIcon, PaypalIcon, CheckCircleIcon } from './icons';
import Spinner from './Spinner';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        type: 'Book' | 'Subscription';
        name: string;
        description: string;
        price: number;
        coverImage?: string;
    } | null;
    onSuccess: () => void;
}

type PaymentMethod = 'card' | 'upi' | 'paypal';

const PaymentTab: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center p-3 space-x-2 text-sm font-semibold rounded-t-lg transition-colors ${isActive ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, item, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<PaymentMethod>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsProcessing(false);
            setIsSuccess(false);
            setActiveTab('card');
        }
    }, [isOpen]);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            onSuccess();
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl m-4 relative max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white z-20 bg-white/50 dark:bg-slate-700/50 rounded-full p-1"><XMarkIcon /></button>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <CheckCircleIcon className="h-24 w-24 text-green-500 mb-6"/>
                        <h2 className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-100">
                            {item.type === 'Book' ? 'Payment Successful!' : 'Subscription Activated!'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mt-2">
                           {item.type === 'Book' ? `You now own "${item.name}".` : `Welcome! Your "${item.name}" plan is now active.`}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                           {item.type === 'Book' ? 'You can find it on your dashboard to read or download.' : 'You can now access all the features.'}
                        </p>
                        <button onClick={onClose} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105">
                            Continue
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center text-center">
                            {item.coverImage && <img src={item.coverImage} alt={item.name} className="w-48 aspect-[3/4] object-cover rounded-lg shadow-2xl mb-6" />}
                            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{item.name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">{item.description}</p>
                            <div className="text-4xl font-bold text-slate-900 dark:text-slate-50 bg-indigo-100 dark:bg-indigo-900/50 rounded-full px-6 py-2">
                                ₹{item.price}
                            </div>
                        </div>

                        <div className="p-8 flex flex-col">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Complete Your Purchase</h3>
                            <div className="flex">
                                <PaymentTab icon={<CreditCardIcon className="h-5 w-5"/>} label="Card" isActive={activeTab === 'card'} onClick={() => setActiveTab('card')} />
                                <PaymentTab icon={<UpiIcon className="h-5 w-5"/>} label="UPI" isActive={activeTab === 'upi'} onClick={() => setActiveTab('upi')} />
                                <PaymentTab icon={<PaypalIcon className="h-5 w-5"/>} label="PayPal" isActive={activeTab === 'paypal'} onClick={() => setActiveTab('paypal')} />
                            </div>
                            <form onSubmit={handlePayment} className="bg-white dark:bg-slate-800 p-6 rounded-b-lg border-x border-b border-slate-200 dark:border-slate-700 flex-grow">
                                {activeTab === 'card' && (
                                    <div className="space-y-4">
                                        <input type="text" placeholder="Card Number" className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400" required />
                                        <input type="text" placeholder="Cardholder Name" className="w-full p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400" required />
                                        <div className="flex space-x-4">
                                            <input type="text" placeholder="MM/YY" className="w-1/2 p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400" required />
                                            <input type="text" placeholder="CVC" className="w-1/2 p-3 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400" required />
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'upi' && (
                                    <div className="space-y-4 text-center">
                                         <p className="text-slate-600 dark:text-slate-300">Enter your UPI ID to receive a payment request.</p>
                                        <input type="text" placeholder="yourname@bank" className="w-full p-3 border rounded-md text-center dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400" required />
                                         <p className="text-xs text-slate-500 dark:text-slate-400">Supports Google Pay, PhonePe, and more.</p>
                                    </div>
                                )}
                                {activeTab === 'paypal' && (
                                    <div className="text-center">
                                        <p className="text-slate-600 dark:text-slate-300 mb-4">You will be redirected to PayPal to complete your payment securely.</p>
                                        <button type="submit" className="w-full bg-[#FFC439] hover:bg-[#FDBA26] text-[#003087] font-bold py-3 px-4 rounded-md">
                                            Pay with PayPal
                                        </button>
                                    </div>
                                )}
                                 <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition disabled:bg-indigo-400 flex justify-center items-center space-x-2">
                                    {isProcessing ? <Spinner size="sm" /> : <span>Pay ₹{item.price}</span>}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
