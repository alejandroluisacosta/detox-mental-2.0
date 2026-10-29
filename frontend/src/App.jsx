import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthProvider from './Context/AuthContext.jsx';
import SessionsProvider from './Context/SessionsContext.jsx';
import Article from './Pages/Article/Article.jsx';
import Session from './Components/Session/Session.jsx';
import Course from './Pages/Course/Course.jsx';
import Onboarding from './Pages/Onboarding/Onboarding.jsx';
import ThoughtsTest from './Pages/ThoughtsTest/ThoughtsTest.jsx';
import Login from './Pages/Login/Login.jsx';
import AuthError from './Pages/AuthError/AuthError.jsx';
import AuthSessionToast from './Components/AuthSessionToast/AuthSessionToast.jsx';
import Account from './Pages/Account/Account.jsx';
import Instructions from './Pages/Instructions/Instructions.jsx';
import PaymentSuccess from './Pages/Payment/PaymentSuccess.jsx';
import PaymentCancel from './Pages/Payment/PaymentCancel.jsx';
import PromoGate from './Pages/Promo/PromoGate.jsx';
import Tests from './Pages/Tests/Tests.jsx';
import Journal from './Pages/Journal/Journal.jsx';
import JournalHistory from './Pages/JournalHistory/JournalHistory.jsx';
import JournalMeditations from './Pages/JournalMeditations/JournalMeditations.jsx';
import JournalSummary from './Pages/JournalSummary/JournalSummary.jsx';
import JournalFirstReflection from './Pages/JournalFirstReflection/JournalFirstReflection.jsx';
import Home from './Pages/Home/Home.jsx';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop.jsx';
import { DemoModeProvider } from './Context/DemoModeContext.jsx';
import { JournalTopicsProvider } from './Context/JournalTopicsContext.jsx';
import { LocaleProvider } from './Context/LocaleContext.jsx';

const App = () => {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <ScrollToTop />
                <LocaleProvider>
                    <AuthProvider>
                        <JournalTopicsProvider>
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
                                        <Route path='/journal/meditations' element={<JournalMeditations />} />
                                        <Route path='/journal/summary' element={<JournalSummary />} />
                                        <Route path='/journal/first-reflection' element={<JournalFirstReflection />} />

                                        {/* Educational module */}
                                        <Route path='/onboarding' element={<Onboarding />} />
                                        <Route path='/payment/success' element={<PaymentSuccess />} />
                                        <Route path='/payment/cancel' element={<PaymentCancel />} />
                                        <Route path='/theory' element={<Article />} />
                                        <Route path='/course' element={<Course />} />
                                        <Route path='/session/:sessionId' element={<Session />} />
                                        <Route path='/instructions' element={<Instructions />} />
                                        <Route path='/tests' element={<Tests />} />
                                        <Route path='/test/:testId' element={<ThoughtsTest />} />
                                        <Route path='/promo' element={<PromoGate />} />
                                    </Routes>
                                </SessionsProvider>
                            </DemoModeProvider>
                        </JournalTopicsProvider>
                    </AuthProvider>
                </LocaleProvider>
            </BrowserRouter>
        </React.StrictMode>
    )
}

export default App;
