import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReactDOM from 'react-dom/client';
import AuthProvider from './Context/AuthContext.jsx';
import SessionsProvider from './Context/SessionsContext.jsx';
import ArticleWrapper from './Pages/Article/ArticleWrapper.jsx';
import Session from './Components/Session/Session.jsx';
import CourseWrapper from './Pages/Course/CourseWrapper.jsx';
import OnboardingWrapper from './Pages/Onboarding/OnboardingWrapper.jsx';
import OnboardingGate from './Pages/Onboarding/OnboardingGate.jsx';
import Login from './Pages/Auth/Login.jsx';
import AuthError from './Pages/Auth/AuthError.jsx';
import AuthSessionToast from './Components/AuthSessionToast/AuthSessionToast.jsx';
import Account from './Pages/Account/Account.jsx';
import Instructions from './Pages/Instructions/Instructions.jsx';
import PaymentSuccess from './Pages/Payment/PaymentSuccess.jsx';
import PaymentCancel from './Pages/Payment/PaymentCancel.jsx';
import Promo from './Pages/Promo/Promo.jsx';
import ScrollToTop from './Components/ScrollToTop/ScrollToTop.jsx';

function App() {
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
                            <Route path='promo' element={<Promo />} />
                            <Route path='instructions' element={<Instructions />} />
                            <Route path='account' element={<Account />} />
                            <Route path='session/:sessionId' element={<Session />} />
                        </Route>
                    </Routes>
                </SessionsProvider>
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    )
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);
