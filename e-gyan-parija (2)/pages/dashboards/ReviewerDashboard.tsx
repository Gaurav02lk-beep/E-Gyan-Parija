

import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Book } from '../../types';
import Modal from '../../components/Modal';
import { analyzeReviewSentiment } from '../../services/geminiService';
import Spinner from '../../components/Spinner';
import Chatbot from '../../components/Chatbot';

const BookToReviewCard: React.FC<{book: Book, onSelect: () => void}> = ({ book, onSelect }) => (
    <div className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-md rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:bg-white/60 dark:hover:bg-slate-900/50 hover:-translate-y-1 group">
        <div className="flex-grow">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{book.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{book.category}</p>
        </div>
        <button onClick={onSelect} className="mt-4 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md w-full hover:bg-indigo-700 transition-transform group-hover:scale-105">
            Review Book
        </button>
    </div>
);

const ReviewerDashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [sentiment, setSentiment] = useState<'Positive' | 'Neutral' | 'Negative' | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const booksToReview = context?.books.filter(b => b.approvalStatus === 'Approved') || [];

    const handleCommentChange = async (text: string) => {
        setComment(text);
        if(text.length > 20) { // Analyze after some text is written
            setIsAnalyzing(true);
            const newSentiment = await analyzeReviewSentiment(text);
            setSentiment(newSentiment);
            setIsAnalyzing(false);
        } else {
            setSentiment(null);
        }
    };
    
    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBook || !context?.currentUser || rating === 0) return;
        
        context.addReview({
            bookId: selectedBook.id,
            userId: context.currentUser.id,
            rating,
            comment,
        });

        setSelectedBook(null);
        setRating(0);
        setComment('');
        setSentiment(null);
    };
    
    const SentimentIndicator: React.FC<{sentiment: 'Positive' | 'Neutral' | 'Negative' | null}> = ({sentiment}) => {
        if(!sentiment) return null;
        const sentimentInfo = {
            Positive: {text: 'Positive', color: 'text-green-600 dark:text-green-400'},
            Neutral: {text: 'Neutral', color: 'text-yellow-600 dark:text-yellow-400'},
            Negative: {text: 'Negative', color: 'text-red-600 dark:text-red-400'},
        }
        return <span className={`text-sm font-medium ${sentimentInfo[sentiment].color}`}>{sentimentInfo[sentiment].text} Sentiment</span>
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold font-serif text-slate-800 dark:text-slate-100 mb-8">Reviewer Dashboard</h1>
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Books Awaiting Review</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {booksToReview.map(book => (
                        <BookToReviewCard key={book.id} book={book} onSelect={() => setSelectedBook(book)} />
                    ))}
                </div>
            </div>

            {selectedBook && (
                <Modal isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} title={`Reviewing: ${selectedBook.title}`}>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rating</label>
                            <div className="flex space-x-1 mt-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button type="button" key={star} onClick={() => setRating(star)} className={`text-4xl transition-transform hover:scale-125 ${rating >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-300'}`}>
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comment</label>
                            <textarea
                                value={comment}
                                onChange={e => handleCommentChange(e.target.value)}
                                rows={5}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                            <div className="text-right h-5 mt-1">
                                {isAnalyzing ? <Spinner size="sm"/> : <SentimentIndicator sentiment={sentiment}/>}
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition disabled:bg-indigo-300" disabled={rating === 0}>
                            Submit Review
                        </button>
                    </form>
                </Modal>
            )}
            <Chatbot />
        </div>
    );
};

export default ReviewerDashboard;
