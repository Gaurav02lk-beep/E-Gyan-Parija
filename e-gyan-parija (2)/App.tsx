
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, Book, Review, Subscription, ApprovalStatus, SubscriptionStatus, UserPreferences } from './types';
import { MOCK_USERS, MOCK_BOOKS, MOCK_REVIEWS, MOCK_SUBSCRIPTIONS } from './mockData';
import LoginPage from './pages/LoginPage';
import Header from './pages/Header';
import Footer from './pages/Footer';
import LandingPage from './pages/LandingPage';
import ReaderDashboard from './pages/dashboards/ReaderDashboard';
import AuthorDashboard from './pages/dashboards/AuthorDashboard';
import PublisherDashboard from './pages/dashboards/PublisherDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ReviewerDashboard from './pages/dashboards/ReviewerDashboard';
import SettingsModal from './components/SettingsModal';
import MyAccountModal from './components/MyAccountModal';
import SubscriptionPage from './pages/SubscriptionPage';

const defaultPreferences: UserPreferences = {
    theme: 'light',
    fontSize: 'base',
};

export const AppContext = React.createContext<{
    currentUser: User | null;
    login: (email: string, password_unused: string) => boolean;
    logout: () => void;
    register: (name: string, email: string, role: UserRole) => boolean;
    books: Book[];
    users: User[];
    reviews: Review[];
    subscriptions: Subscription[];
    addBook: (book: Omit<Book, 'id' | 'uploadDate' | 'approvalStatus'>) => void;
    updateBookStatus: (bookId: number, status: ApprovalStatus) => void;
    addReview: (review: Omit<Review, 'id' | 'reviewDate'>) => void;
    purchaseBook: (bookId: number) => void;
    trackDownload: (bookId: number) => void;
    trackAISummary: (bookId: number) => void;
    preferences: UserPreferences;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
    openSettingsModal: () => void;
    openMyAccountModal: () => void;
    openSubscriptionModal: () => void;
    readingProgress: { [bookId: number]: number };
    updateReadingProgress: (bookId: number, progress: number) => void;
    addToWishlist: (bookId: number) => void;
    removeFromWishlist: (bookId: number) => void;
} | null>(null);


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    
    const [showSubscriptionPageForUser, setShowSubscriptionPageForUser] = useState<User | null>(null);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isMyAccountModalOpen, setMyAccountModalOpen] = useState(false);
    
    const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
    const [readingProgress, setReadingProgress] = useState<{ [bookId: number]: number }>({
        1: 50, // Mock progress for "The Future of AI"
        2: 150, // Mock progress for "Cosmic Journeys"
        6: 250, // Mock progress for "Echoes of the Forgotten City"
    });
    
    const [preferences, setPreferences] = useState<UserPreferences>(() => {
        const storedPrefs = localStorage.getItem('userPreferences');
        return storedPrefs ? JSON.parse(storedPrefs) : defaultPreferences;
    });
    
    useEffect(() => {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(preferences.theme);
        
        const body = window.document.body;
        body.classList.remove('text-sm', 'text-base', 'text-lg');
        body.classList.add(`text-${preferences.fontSize}`);

    }, [preferences]);

    const updateUserState = (updateFn: (user: User) => User) => {
        if (!currentUser) return;
        
        // Create a new user object based on the current user and the update function
        const updatedUser = updateFn(currentUser);

        // Update the currentUser state and localStorage
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update the user within the main users array
        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? updatedUser : u));
    }
    
    const login = (email: string): boolean => {
        const user = users.find(u => u.email === email);
        if (user) {
            let userToLogin = { ...user };
            if (user.subscriptionStatus === SubscriptionStatus.TRIAL) {
                const updatedEngagement = { 
                    ...(user.trialEngagement || { booksDownloaded: 0, reviewsWritten: 0, aiSummariesGenerated: 0, logins: 0 }),
                    logins: (user.trialEngagement?.logins || 0) + 1 
                };
                userToLogin.trialEngagement = updatedEngagement;
                setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? userToLogin : u));
            }
            setCurrentUser(userToLogin);
            localStorage.setItem('currentUser', JSON.stringify(userToLogin));
            setLoginModalOpen(false);
            return true;
        }
        return false;
    };
    
    const completeSubscriptionAndLogin = (user: User, plan: { name: string; price: number; cycle: 'monthly' | 'yearly' }) => {
        const newSubscription: Subscription = {
            id: subscriptions.length + 1,
            userId: user.id,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + (plan.cycle === 'yearly' ? 1 : 0))),
            status: SubscriptionStatus.ACTIVE,
            plan: plan.cycle,
        };
        setSubscriptions(prev => [...prev, newSubscription]);
    
        const updatedUser = { ...user, subscriptionStatus: SubscriptionStatus.ACTIVE };
        
        setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
        setShowSubscriptionPageForUser(null);
    };

    const skipSubscriptionAndLogin = (user: User) => {
        const updatedUser = { 
            ...user, 
            subscriptionStatus: SubscriptionStatus.TRIAL,
            trialStartDate: new Date(),
            trialEngagement: { booksDownloaded: 0, reviewsWritten: 0, aiSummariesGenerated: 0, logins: 1 }
        };
        setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setShowSubscriptionPageForUser(null);
    };

    const register = (name: string, email: string, role: UserRole): boolean => {
        const existingUser = users.find(u => u.email === email);
        if(existingUser) {
            return false;
        }
        const newUser: User = {
            id: (users.length > 0 ? Math.max(...users.map(u => u.id)) : 0) + 1,
            name,
            email,
            role,
            subscriptionStatus: role === UserRole.ADMIN 
                ? SubscriptionStatus.ACTIVE 
                : role === UserRole.GUEST 
                    ? SubscriptionStatus.TRIAL 
                    : SubscriptionStatus.INACTIVE,
            registeredDate: new Date(),
            purchasedBookIds: [],
            wishlistBookIds: [],
            ...(role === UserRole.GUEST && { 
                trialStartDate: new Date(),
                trialEngagement: { booksDownloaded: 0, reviewsWritten: 0, aiSummariesGenerated: 0, logins: 1 }
            })
        };
        
        setUsers(prev => [...prev, newUser]);
        
        if (role === UserRole.GUEST || role === UserRole.ADMIN) {
            setCurrentUser(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
        } else {
            setShowSubscriptionPageForUser(newUser);
        }
        setLoginModalOpen(false);
        return true;
    }

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };
    
    const addBook = (bookData: Omit<Book, 'id'|'uploadDate'|'approvalStatus'>) => {
        const newBook: Book = {
            ...bookData,
            id: books.length + 1,
            uploadDate: new Date(),
            approvalStatus: ApprovalStatus.PENDING,
        };
        setBooks(prevBooks => [...prevBooks, newBook]);
    };

    const updateBookStatus = (bookId: number, status: ApprovalStatus) => {
        setBooks(prevBooks => prevBooks.map(b => b.id === bookId ? { ...b, approvalStatus: status } : b));
    };
    
    const addReview = (reviewData: Omit<Review, 'id' | 'reviewDate'>) => {
        const newReview: Review = {
            ...reviewData,
            id: reviews.length + 1,
            reviewDate: new Date(),
        };
        setReviews(prevReviews => [...prevReviews, newReview]);

        if (currentUser?.subscriptionStatus === SubscriptionStatus.TRIAL) {
            updateUserState(user => ({
                ...user,
                trialEngagement: {
                    ...(user.trialEngagement!),
                    reviewsWritten: (user.trialEngagement?.reviewsWritten || 0) + 1,
                },
            }));
        }
    };

    const purchaseBook = (bookId: number) => {
        updateUserState(user => {
            if (user.purchasedBookIds.includes(bookId)) return user;
            return { ...user, purchasedBookIds: [...user.purchasedBookIds, bookId] };
        });
    };

    const trackDownload = (bookId: number) => {
        updateUserState(user => {
            if (user.subscriptionStatus !== SubscriptionStatus.TRIAL) return user;
            return {
                ...user,
                trialEngagement: {
                    ...(user.trialEngagement!),
                    booksDownloaded: (user.trialEngagement?.booksDownloaded || 0) + 1
                }
            };
        });
    };

    const trackAISummary = (bookId: number) => {
        updateUserState(user => {
            if (user.subscriptionStatus !== SubscriptionStatus.TRIAL) return user;
            return {
                ...user,
                trialEngagement: {
                    ...(user.trialEngagement!),
                    aiSummariesGenerated: (user.trialEngagement?.aiSummariesGenerated || 0) + 1
                }
            };
        });
    };

    const updateReadingProgress = (bookId: number, progress: number) => {
        setReadingProgress(prev => ({
            ...prev,
            [bookId]: progress,
        }));
    };

    const addToWishlist = (bookId: number) => {
        updateUserState(user => {
            if (user.wishlistBookIds.includes(bookId)) return user;
            return { ...user, wishlistBookIds: [...user.wishlistBookIds, bookId] };
        });
    };

    const removeFromWishlist = (bookId: number) => {
        updateUserState(user => ({
            ...user,
            wishlistBookIds: user.wishlistBookIds.filter(id => id !== bookId)
        }));
    };

    const appContextValue = useMemo(() => ({
        currentUser,
        login,
        logout,
        register,
        books,
        users,
        reviews,
        subscriptions,
        addBook,
        updateBookStatus,
        addReview,
        purchaseBook,
        trackDownload,
        trackAISummary,
        preferences,
        setPreferences,
        openSettingsModal: () => setSettingsModalOpen(true),
        openMyAccountModal: () => setMyAccountModalOpen(true),
        openSubscriptionModal: () => {
            if (currentUser && currentUser.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
                setShowSubscriptionPageForUser(currentUser);
            }
        },
        readingProgress,
        updateReadingProgress,
        addToWishlist,
        removeFromWishlist,
    }), [currentUser, books, users, reviews, subscriptions, preferences, readingProgress]);

    const renderDashboard = () => {
        if (!currentUser) return <LandingPage onLoginClick={() => setLoginModalOpen(true)} />;

        switch (currentUser.role) {
            case UserRole.READER:
            case UserRole.GUEST:
                return <ReaderDashboard />;
            case UserRole.AUTHOR:
                return <AuthorDashboard />;
            case UserRole.PUBLISHER:
                return <PublisherDashboard />;
            case UserRole.ADMIN:
                return <AdminDashboard />;
            case UserRole.REVIEWER:
                return <ReviewerDashboard />;
            default:
                return <LandingPage onLoginClick={() => setLoginModalOpen(true)} />;
        }
    };

    if (showSubscriptionPageForUser) {
        return (
            <SubscriptionPage
                user={showSubscriptionPageForUser}
                onComplete={completeSubscriptionAndLogin}
                onSkip={() => skipSubscriptionAndLogin(showSubscriptionPageForUser)}
            />
        );
    }


    return (
        <AppContext.Provider value={appContextValue}>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                <Header onLoginClick={() => setLoginModalOpen(true)} />
                <main className="flex-grow container mx-auto px-4 py-8">
                    {renderDashboard()}
                </main>
                <Footer />
                <LoginPage
                    isOpen={isLoginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                />
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setSettingsModalOpen(false)}
                />
                <MyAccountModal
                    isOpen={isMyAccountModalOpen}
                    onClose={() => setMyAccountModalOpen(false)}
                />
            </div>
        </AppContext.Provider>
    );
};

export default App;
