
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import { Book, ApprovalStatus } from '../../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon, DocumentDownloadIcon, ChartBarIcon } from '../../components/icons';
import Modal from '../../components/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Chatbot from '../../components/Chatbot';
import TrialBanner from '../../components/TrialBanner';


const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
    const statusMap = {
        [ApprovalStatus.APPROVED]: { text: 'Approved', icon: <CheckCircleIcon className="h-4 w-4"/>, color: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30' },
        [ApprovalStatus.PENDING]: { text: 'Pending', icon: <ClockIcon className="h-4 w-4"/>, color: 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30' },
        [ApprovalStatus.REJECTED]: { text: 'Rejected', icon: <XCircleIcon className="h-4 w-4"/>, color: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30' },
    };
    const { text, icon, color } = statusMap[status];
    return <span className={`flex items-center space-x-2 text-xs font-medium px-3 py-1 rounded-full ${color}`}>{icon}<span>{text}</span></span>;
};

const TabButton: React.FC<{ label: string; count?: number; isActive: boolean; onClick: () => void; icon?: React.ReactNode }> = ({ label, count, isActive, onClick, icon }) => (
    <button onClick={onClick} className={`relative flex items-center space-x-2 px-4 py-3 font-semibold text-sm transition-colors duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
        {icon}
        <span>{label}</span>
        {typeof count !== 'undefined' && (
            <span className={`px-2 py-0.5 rounded-full text-xs transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{count}</span>
        )}
        {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0px_10px_0px] shadow-indigo-400"></div>}
    </button>
);


const BookSubmissionCard: React.FC<{ book: Book; onApprove: () => void; onReject: () => void; onView: () => void; authorName: string; }> = ({ book, onApprove, onReject, onView, authorName }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 flex flex-col overflow-hidden group animate-fade-in-up transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/20">
        <div className="relative">
            <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <p className="absolute bottom-3 left-4 text-white text-lg font-bold drop-shadow-md">{book.title}</p>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">By <span className="font-medium text-slate-700 dark:text-slate-200">{authorName}</span></p>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 flex-grow">{book.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 grid grid-cols-3 gap-2">
                <button onClick={onView} className="flex items-center justify-center space-x-2 bg-slate-100/70 dark:bg-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-600/50 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 rounded-md transition-all text-sm">
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                </button>
                <button onClick={onApprove} className="flex items-center justify-center space-x-2 bg-green-100/70 dark:bg-green-500/20 hover:bg-green-200/70 dark:hover:bg-green-500/30 text-green-700 dark:text-green-300 font-semibold py-2 px-3 rounded-md transition-all text-sm">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approve</span>
                </button>
                <button onClick={onReject} className="flex items-center justify-center space-x-2 bg-red-100/70 dark:bg-red-500/20 hover:bg-red-200/70 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 font-semibold py-2 px-3 rounded-md transition-all text-sm">
                    <XCircleIcon className="h-4 w-4" />
                    <span>Reject</span>
                </button>
            </div>
        </div>
    </div>
);

const TimeRangeButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/40' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:hover:bg-slate-700'}`}>
        {label}
    </button>
);


const PublisherDashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'pending' | 'processed' | 'analytics'>('pending');
    const [viewingBook, setViewingBook] = useState<Book | null>(null);
    const [timeRange, setTimeRange] = useState<'15d' | 'monthly' | 'yearly'>('monthly');

    if (!context) return null;

    const { books, users, updateBookStatus } = context;

    const pendingBooks = books.filter(b => b.approvalStatus === ApprovalStatus.PENDING) || [];
    const processedBooks = books.filter(b => b.approvalStatus !== ApprovalStatus.PENDING).sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()) || [];

    const analyticsData = useMemo(() => {
        const dataMap = new Map<string, { Approved: number, Rejected: number }>();

        if (timeRange === 'monthly') {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentYear = new Date().getFullYear();
            monthNames.forEach(name => dataMap.set(name, { Approved: 0, Rejected: 0 }));

            processedBooks.forEach(book => {
                if (book.uploadDate.getFullYear() === currentYear) {
                    const monthName = monthNames[book.uploadDate.getMonth()];
                    const entry = dataMap.get(monthName)!;
                    if (book.approvalStatus === ApprovalStatus.APPROVED) entry.Approved++;
                    else if (book.approvalStatus === ApprovalStatus.REJECTED) entry.Rejected++;
                }
            });
        } else if (timeRange === '15d') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (let i = 14; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const name = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dataMap.set(name, { Approved: 0, Rejected: 0 });
            }
             processedBooks.forEach(book => {
                const bookDate = new Date(book.uploadDate);
                const diffTime = today.getTime() - bookDate.getTime();
                if (diffTime >= 0 && diffTime < 15 * 24 * 60 * 60 * 1000) {
                    const name = bookDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if(dataMap.has(name)){
                        const entry = dataMap.get(name)!;
                        if (book.approvalStatus === ApprovalStatus.APPROVED) entry.Approved++;
                        else if (book.approvalStatus === ApprovalStatus.REJECTED) entry.Rejected++;
                    }
                }
            });

        } else if (timeRange === 'yearly') {
             const currentYear = new Date().getFullYear();
             for (let i = 4; i >= 0; i--) {
                const year = currentYear - i;
                dataMap.set(String(year), { Approved: 0, Rejected: 0 });
            }
             processedBooks.forEach(book => {
                const year = book.uploadDate.getFullYear();
                if (dataMap.has(String(year))) {
                    const entry = dataMap.get(String(year))!;
                    if (book.approvalStatus === ApprovalStatus.APPROVED) entry.Approved++;
                    else if (book.approvalStatus === ApprovalStatus.REJECTED) entry.Rejected++;
                }
            });
        }

        return Array.from(dataMap.entries()).map(([name, values]) => ({ name, ...values }));
    }, [processedBooks, timeRange]);

    const handleApproval = (bookId: number, status: ApprovalStatus) => {
        updateBookStatus(bookId, status);
    };
    
    const getAuthorName = (authorId: number) => users.find(u => u.id === authorId)?.name || 'Unknown Author';

    const renderContent = () => {
        switch (activeTab) {
            case 'pending':
                return (
                    <div className="animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Action Required</h2>
                        {pendingBooks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {pendingBooks.map(book => (
                                    <BookSubmissionCard 
                                        key={book.id} 
                                        book={book}
                                        authorName={getAuthorName(book.authorId)}
                                        onView={() => setViewingBook(book)}
                                        onApprove={() => handleApproval(book.id, ApprovalStatus.APPROVED)}
                                        onReject={() => handleApproval(book.id, ApprovalStatus.REJECTED)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50">
                                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                                <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">All caught up!</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">There are no new book submissions awaiting review.</p>
                            </div>
                        )}
                    </div>
                );
            case 'processed':
                return (
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Submission History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200/50 dark:border-slate-700/50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Title</th>
                                        <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Author</th>
                                        <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Upload Date</th>
                                        <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedBooks.map(book => (
                                        <tr key={book.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-white/40 dark:hover:bg-slate-700/50">
                                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{book.title}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{getAuthorName(book.authorId)}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{book.uploadDate.toLocaleDateString()}</td>
                                            <td className="p-3"><StatusBadge status={book.approvalStatus} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Submission Analytics</h2>
                            <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-900/40 rounded-lg">
                               <TimeRangeButton label="Last 15 Days" isActive={timeRange === '15d'} onClick={() => setTimeRange('15d')} />
                               <TimeRangeButton label="Monthly" isActive={timeRange === 'monthly'} onClick={() => setTimeRange('monthly')} />
                               <TimeRangeButton label="Yearly" isActive={timeRange === 'yearly'} onClick={() => setTimeRange('yearly')} />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                             <BarChart data={analyticsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="rejectedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.2}/>
                                <XAxis dataKey="name" tick={{fontSize: 12, fill: 'currentColor'}}/>
                                <YAxis allowDecimals={false} tick={{fontSize: 12, fill: 'currentColor'}}/>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid rgba(200, 200, 200, 0.5)',
                                        borderRadius: '0.5rem',
                                        color: '#334155'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="Approved" fill="url(#approvedGradient)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Rejected" fill="url(#rejectedGradient)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
        }
    }

    return (
        <div className="space-y-8">
            <TrialBanner />
            <h1 className="text-4xl font-bold font-serif text-slate-800 dark:text-slate-100">Publisher Dashboard</h1>

            <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex space-x-4">
                    <TabButton label="Pending Submissions" count={pendingBooks.length} isActive={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
                    <TabButton label="Processed Books" count={processedBooks.length} isActive={activeTab === 'processed'} onClick={() => setActiveTab('processed')} />
                    <TabButton label="Analytics" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<ChartBarIcon className="h-4 w-4" />} />
                </div>
            </div>

            <div>
                {renderContent()}
            </div>

            <Modal isOpen={!!viewingBook} onClose={() => setViewingBook(null)} title="Review Submission">
                {viewingBook && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <img src={viewingBook.coverImage} alt={viewingBook.title} className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg" />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                             <div>
                                <h3 className="text-2xl font-bold font-serif text-slate-800 dark:text-slate-100">{viewingBook.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400">by {getAuthorName(viewingBook.authorId)}</p>
                             </div>
                             <div>
                                 <h4 className="font-semibold text-slate-700 dark:text-slate-200">Description</h4>
                                 <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm max-h-40 overflow-y-auto">{viewingBook.description}</p>
                             </div>
                             <div>
                                 <h4 className="font-semibold text-slate-700 dark:text-slate-200">Category</h4>
                                 <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm">{viewingBook.category}</p>
                             </div>
                             {viewingBook.bookFileName && (
                                <div>
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Manuscript</h4>
                                    <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold py-2 px-4 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors">
                                        <DocumentDownloadIcon className="h-5 w-5" />
                                        <span>{viewingBook.bookFileName}</span>
                                    </a>
                                </div>
                             )}
                              <div className="flex space-x-3 pt-4 border-t dark:border-slate-700">
                                <button onClick={() => { handleApproval(viewingBook.id, ApprovalStatus.APPROVED); setViewingBook(null); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition">Approve</button>
                                <button onClick={() => { handleApproval(viewingBook.id, ApprovalStatus.REJECTED); setViewingBook(null); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition">Reject</button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            <Chatbot />
        </div>
    );
};

export default PublisherDashboard;
