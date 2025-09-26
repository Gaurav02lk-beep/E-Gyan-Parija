

import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import { BookOpenIcon, UsersIcon, ChartBarIcon, BanknotesIcon, ShieldCheckIcon, Cog6ToothIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../../components/icons';
import { ApprovalStatus, UserRole, User, SubscriptionStatus } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import Chatbot from '../../components/Chatbot';
import Modal from '../../components/Modal';

const SidebarLink: React.FC<{
    viewId: string,
    label: string,
    icon: React.ReactNode,
    activeView: string,
    setActiveView: (viewId: string) => void
}> = ({ viewId, label, icon, activeView, setActiveView }) => (
    <button onClick={() => setActiveView(viewId)} className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${activeView === viewId ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-105' : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/50'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode, subtext?: string }> = ({ title, value, icon, subtext }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 flex items-start justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/20">
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
            {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
            {icon}
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [activeView, setActiveView] = useState('overview');
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const { books, users, updateBookStatus } = context || {};

    const stats = useMemo(() => {
        const totalRevenue = users?.reduce((total, user) => {
            const userPurchasesValue = user.purchasedBookIds.reduce((userTotal, bookId) => {
                const book = books?.find(b => b.id === bookId);
                return userTotal + (book?.price || 0);
            }, 0);
            return total + userPurchasesValue;
        }, 0) || 0;

        return {
            totalRevenue: `₹${(totalRevenue).toLocaleString()}`,
            totalUsers: users?.length || 0,
            totalBooks: books?.length || 0,
            pendingApprovals: books?.filter(b => b.approvalStatus === ApprovalStatus.PENDING).length || 0,
        };
    }, [users, books]);

    const chartData = useMemo(() => {
        const userRoleData = Object.entries(users?.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {}).map(([name, value]) => ({ name, value }));

        const monthlySignups = users?.reduce((acc, user) => {
            const month = new Date(user.registeredDate).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const sortedMonthlySignups = Object.entries(monthlySignups || {})
            .map(([name, Users]) => ({ name, Users }))
            .sort((a,b) => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return months.indexOf(a.name) - months.indexOf(b.name);
            });

        return { userRoleData, monthlySignups: sortedMonthlySignups };
    }, [users]);
    
    const PIE_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe'];

    const renderContent = () => {
        return (
             <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 md:p-8 animate-fade-in-up">
                {(() => {
                    switch (activeView) {
                        case 'overview':
                            return (
                                <div className="space-y-8">
                                    <h2 className="text-3xl font-bold font-serif text-slate-800 dark:text-slate-100">Platform Overview</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatCard title="Total Revenue" value={stats.totalRevenue} icon={<BanknotesIcon className="h-6 w-6"/>} />
                                        <StatCard title="Total Users" value={stats.totalUsers} icon={<UsersIcon className="h-6 w-6"/>} />
                                        <StatCard title="Total Books" value={stats.totalBooks} icon={<BookOpenIcon className="h-6 w-6"/>} />
                                        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={<ClockIcon className="h-6 w-6"/>} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                        <div className="lg:col-span-3 bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl">
                                            <h3 className="font-semibold mb-2 text-center text-slate-700 dark:text-slate-200">New User Signups</h3>
                                             <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={chartData.monthlySignups}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.2}/>
                                                    <XAxis dataKey="name" tick={{fontSize: 12, fill: 'currentColor'}}/>
                                                    <YAxis allowDecimals={false} tick={{fontSize: 12, fill: 'currentColor'}}/>
                                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '0.5rem' }}/>
                                                    <Line type="monotone" dataKey="Users" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                         <div className="lg:col-span-2 bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl">
                                            <h3 className="font-semibold mb-2 text-center text-slate-700 dark:text-slate-200">User Role Distribution</h3>
                                             <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie data={chartData.userRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                        {chartData.userRoleData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 'bookManagement':
                             return (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Book Management</h2>
                                    {stats.pendingApprovals > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Pending Approval</h3>
                                             <div className="space-y-2">
                                                {books?.filter(b => b.approvalStatus === ApprovalStatus.PENDING).map(book => (
                                                    <div key={book.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-900/40 rounded-lg">
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{book.title}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">by {users?.find(u=>u.id === book.authorId)?.name}</p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => updateBookStatus?.(book.id, ApprovalStatus.APPROVED)} className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 font-bold py-1 px-3 text-sm rounded-md transition-transform hover:scale-105">Approve</button>
                                                            <button onClick={() => updateBookStatus?.(book.id, ApprovalStatus.REJECTED)} className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 font-bold py-1 px-3 text-sm rounded-md transition-transform hover:scale-105">Reject</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">All Books</h3>
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="w-full text-left text-sm">
                                            <thead className="sticky top-0 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Title</th>
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Author</th>
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {books?.map(book => (
                                                    <tr key={book.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-white/40 dark:hover:bg-slate-700/50">
                                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{book.title}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">{users?.find(u=>u.id === book.authorId)?.name}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">{book.approvalStatus}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        case 'userManagement':
                            return (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">User Management</h2>
                                    <div className="overflow-x-auto max-h-[32rem]">
                                        <table className="w-full text-left text-sm">
                                            <thead className="sticky top-0 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                                <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Email</th>
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Role</th>
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Subscription</th>
                                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users?.map(user => (
                                                    <tr key={user.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-white/40 dark:hover:bg-slate-700/50">
                                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{user.name}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">{user.email}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">{user.role}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300">{user.subscriptionStatus}</td>
                                                        <td className="p-3">
                                                            <button onClick={() => setViewingUser(user)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-semibold text-xs py-1 px-2 rounded-md bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/30">View Details</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        case 'transactions':
                        case 'moderation':
                        case 'settings':
                             return (
                                <div className="text-center py-16">
                                    <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Coming Soon!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">This section is under construction. Check back later for more features.</p>
                                </div>
                             );
                    }
                })()}
            </div>
        )
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-4 space-y-2 sticky top-28">
                    <h2 className="px-4 pt-2 pb-4 text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Admin Panel</h2>
                    <SidebarLink viewId="overview" label="Overview" icon={<ChartBarIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="bookManagement" label="Book Management" icon={<BookOpenIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="userManagement" label="User Management" icon={<UsersIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="transactions" label="Transactions" icon={<BanknotesIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="moderation" label="Moderation" icon={<ShieldCheckIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="settings" label="Settings" icon={<Cog6ToothIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                </div>
            </aside>
            <main className="flex-grow">
                {renderContent()}
                <footer className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 text-center text-slate-500 dark:text-slate-400 text-xs">
                    <p>© 2025 E-Gyan Parija made with ❤️ Team SSBG. All Rights Reserved.</p>
                </footer>
            </main>
            {viewingUser && (
                <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title={`User Details: ${viewingUser.name}`}>
                    <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                        <p><strong>ID:</strong> <span className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded text-xs">{viewingUser.id}</span></p>
                        <p><strong>Email:</strong> {viewingUser.email}</p>
                        <p><strong>Role:</strong> {viewingUser.role}</p>
                        <p><strong>Subscription:</strong> {viewingUser.subscriptionStatus}</p>
                        <p><strong>Member Since:</strong> {new Date(viewingUser.registeredDate).toLocaleDateString()}</p>
                        {viewingUser.subscriptionStatus === SubscriptionStatus.TRIAL && viewingUser.trialEngagement && (
                            <div className="mt-4 pt-4 border-t dark:border-slate-600">
                                <h4 className="font-bold mb-2 text-base text-slate-800 dark:text-slate-100">Trial Engagement Data</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                                        <p className="font-semibold">Logins</p>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{viewingUser.trialEngagement.logins}</p>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                                        <p className="font-semibold">Books Downloaded</p>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{viewingUser.trialEngagement.booksDownloaded}</p>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                                        <p className="font-semibold">Reviews Written</p>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{viewingUser.trialEngagement.reviewsWritten}</p>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                                        <p className="font-semibold">AI Summaries</p>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{viewingUser.trialEngagement.aiSummariesGenerated}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
            <Chatbot />
        </div>
    );
};

export default AdminDashboard;