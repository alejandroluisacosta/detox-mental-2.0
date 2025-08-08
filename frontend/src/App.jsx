import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReactDOM from 'react-dom/client';
import Article from './Pages/Article/Article.jsx';
import Course from './Pages/Course/Course.jsx';
import Session from './Pages/Session/Session.jsx';

function App() {
    return (
        <React.StrictMode>
            <BrowserRouter>
            <Routes>
                <Route path='/' element={<Article />} />
                <Route path='course' element={<Course />} />
                <Route path='session/:session' element={<Session />} />
            </Routes>
            </BrowserRouter>
        </React.StrictMode>
    )
}

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<App />);
