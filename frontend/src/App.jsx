import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthProvider from './Context/AuthContext.jsx';
import SessionsProvider from './Context/SessionsContext.jsx';
import ArticleWrapper from './Pages/Article/ArticleWrapper.jsx';
import Session from './Components/Session/Session.jsx';
import CourseWrapper from './Pages/Course/CourseWrapper.jsx';
import OnboardingWrapper from './Pages/Onboarding/OnboardingWrapper.jsx';
import OnboardingGate from './Pages/Onboarding/OnboardingGate.jsx';
import ThoughtsTest from './Pages/ThoughtsTest/ThoughtsTest.jsx';
import Login from './Pages/Auth/Login.jsx';
import AuthError from './Pages/Auth/AuthError.jsx';
import AuthSessionToast from './Components/AuthSessionToast/AuthSessionToast.jsx';
import Account from './Pages/Account/Account.jsx';
import Instructions from './Pages/Instructions/Instructions.jsx';
import PaymentSuccess from './Pages/Payment/PaymentSuccess.jsx';
import PaymentCancel from './Pages/Payment/PaymentCancel.jsx';
import PromoGate from './Pages/Promo/PromoGate.jsx';
import Tests from './Pages/Tests/Tests.jsx';
import Journal from './Pages/Journal/Journal.jsx';
import JournalHistory from './Pages/Journal/JournalHistory.jsx';
import JournalSummary from './Pages/Journal/JournalSummary.jsx';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop.jsx';

const App = () => {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <ScrollToTop />
                <AuthProvider>
                    <AuthSessionToast />
                <SessionsProvider>
                    <Routes>
                        <Route path='/onboarding' element={<OnboardingWrapper />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/auth/error' element={<AuthError />} />
                        <Route path='/payment/success' element={<PaymentSuccess />} />
                        <Route path='/payment/cancel' element={<PaymentCancel />} />

                        {/* Onboarding gate (exclude /onboarding to avoid redirect loop) */}
                        <Route element={<OnboardingGate />}>
                            <Route path='/' element={<ArticleWrapper />} />
                            <Route path='course' element={<CourseWrapper />} />
                            <Route path='promo' element={<PromoGate />} />
                            <Route path='instructions' element={<Instructions />} />
                            <Route path='account' element={<Account />} />
                            <Route path='tests' element={<Tests />} />
                            <Route path='test/:testId' element={<ThoughtsTest />} />
                            <Route path='journal/history' element={<JournalHistory />} />
                            <Route path='journal/summary' element={<JournalSummary />} />
                            <Route path='journal' element={<Journal />} />
                            <Route path='session/:sessionId' element={<Session />} />
                        </Route>
                    </Routes>
                </SessionsProvider>
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    )
}

export default App;
