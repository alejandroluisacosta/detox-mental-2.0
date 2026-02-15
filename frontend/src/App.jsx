import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReactDOM from 'react-dom/client';
import SessionsProvider from './Context/SessionsContext.jsx';
import ArticleWrapper from './Pages/Article/ArticleWrapper.jsx';
import Course from './Pages/Course/Course.jsx';
import Session from './Components/Session/Session.jsx';
import CourseWrapper from './Pages/Course/CourseWrapper.jsx';
import OnboardingWrapper from './Pages/Onboarding/OnboardingWrapper.jsx';
import OnboardingGate from './Pages/Onboarding/OnboardingGate.jsx';

function App() {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <SessionsProvider>
                    <Routes>
                        <Route path='/onboarding' element={<OnboardingWrapper />} />

                        {/* Onboarding gate (exclude /onboarding to avoid redirect loop) */}
                        <Route element={<OnboardingGate />}>
                            <Route path='/' element={<ArticleWrapper />} />
                            <Route path='course' element={<CourseWrapper />} />
                            <Route path='session/:sessionId' element={<Session />} />
                        </Route>
                    </Routes>
                </SessionsProvider>
            </BrowserRouter>
        </React.StrictMode>
    )
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);
