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
import JournalHistory from './Pages/JournalHistory/JournalHistory.jsx';
import JournalSummary from './Pages/JournalSummary/JournalSummary.jsx';
import Home from './Pages/Home/Home.jsx';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop.jsx';
import { DemoModeProvider } from './Context/DemoModeContext.jsx';
import { LocaleProvider } from './Context/LocaleContext.jsx';

const App = () => {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <ScrollToTop />
                <LocaleProvider>
                    <AuthProvider>
                        <AuthSessionToast />
                        <DemoModeProvider>
                            <SessionsProvider>
                                <Routes>
                                    {/* Shared */}
                                    <Route path='/' element={<Home />} />
                                    <Route path='/login' element={<Login />} />
                                    <Route path='/auth/error' element={<AuthError />} />
                                    <Route path='/account' element={<Account />} />

                                    {/* Journaling module — independent of onboarding */}
                                    <Route path='/journal' element={<Journal />} />
                                    <Route path='/journal/history' element={<JournalHistory />} />
                                    <Route path='/journal/summary' element={<JournalSummary />} />

                                    {/* Educational module */}
                                    <Route path='/onboarding' element={<OnboardingWrapper />} />
                                    <Route path='/payment/success' element={<PaymentSuccess />} />
                                    <Route path='/payment/cancel' element={<PaymentCancel />} />
                                    <Route element={<OnboardingGate />}>
                                        <Route path='/theory' element={<ArticleWrapper />} />
                                        <Route path='/course' element={<CourseWrapper />} />
                                        <Route path='/session/:sessionId' element={<Session />} />
                                        <Route path='/instructions' element={<Instructions />} />
                                        <Route path='/tests' element={<Tests />} />
                                        <Route path='/test/:testId' element={<ThoughtsTest />} />
                                        <Route path='/promo' element={<PromoGate />} />
                                    </Route>
                                </Routes>
                            </SessionsProvider>
                        </DemoModeProvider>
                    </AuthProvider>
                </LocaleProvider>
            </BrowserRouter>
        </React.StrictMode>
    )
}

export default App;
