
import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { AppContext } from '../../App';
import { Book, Review, UserRole } from '../../types';
import { SparklesIcon, XMarkIcon, CheckCircleIcon, SearchIcon, ArrowLeftIcon, ArrowRightIcon, BookmarkIcon, PlayIcon, PauseIcon, StopIcon, AINarratorIcon, BookmarkSolidIcon } from '../../components/icons';
import { generateAudioSummary, getBookRecommendations } from '../../services/geminiService';
import Spinner from '../../components/Spinner';
import PaymentModal from '../../components/PaymentModal';
import Chatbot from '../../components/Chatbot';
import TrialBanner from '../../components/TrialBanner';

const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className = '' }) => (
    <div className={`flex items-center ${className}`}>
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`h-5 w-5 flex-shrink-0 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


const BookCard: React.FC<{ 
    book: Book;
    onSelect: (book: Book) => void;
    averageRating: number; 
}> = ({ book, onSelect, averageRating }) => {
    const context = useContext(AppContext);
    const isInWishlist = useMemo(() => context?.currentUser?.wishlistBookIds.includes(book.id), [context?.currentUser, book.id]);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!context?.currentUser) return;
        
        if (isInWishlist) {
            context.removeFromWishlist(book.id);
        } else {
            context.addToWishlist(book.id);
        }
    };
    const readingProgress = context?.readingProgress?.[book.id] ?? 0;
    const totalPages = book.totalPages ?? 1;
    const progressPercent = (readingProgress / totalPages) * 100;

    return (
        <div 
            onClick={() => onSelect(book)} 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-200/80 dark:border-slate-700 cursor-pointer overflow-hidden"
        >
            <div className="relative">
                <img src={book.coverImage} alt={book.title} className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="font-bold drop-shadow-md truncate">{book.title}</h3>
                    <p className="text-xs text-slate-200 drop-shadow-sm">{book.category}</p>
                </div>
                {averageRating > 0 && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1 backdrop-blur-sm bg-opacity-80">
                        <span>★</span>
                        <span>{averageRating.toFixed(1)}</span>
                    </div>
                )}
                 {context?.currentUser && (
                    <button onClick={handleWishlistToggle} className="absolute top-2 left-2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm z-10">
                        {isInWishlist 
                            ? <BookmarkSolidIcon className="h-5 w-5 text-indigo-400"/> 
                            : <BookmarkIcon className="h-5 w-5"/>}
                    </button>
                )}
            </div>
             {progressPercent > 0 && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5">
                    <div className="bg-indigo-500 h-1.5" style={{ width: `${progressPercent}%` }}></div>
                </div>
            )}
        </div>
    );
};


const BookDetailModal: React.FC<{ 
    book: Book; 
    onClose: () => void;
    onPurchase: (book: Book) => void;
    onReadOnline: (book: Book) => void;
}> = ({ book, onClose, onPurchase, onReadOnline }) => {
    const context = useContext(AppContext);
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activeTab, setActiveTab] = useState('reviews');

    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');

    const userOwnsBook = context?.currentUser?.purchasedBookIds.includes(book.id) ?? false;
    const isInWishlist = useMemo(() => context?.currentUser?.wishlistBookIds.includes(book.id), [context?.currentUser, book.id]);
    const reviews = useMemo(() => context?.reviews.filter(r => r.bookId === book.id) || [], [context?.reviews, book.id]);
    const userHasReviewed = useMemo(() => reviews.some(r => r.userId === context?.currentUser?.id), [reviews, context?.currentUser?.id]);
    
    const averageRating = useMemo(() => reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0, [reviews]);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        const generatedSummary = await generateAudioSummary(book.title, book.description);
        setSummary(generatedSummary);
        setIsGenerating(false);
    };

    const handleSpeak = () => {
        if (!summary) return;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(summary);
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
    };
    
    const handleWishlistToggle = () => {
        if (!context?.currentUser) return;
        
        if (isInWishlist) {
            context.removeFromWishlist(book.id);
        } else {
            context.addToWishlist(book.id);
        }
    };

    useEffect(() => {
        return () => speechSynthesis.cancel();
    }, []);

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!context?.currentUser || newRating === 0 || !newComment) return;

        context.addReview({
            bookId: book.id,
            userId: context.currentUser.id,
            rating: newRating,
            comment: newComment,
        });
        setNewRating(0);
        setNewComment('');
        setActiveTab('reviews');
    };
    
    const getUserName = (userId: number) => context?.users.find(u => u.id === userId)?.name || 'Anonymous';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-5xl m-4 relative max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white z-20 bg-white/50 dark:bg-slate-700/50 rounded-full p-1"><XMarkIcon /></button>
                <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden flex-grow">
                    <div className="col-span-12 md:col-span-4 p-8 bg-slate-50 dark:bg-slate-900 flex flex-col space-y-6">
                         <img src={book.coverImage} alt={book.title} className="w-full aspect-[3/4] object-cover rounded-lg shadow-xl" />
                         <div className="space-y-1">
                             <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight">{book.title}</h2>
                             <p className="text-slate-500 dark:text-slate-400 text-lg">{book.category}</p>
                         </div>

                        {averageRating > 0 && (
                            <div className="flex items-center space-x-2">
                                <StarRating rating={averageRating} />
                                <span className="text-slate-600 dark:text-slate-300 font-semibold">{averageRating.toFixed(1)}</span>
                                <span className="text-slate-400 dark:text-slate-500 text-sm">({reviews.length} reviews)</span>
                            </div>
                        )}
                        
                        <div className="mt-auto space-y-3 pt-4">
                           {book.price && !userOwnsBook ? (
                                <button onClick={() => onPurchase(book)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition-transform hover:scale-105">
                                    Buy Now - ₹{book.price}
                                </button>
                           ) : userOwnsBook ? (
                                <div className="flex space-x-3">
                                    <button onClick={() => onReadOnline(book)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition">Read Online</button>
                                    <button className="flex-1 bg-white dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-md transition">Download</button>
                                </div>
                           ) : (
                                <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300 p-3 bg-slate-100 dark:bg-slate-700 rounded-md">This book is included in your subscription.</p>
                           )}
                           {userOwnsBook && (
                             <div className="text-center text-sm font-semibold text-green-600 dark:text-green-500 flex items-center justify-center space-x-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span>You own this book</span>
                            </div>
                           )}
                        </div>
                        
                        {context?.currentUser && (
                            <button onClick={handleWishlistToggle} className="w-full mt-3 flex items-center justify-center space-x-2 bg-slate-100/70 dark:bg-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-600/50 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-md transition-all text-sm">
                               {isInWishlist 
                                ? <><BookmarkSolidIcon className="h-5 w-5 text-indigo-500"/><span>Remove from Wishlist</span></>
                                : <><BookmarkIcon className="h-5 w-5"/><span>Add to Wishlist</span></>
                               }
                            </button>
                        )}
                         
                         <div className="bg-indigo-50 dark:bg-slate-800 p-4 rounded-lg border border-indigo-100 dark:border-slate-700">
                            <h4 className="font-semibold text-base mb-2 flex items-center text-indigo-800 dark:text-indigo-300"><SparklesIcon className="mr-2 text-indigo-500"/>AI Audio Summary</h4>
                            {isGenerating ? <Spinner /> : (
                                summary ? (
                                    <>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 max-h-24 overflow-y-auto">{summary}</p>
                                        <button onClick={handleSpeak} disabled={isSpeaking} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md w-full transition disabled:bg-indigo-300 text-sm">
                                            {isSpeaking ? 'Speaking...' : 'Listen to Summary'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={handleGenerateSummary} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md w-full transition text-sm">Generate Summary</button>
                                )
                            )}
                        </div>
                    </div>
                    
                    <div className="col-span-12 md:col-span-8 p-8 flex flex-col overflow-y-auto">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Description</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-6 prose max-w-none text-base">{book.description}</p>
                        </div>
                        
                        <div className="border-t dark:border-slate-700 pt-6 flex-grow flex flex-col">
                            <div className="flex border-b dark:border-slate-700 mb-4">
                                <button onClick={() => setActiveTab('reviews')} className={`py-2 px-4 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Reviews ({reviews.length})</button>
                                {context?.currentUser && context.currentUser.role !== UserRole.GUEST && (
                                    <button onClick={() => setActiveTab('addReview')} className={`py-2 px-4 font-semibold ${activeTab === 'addReview' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>Write a Review</button>
                                )}
                            </div>

                            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                                {activeTab === 'reviews' && (
                                    <div className="space-y-6">
                                        {reviews.length > 0 ? (
                                            reviews.map(review => (
                                                <div key={review.id} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                                                                {getUserName(review.userId).charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{getUserName(review.userId)}</p>
                                                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(review.reviewDate).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <StarRating rating={review.rating} />
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm">{review.comment}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No reviews yet. Be the first!</p>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'addReview' && (
                                    <>
                                    {userHasReviewed ? (
                                         <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-4 rounded-lg text-center text-sm">
                                            You've already reviewed this book. Thank you!
                                        </div>
                                    ) : (
                                    <form onSubmit={handleSubmitReview} className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                        <h4 className="font-semibold text-xl text-slate-800 dark:text-slate-100">Share Your Thoughts</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Rating</label>
                                            <div className="flex space-x-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button type="button" key={star} onClick={() => setNewRating(star)} className={`text-4xl transition-all duration-200 transform hover:scale-125 ${newRating >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-300'}`}>
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Your Comment</label>
                                            <textarea id="comment" value={newComment} onChange={e => setNewComment(e.target.value)} rows={5} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required placeholder="What did you think of the book?"/>
                                        </div>
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition disabled:bg-indigo-400 disabled:cursor-not-allowed" disabled={newRating === 0 || !newComment}>
                                            Submit Review
                                        </button>
                                    </form>
                                    )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReadingViewModal: React.FC<{
    book: Book;
    onClose: () => void;
    onProgressUpdate: (progress: number) => void;
}> = ({ book, onClose, onProgressUpdate }) => {
    const [sentences, setSentences] = useState<string[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    const [playbackState, setPlaybackState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Ref to hold the latest progress to use in cleanup function
    const progressToSave = useRef({
        sentenceIndex: -1,
        totalSentences: 0,
    });
    
    useEffect(() => {
        progressToSave.current = {
            sentenceIndex: currentSentenceIndex,
            totalSentences: sentences.length,
        };
    }, [currentSentenceIndex, sentences]);


    useEffect(() => {
        // Split content into sentences
        const content = book.content || "This book has no content available for reading.";
        const splitSentences = content.match(/[^.!?]+[.!?]+/g) || [content];
        setSentences(splitSentences);

        const utterance = new SpeechSynthesisUtterance();
        utteranceRef.current = utterance;

        const handleBoundary = (event: SpeechSynthesisEvent) => {
            if (event.name === 'sentence') {
                const spokenText = utterance.text.substring(0, event.charIndex + event.charLength);
                const spokenSentences = spokenText.match(/[^.!?]+[.!?]+/g) || [];
                setCurrentSentenceIndex(spokenSentences.length - 1);
            }
        };
        
        const handleEnd = () => {
            setPlaybackState('stopped');
            setCurrentSentenceIndex(-1);
        };

        utterance.addEventListener('boundary', handleBoundary);
        utterance.addEventListener('end', handleEnd);

        // Cleanup
        return () => {
            speechSynthesis.cancel();
            utterance.removeEventListener('boundary', handleBoundary);
            utterance.removeEventListener('end', handleEnd);
            
            // Save progress on unmount
            const { sentenceIndex, totalSentences } = progressToSave.current;
            if (book.totalPages && totalSentences > 0 && sentenceIndex >= 0) {
                const currentPage = Math.floor(((sentenceIndex + 1) / totalSentences) * book.totalPages);
                onProgressUpdate(currentPage);
            }
        };
    }, [book.content, book.totalPages, onProgressUpdate]);

    const handlePlay = () => {
        if (playbackState === 'paused' && utteranceRef.current) {
            speechSynthesis.resume();
        } else if (utteranceRef.current) {
            utteranceRef.current.text = sentences.join(' ');
            speechSynthesis.speak(utteranceRef.current);
        }
        setPlaybackState('playing');
    };
    
    const handlePause = () => {
        speechSynthesis.pause();
        setPlaybackState('paused');
    };

    const handleStop = () => {
        speechSynthesis.cancel();
        setPlaybackState('stopped');
        setCurrentSentenceIndex(-1);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-[60] flex flex-col items-center p-4 md:p-8" onClick={onClose}>
            <div className="w-full max-w-4xl flex-grow flex flex-col animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-white">{book.title}</h2>
                    <button onClick={onClose} className="text-slate-300 hover:text-white"><XMarkIcon className="h-7 w-7" /></button>
                </div>
                
                <div className="flex-grow flex md:space-x-8 overflow-hidden">
                    <div className="hidden md:flex flex-col items-center justify-center w-1/4">
                        <AINarratorIcon className="h-32 w-32 text-slate-400" isSpeaking={playbackState === 'playing'} />
                        <p className="text-slate-400 mt-4 font-semibold">AI Narrator</p>
                    </div>

                    <div className="w-full md:w-3/4 bg-slate-800/50 p-6 rounded-lg overflow-y-auto text-lg leading-relaxed text-slate-200 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                        {sentences.map((sentence, index) => (
                            <span key={index} className={`transition-all duration-700 ease-in-out rounded-md p-1 -m-1 ${index === currentSentenceIndex ? 'bg-indigo-500/25 text-indigo-100' : 'text-slate-400'}`}>
                                {sentence}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex-shrink-0 mt-6 bg-slate-800/50 p-4 rounded-lg flex items-center justify-center space-x-6">
                     <button
                        onClick={playbackState === 'playing' ? handlePause : handlePlay}
                        className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-transform hover:scale-110"
                    >
                        {playbackState === 'playing' ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={playbackState === 'stopped'}
                        className="p-3 bg-slate-600 text-white rounded-full shadow-lg hover:bg-slate-500 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <StopIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const Carousel: React.FC<{
    books: Book[],
    onSelectBook: (book: Book) => void,
    getBookAverageRating: (bookId: number) => number,
}> = ({ books, onSelectBook, getBookAverageRating }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative -mx-4 px-4">
             <button onClick={() => scroll('left')} className="absolute top-1/2 -left-2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-all z-10 disabled:opacity-0 disabled:cursor-not-allowed">
                <ArrowLeftIcon className="h-6 w-6 text-slate-800 dark:text-slate-100" />
            </button>
            <div 
                ref={scrollRef}
                className="flex space-x-8 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide py-4"
            >
                {books.map(book => (
                    <div key={book.id} className="snap-start flex-shrink-0 w-64">
                         <BookCard book={book} onSelect={onSelectBook} averageRating={getBookAverageRating(book.id)} />
                    </div>
                ))}
            </div>
            <button onClick={() => scroll('right')} className="absolute top-1/2 -right-2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 p-2 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-all z-10 disabled:opacity-0 disabled:cursor-not-allowed">
                <ArrowRightIcon className="h-6 w-6 text-slate-800 dark:text-slate-100" />
            </button>
        </div>
    );
};

const ReaderDashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [bookToPurchase, setBookToPurchase] = useState<Book | null>(null);
    const [readingBook, setReadingBook] = useState<Book | null>(null);
    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const wishlistBooks = useMemo(() => {
        if (!context?.books || !context.currentUser) return [];
        return context.books.filter(book => context.currentUser?.wishlistBookIds.includes(book.id));
    }, [context?.books, context?.currentUser]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!context?.currentUser || !context.books) return;
            setIsLoadingRecs(true);
            const userReviews = context.reviews.filter(r => r.userId === context.currentUser.id);
            if (userReviews.length > 0) {
                const readBookTitles = userReviews.map(review => context.books.find(b => b.id === review.bookId)?.title).filter(Boolean) as string[];
                const recommendedTitles = await getBookRecommendations(readBookTitles);
                const recommendedBooks = context.books.filter(b => recommendedTitles.includes(b.title));
                setRecommendations(recommendedBooks);
            } else {
                // Mock recommendations if user has no reviews
                setRecommendations(context.books.slice(3, 8));
            }
            setIsLoadingRecs(false);
        };
        fetchRecommendations();
    }, [context?.currentUser, context?.reviews, context?.books]);
    
    const getBookAverageRating = (bookId: number) => {
        const bookReviews = context?.reviews.filter(r => r.bookId === bookId) || [];
        if (bookReviews.length === 0) return 0;
        return bookReviews.reduce((acc, r) => acc + r.rating, 0) / bookReviews.length;
    };

    const handlePurchaseRequest = (book: Book) => {
        if (context?.currentUser?.role === UserRole.GUEST) {
            alert("Please log in or register as a Reader to purchase books.");
            return;
        }
        setBookToPurchase(book);
    };

    const handlePurchaseSuccess = () => {
        if (bookToPurchase) {
            context?.purchaseBook(bookToPurchase.id);
        }
    };
    
    const handleReadOnline = (book: Book) => {
        setSelectedBook(null);
        setReadingBook(book);
    };

    const groupedBooks = useMemo(() => {
        if (!context?.books) return {};
        
        const approvedBooks = context.books.filter(b => b.approvalStatus === 'Approved');

        const filteredBooks = searchQuery
            ? approvedBooks.filter(book => {
                const lowercasedQuery = searchQuery.toLowerCase();
                return (
                    book.title.toLowerCase().includes(lowercasedQuery) ||
                    book.category.toLowerCase().includes(lowercasedQuery) ||
                    book.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
                );
              })
            : approvedBooks;

        return filteredBooks.reduce((acc, book) => {
            const { category } = book;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(book);
            return acc;
        }, {} as Record<string, Book[]>);

    }, [context?.books, searchQuery]);

    const newArrivals = useMemo(() => {
        if (!context?.books) return [];
        return [...context.books]
            .filter(b => b.approvalStatus === 'Approved')
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
            .slice(0, 10);
    }, [context?.books]);

    const lastReadBook = useMemo(() => {
         if (!context?.books || !context.currentUser) return null;
         const purchasedBooks = context.currentUser.purchasedBookIds;
         if (purchasedBooks.length === 0) return context.books.find(b => b.id === 6); // Mock if no purchased books
         return context.books.find(b => b.id === purchasedBooks[purchasedBooks.length - 1]) || null;
    }, [context?.books, context?.currentUser]);

    const lastReadBookProgress = useMemo(() => {
        if (!lastReadBook || !context?.readingProgress) return 0;
        const progress = context.readingProgress[lastReadBook.id] ?? 0;
        const total = lastReadBook.totalPages ?? 1;
        return (progress / total) * 100;
    }, [lastReadBook, context?.readingProgress]);

    const paymentItem = useMemo(() => {
        if (!bookToPurchase) return null;
        return {
            type: 'Book' as const,
            name: bookToPurchase.title,
            description: bookToPurchase.category,
            price: bookToPurchase.price || 0,
            coverImage: bookToPurchase.coverImage
        };
    }, [bookToPurchase]);

    if (searchQuery) {
        return (
             <div className="space-y-12">
                <TrialBanner />
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                    <h1 className="text-4xl font-bold font-serif text-slate-800 dark:text-slate-100">Search Results</h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">Showing results for "{searchQuery}"</p>
                    <div className="mt-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-400" /></div>
                        <input type="text" placeholder="Search for books..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
                        <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"><XMarkIcon className="h-5 w-5"/></button>
                    </div>
                </div>
                
                <section>
                 {Object.keys(groupedBooks).length > 0 ? (
                    Object.entries(groupedBooks).map(([category, booksInCategory]) => (
                        <div key={category} className="mb-12">
                            <h2 className="text-3xl font-bold font-serif mb-6 text-slate-800 dark:text-slate-100">{category}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                {booksInCategory.map(book => (
                                    <BookCard key={book.id} book={book} onSelect={setSelectedBook} averageRating={getBookAverageRating(book.id)} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">No books found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search query to find what you're looking for.</p>
                    </div>
                )}
                </section>

                {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} onPurchase={handlePurchaseRequest} onReadOnline={handleReadOnline} />}
                {readingBook && <ReadingViewModal book={readingBook} onClose={() => setReadingBook(null)} onProgressUpdate={(progress) => context?.updateReadingProgress?.(readingBook.id, progress)} />}
                <PaymentModal isOpen={!!bookToPurchase} onClose={() => setBookToPurchase(null)} item={paymentItem} onSuccess={handlePurchaseSuccess}/>
                <Chatbot />
            </div>
        );
    }

    return (
        <div className="space-y-16">
            <TrialBanner />
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                <h1 className="text-4xl font-bold font-serif text-slate-800 dark:text-slate-100">Welcome, {context?.currentUser?.name || 'Guest'}!</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">What will you discover today?</p>
                <div className="mt-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-400" /></div>
                    <input type="text" placeholder="Search for books by title, category, or tag..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full max-w-lg pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 border border-transparent dark:border-transparent rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
                </div>
            </div>

            {lastReadBook && (
                <section>
                    <h2 className="text-3xl font-bold font-serif mb-6 flex items-center text-slate-800 dark:text-slate-100"><BookmarkIcon className="mr-3 text-indigo-500 h-7 w-7"/>Continue Reading</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center gap-8">
                        <img src={lastReadBook.coverImage} alt={lastReadBook.title} className="w-40 h-56 object-cover rounded-lg shadow-lg flex-shrink-0 -mt-16 md:-ml-0" />
                        <div className="flex-grow w-full text-center md:text-left">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{lastReadBook.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400">by {context?.users.find(u => u.id === lastReadBook.authorId)?.name || 'Unknown'}</p>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 my-4">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${lastReadBookProgress}%`}}></div>
                            </div>
                            <button onClick={() => setSelectedBook(lastReadBook)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition-transform hover:scale-105">
                                Jump Back In
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-3xl font-bold font-serif mb-6 flex items-center text-slate-800 dark:text-slate-100"><SparklesIcon className="mr-3 text-indigo-500 h-8 w-8"/>Curated For You</h2>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 p-6">
                    {/* Placeholder for tabs */}
                    <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                        <button className="py-2 px-4 font-semibold border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400">Recommended</button>
                        <button className="py-2 px-4 font-semibold text-slate-500 dark:text-slate-400">New Arrivals</button>
                         <button className="py-2 px-4 font-semibold text-slate-500 dark:text-slate-400">Trending</button>
                    </div>
                    {isLoadingRecs ? <Spinner /> : <Carousel books={recommendations} onSelectBook={setSelectedBook} getBookAverageRating={getBookAverageRating} />}
                </div>
            </section>

            {wishlistBooks.length > 0 && (
                 <section>
                    <h2 className="text-3xl font-bold font-serif mb-6 flex items-center text-slate-800 dark:text-slate-100"><BookmarkSolidIcon className="mr-3 text-indigo-500 h-7 w-7"/>My Wishlist</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 p-6">
                        <Carousel books={wishlistBooks} onSelectBook={setSelectedBook} getBookAverageRating={getBookAverageRating} />
                    </div>
                </section>
            )}


            <section>
                <h2 className="text-3xl font-bold font-serif mb-6 text-slate-800 dark:text-slate-100">Explore the Library</h2>
                {Object.keys(groupedBooks).length > 0 ? (
                    Object.entries(groupedBooks).map(([category, booksInCategory]) => (
                        <div key={category} className="mb-12">
                            <h3 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">{category}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                {booksInCategory.map(book => (
                                    <BookCard key={book.id} book={book} onSelect={setSelectedBook} averageRating={getBookAverageRating(book.id)} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">No books to display</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">The library is currently empty. Check back later!</p>
                    </div>
                )}
            </section>

            {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} onPurchase={handlePurchaseRequest} onReadOnline={handleReadOnline} />}
            {readingBook && <ReadingViewModal book={readingBook} onClose={() => setReadingBook(null)} onProgressUpdate={(progress) => context?.updateReadingProgress?.(readingBook.id, progress)} />}


            <PaymentModal 
                isOpen={!!bookToPurchase}
                onClose={() => setBookToPurchase(null)}
                item={paymentItem}
                onSuccess={handlePurchaseSuccess}
            />
            <Chatbot />
        </div>
    );
};

export default ReaderDashboard;