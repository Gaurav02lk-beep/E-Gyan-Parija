
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../App';
import { UserRole, ApprovalStatus } from '../types';
import { XMarkIcon, UserIcon, KeyIcon, CreditCardIcon, ClockIcon, BookOpenIcon, CurrencyDollarIcon, BuildingLibraryIcon, UsersIcon, StarIcon, ChartBarIcon } from './icons';

interface MyAccountModalProps {
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
        className={`flex items-center space-x-3 w-full px-4 py-3 text-left text-sm font-semibold rounded-lg transition-colors ${
            isActive 
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const InfoRow: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-slate-800 dark:text-slate-100">{value}</p>
    </div>
);

const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
    const statusMap = {
        [ApprovalStatus.APPROVED]: { text: 'Approved', color: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30' },
        [ApprovalStatus.PENDING]: { text: 'Pending', color: 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30' },
        [ApprovalStatus.REJECTED]: { text: 'Rejected', color: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30' },
    };
    const { text, color } = statusMap[status];
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{text}</span>;
};


const MyAccountModal: React.FC<MyAccountModalProps> = ({ isOpen, onClose }) => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('profile');
    
    const { currentUser, subscriptions, books, reviews, users } = context || {};

    const userSubscription = useMemo(() => {
        if (!currentUser) return null;
        return subscriptions?.find(sub => sub.userId === currentUser.id);
    }, [subscriptions, currentUser]);

    const purchasedBooks = useMemo(() => {
        if(!currentUser || !books) return [];
        return books.filter(book => currentUser.purchasedBookIds.includes(book.id));
    }, [books, currentUser]);
    
    const authorBooks = useMemo(() => {
        if(!currentUser || !books) return [];
        return books.filter(book => book.authorId === currentUser.id);
    }, [books, currentUser]);
    
    const publisherApprovedBooks = useMemo(() => {
        if(!books) return [];
        return books.filter(b => b.approvalStatus === ApprovalStatus.APPROVED);
    }, [books]);
    
    const platformAuthors = useMemo(() => {
        if(!users) return [];
        return users.filter(u => u.role === UserRole.AUTHOR);
    }, [users]);
    
    const reviewerReviews = useMemo(() => {
        if(!currentUser || !reviews) return [];
        return reviews.filter(r => r.userId === currentUser.id);
    }, [reviews, currentUser]);


    if (!isOpen || !currentUser) return null;
    
    const TABS: {[key in UserRole]: {id: string, label: string, icon: React.ReactNode}[]} = {
        [UserRole.GUEST]: [
            { id: 'profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
            { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon className="h-5 w-5" /> },
            { id: 'security', label: 'Security', icon: <KeyIcon className="h-5 w-5" /> },
        ],
        [UserRole.READER]: [
            { id: 'profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
            { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon className="h-5 w-5" /> },
            { id: 'purchaseHistory', label: 'Purchase History', icon: <ClockIcon className="h-5 w-5" /> },
            { id: 'security', label: 'Security', icon: <KeyIcon className="h-5 w-5" /> },
        ],
        [UserRole.AUTHOR]: [
            { id: 'profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
            { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon className="h-5 w-5" /> },
            { id: 'myBooks', label: 'My Books', icon: <BookOpenIcon className="h-5 w-5" /> },
            { id: 'earnings', label: 'Earnings', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
            { id: 'security', label: 'Security', icon: <KeyIcon className="h-5 w-5" /> },
        ],
        [UserRole.PUBLISHER]: [
            { id: 'profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
            { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon className="h-5 w-5" /> },
            { id: 'publishedBooks', label: 'Published Books', icon: <BuildingLibraryIcon className="h-5 w-5" /> },
            { id: 'authorManagement', label: 'Author Management', icon: <UsersIcon className="h-5 w-5" /> },
            { id: 'security', label: 'Security', icon: <KeyIcon className="h-5 w-5" /> },
        ],
        [UserRole.REVIEWER]: [
            { id: 'profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
            { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon className="h-5 w-5" /> },
            { id: 'myReviews', label: 'My Reviews', icon: <StarIcon className="h-5 w-5" /> },
            { id: 'security', label: 'Security', icon: <KeyIcon className="h-5 w-5" /> },
        ],
        [UserRole.ADMIN]: [
            { id: 'profile', label: 'Profile', icon: <UserIcon className="h-5 w-5" /> },
            { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon className="h-5 w-5" /> },
            { id: 'platformOverview', label: 'Platform Overview', icon: <ChartBarIcon className="h-5 w-5" /> },
            { id: 'userManagement', label: 'User Management', icon: <UsersIcon className="h-5 w-5" /> },
            { id: 'security', label: 'Security', icon: <KeyIcon className="h-5 w-5" /> },
        ]
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'profile':
                return (
                    <div className="space-y-4">
                        <InfoRow label="Full Name" value={currentUser.name} />
                        <InfoRow label="Email Address" value={currentUser.email} />
                        <InfoRow label="User Role" value={currentUser.role} />
                        <InfoRow label="Member Since" value={new Date(currentUser.registeredDate).toLocaleDateString()} />
                    </div>
                );
            case 'security':
                return (
                    <form className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">For security reasons, this is a mock form.</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Current Password</label>
                            <input type="password" placeholder="••••••••" className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">New Password</label>
                            <input type="password" placeholder="••••••••" className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                        </div>
                         <div className="pt-2">
                            <button type="submit" onClick={(e) => { e.preventDefault(); onClose(); }} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Update Password</button>
                        </div>
                    </form>
                );
            // Reader/Guest specific tabs
            case 'subscription':
                return userSubscription ? (
                    <div className="space-y-4">
                        <InfoRow label="Plan" value={userSubscription.plan.charAt(0).toUpperCase() + userSubscription.plan.slice(1)} />
                        <InfoRow label="Status" value={userSubscription.status} />
                        <InfoRow label="Start Date" value={new Date(userSubscription.startDate).toLocaleDateString()} />
                        <InfoRow label="End Date" value={new Date(userSubscription.endDate).toLocaleDateString()} />
                         <div className="pt-2">
                            <button className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Manage Subscription</button>
                        </div>
                    </div>
                ) : <p className="text-slate-500 dark:text-slate-400">No active subscription found.</p>;
            case 'purchaseHistory':
                 return purchasedBooks.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {purchasedBooks.map(book => (
                            <div key={book.id} className="flex items-center space-x-4 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded-md flex-shrink-0"/>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{book.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{book.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : <p className="text-slate-500 dark:text-slate-400">You haven't purchased any books yet.</p>;
            
            // Author specific tabs
            case 'myBooks':
                 return authorBooks.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {authorBooks.map(book => (
                            <div key={book.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{book.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Uploaded: {new Date(book.uploadDate).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={book.approvalStatus} />
                            </div>
                        ))}
                    </div>
                 ) : <p className="text-slate-500 dark:text-slate-400">You haven't submitted any books.</p>;
            case 'earnings':
                return <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">Total Earnings (This Month)</p>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-200 mt-2">$1,234.56</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Next payout on 15th of next month.</p>
                </div>;

            // Publisher specific tabs
            case 'publishedBooks':
                return publisherApprovedBooks.length > 0 ? (
                     <div className="space-y-2 max-h-96 overflow-y-auto">
                        {publisherApprovedBooks.map(b => (
                            <div key={b.id} className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="font-semibold">{b.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">by {users?.find(u=>u.id === b.authorId)?.name || 'N/A'}</p>
                            </div>
                        ))}
                     </div>
                ) : null;
            case 'authorManagement':
                return platformAuthors.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                       {platformAuthors.map(author => (
                           <div key={author.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                               <div>
                                   <p className="font-semibold">{author.name}</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400">{author.email}</p>
                               </div>
                               <p className="text-sm font-medium">{books?.filter(b=>b.authorId === author.id).length} books</p>
                           </div>
                       ))}
                    </div>
                ) : null;

            // Reviewer specific tab
            case 'myReviews':
                return reviewerReviews.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {reviewerReviews.map(review => (
                             <div key={review.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                 <div className="flex justify-between items-start">
                                    <p className="font-semibold">{books?.find(b=>b.id === review.bookId)?.title || 'Unknown Book'}</p>
                                    <p className="text-sm font-bold text-yellow-500">{'★'.repeat(review.rating)}</p>
                                 </div>
                                 <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 italic">"{review.comment}"</p>
                             </div>
                        ))}
                    </div>
                ) : <p>You have not submitted any reviews.</p>

            // Admin specific tabs
            case 'platformOverview':
                return <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-center"><p className="text-2xl font-bold">{users?.length}</p><p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p></div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-center"><p className="text-2xl font-bold">{books?.length}</p><p className="text-sm text-slate-500 dark:text-slate-400">Total Books</p></div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-center"><p className="text-2xl font-bold">{subscriptions?.length}</p><p className="text-sm text-slate-500 dark:text-slate-400">Total Subscriptions</p></div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-center"><p className="text-2xl font-bold">{books?.filter(b=>b.approvalStatus === 'Pending').length}</p><p className="text-sm text-slate-500 dark:text-slate-400">Pending Approvals</p></div>
                </div>
            case 'userManagement':
                return <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-slate-800">
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-2">Name</th>
                                <th className="p-2">Role</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map(user => (
                                <tr key={user.id} className="border-b dark:border-slate-700">
                                    <td className="p-2 font-medium">{user.name}</td>
                                    <td className="p-2">{user.role}</td>
                                    <td className="p-2">{user.subscriptionStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            default: return null;
        }
    }

    const currentTabs = TABS[currentUser.role];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl m-4 relative max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Account</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white rounded-full p-1">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex p-6 space-x-8 flex-grow overflow-hidden">
                    <aside className="w-1/4 flex-shrink-0">
                        <nav className="flex flex-col space-y-2">
                            {currentTabs.map(tab => (
                                <TabButton 
                                    key={tab.id}
                                    label={tab.label} 
                                    icon={tab.icon}
                                    isActive={activeTab === tab.id} 
                                    onClick={() => setActiveTab(tab.id)} />
                            ))}
                        </nav>
                    </aside>
                    <main className="w-3/4 flex-grow overflow-y-auto pr-2">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">{currentTabs.find(t => t.id === activeTab)?.label}</h3>
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MyAccountModal;