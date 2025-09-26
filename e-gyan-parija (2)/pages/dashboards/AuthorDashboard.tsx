
import React from 'react';
import { useState, useContext, ChangeEvent, DragEvent } from 'react';
import { AppContext } from '../../App';
import { Book, ApprovalStatus } from '../../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowUpTrayIcon, SparklesIcon, ChartBarIcon, BookOpenIcon, DocumentTextIcon, XMarkIcon, UserCircleIcon, PhotoIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';
import { suggestKeywords } from '../../services/geminiService';
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

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({title, value, icon}) => (
    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 flex items-start justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/20">
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg">
            {icon}
        </div>
    </div>
);


const AuthorDashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [activeView, setActiveView] = useState('dashboard');
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isDraggingOverBook, setIsDraggingOverBook] = useState(false);
    const [isDraggingOverCover, setIsDraggingOverCover] = useState(false);

    const authorBooks = context?.books.filter(b => b.authorId === context.currentUser?.id) || [];

    const handleKeywordsSuggestion = async () => {
        if (!description) return;
        setIsSuggesting(true);
        const keywords = await suggestKeywords(description);
        setTags(keywords.join(', '));
        setIsSuggesting(false);
    };

    const handleFileChange = (files: FileList | null, type: 'book' | 'cover') => {
        if (files && files.length > 0) {
            if (type === 'book') {
                setBookFile(files[0]);
            } else {
                const file = files[0];
                setCoverImage(file);
                setCoverImagePreview(URL.createObjectURL(file));
            }
        }
    };
    
    const handleDragEvent = (e: DragEvent<HTMLDivElement>, isOver: boolean, type: 'book' | 'cover') => {
        e.preventDefault();
        e.stopPropagation();
        if (type === 'book') setIsDraggingOverBook(isOver);
        else setIsDraggingOverCover(isOver);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, type: 'book' | 'cover') => {
        handleDragEvent(e, false, type);
        handleFileChange(e.dataTransfer.files, type);
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if(!context || !context.currentUser || !bookFile) return;
        
        const newBook: Omit<Book, 'id' | 'uploadDate' | 'approvalStatus'> = {
            title,
            description,
            category,
            authorId: context.currentUser.id,
            publisherId: 5, // Mocked publisher
            coverImage: coverImagePreview || `https://picsum.photos/seed/${encodeURIComponent(title)}/300/400`,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            bookFileName: bookFile.name,
        };
        context.addBook(newBook);
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setTags('');
        setBookFile(null);
        setCoverImage(null);
        setCoverImagePreview(null);
        setActiveView('myBooks');
    };
    
    // --- Data for Analytics & Stats ---
    const authorBookIds = authorBooks.map(b => b.id);
    const authorReviews = context?.reviews.filter(r => authorBookIds.includes(r.bookId)) || [];
    const totalReviews = authorReviews.length;
    const averageRating = totalReviews > 0 ? (authorReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 'N/A';
    const totalApprovedBooks = authorBooks.filter(b => b.approvalStatus === ApprovalStatus.APPROVED).length;

    const analyticsData = authorBooks.map(book => ({
        name: book.title.length > 15 ? book.title.substring(0, 12) + '...' : book.title,
        downloads: Math.floor(Math.random() * 5000) + 100, // mock
        reviews: context?.reviews.filter(r => r.bookId === book.id).length || 0,
    }));

    const renderContent = () => {
        return (
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8 animate-fade-in-up">
                {(() => {
                    switch (activeView) {
                        case 'dashboard':
                            return (
                                <div>
                                    <h2 className="text-3xl font-bold font-serif text-slate-800 dark:text-slate-100 mb-2">Welcome, {context?.currentUser?.name}!</h2>
                                    <p className="text-slate-600 dark:text-slate-300 mb-8">Here's a summary of your author activity.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                                        <StatCard title="Total Books" value={authorBooks.length} icon={<BookOpenIcon className="h-6 w-6"/>}/>
                                        <StatCard title="Approved Books" value={totalApprovedBooks} icon={<CheckCircleIcon className="h-6 w-6"/>}/>
                                        <StatCard title="Total Reviews" value={totalReviews} icon={<UserCircleIcon className="h-6 w-6"/>}/>
                                        <StatCard title="Average Rating" value={averageRating} icon={<SparklesIcon className="h-6 w-6"/>}/>
                                    </div>
                                </div>
                            );
                        case 'myBooks':
                            return (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">My Published Books</h2>
                                    <div className="space-y-4">
                                        {authorBooks.length > 0 ? authorBooks.map(book => (
                                            <div key={book.id} className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-slate-900/40 rounded-lg hover:bg-white/60 dark:hover:bg-slate-900/60 transition-colors">
                                                <img src={book.coverImage} alt={book.title} className="w-16 h-20 object-cover rounded-md flex-shrink-0" />
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{book.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{book.category} &middot; Uploaded on {book.uploadDate.toLocaleDateString()}</p>
                                                    {book.bookFileName && <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1 mt-1"><DocumentTextIcon className="h-4 w-4"/><span>{book.bookFileName}</span></p>}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <StatusBadge status={book.approvalStatus} />
                                                </div>
                                            </div>
                                        )) : <p className="text-slate-500 dark:text-slate-400 text-center py-8">You have not published any books yet.</p>}
                                    </div>
                                </div>
                            );
                        case 'uploadBook':
                             return (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Upload New Book</h2>
                                    <form onSubmit={handleUpload} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Book Title</label>
                                                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                                            </div>
                                            <div>
                                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                                                <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                                        </div>
                                        <div>
                                            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags / Keywords</label>
                                            <div className="flex space-x-2 mt-1">
                                                <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="AI, Future, Tech..." className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                                                <button type="button" onClick={handleKeywordsSuggestion} disabled={isSuggesting || !description} className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isSuggesting ? <Spinner size="sm" /> : <SparklesIcon />}
                                                    <span>Suggest</span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate tags with a comma.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div onDragEnter={(e) => handleDragEvent(e, true, 'cover')} onDragLeave={(e) => handleDragEvent(e, false, 'cover')} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'cover')} className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDraggingOverCover ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                                                <input type="file" id="cover-upload" className="hidden" accept="image/*" onChange={e => handleFileChange(e.target.files, 'cover')} />
                                                <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                                                    {coverImagePreview ? <img src={coverImagePreview} alt="Cover preview" className="h-24 w-auto rounded" /> : <PhotoIcon className="h-10 w-10 text-slate-400" />}
                                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{coverImage ? coverImage.name : 'Upload Cover Image'}</span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, GIF up to 10MB</p>
                                                </label>
                                            </div>
                                            <div onDragEnter={(e) => handleDragEvent(e, true, 'book')} onDragLeave={(e) => handleDragEvent(e, false, 'book')} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'book')} className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDraggingOverBook ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                                                <input type="file" id="book-upload" className="hidden" accept=".pdf,.epub" onChange={e => handleFileChange(e.target.files, 'book')} />
                                                <label htmlFor="book-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                                                    <DocumentTextIcon className="h-10 w-10 text-slate-400" />
                                                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{bookFile ? bookFile.name : 'Upload Manuscript'}</span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF or EPUB file</p>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button type="submit" disabled={!bookFile || !title || !description} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                                Submit for Review
                                            </button>
                                        </div>
                                    </form>
                                </div>
                             );
                        case 'analytics':
                            return (
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Book Analytics</h2>
                                    <p className="text-slate-600 dark:text-slate-300 mb-6">View downloads and reviews for your approved books.</p>
                                    <div style={{ width: '100%', height: 400 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={analyticsData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.2} />
                                                <XAxis dataKey="name" tick={{fontSize: 12, fill: 'currentColor'}} />
                                                <YAxis allowDecimals={false} tick={{fontSize: 12, fill: 'currentColor'}} />
                                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '0.5rem' }}/>
                                                <Legend />
                                                <Bar dataKey="downloads" fill="#4f46e5" name="Downloads (mock)" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="reviews" fill="#818cf8" name="Reviews" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        default:
                            return <div>Select a view</div>;
                    }
                })()}
            </div>
        );
    };

    return (
         <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-4 space-y-2 sticky top-28">
                    <h2 className="px-4 pt-2 pb-4 text-xl font-serif font-bold text-slate-800 dark:text-slate-100">Author Menu</h2>
                    <SidebarLink viewId="dashboard" label="Dashboard" icon={<ChartBarIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="myBooks" label="My Books" icon={<BookOpenIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="uploadBook" label="Upload Book" icon={<ArrowUpTrayIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                    <SidebarLink viewId="analytics" label="Analytics" icon={<ChartBarIcon className="h-5 w-5"/>} activeView={activeView} setActiveView={setActiveView} />
                </div>
            </aside>
            <main className="flex-grow">
                <TrialBanner />
                <div className="mt-8">
                    {renderContent()}
                </div>
            </main>
            <Chatbot />
        </div>
    );
};

export default AuthorDashboard;
