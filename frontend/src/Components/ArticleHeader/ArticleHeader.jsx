import { useState, useEffect, useRef } from 'react';
import './ArticleHeader.css';

const ArticleHeader = () => {
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);
    const scrollUpDistance = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current) {
                setHidden(true);
                scrollUpDistance.current = 0;
            } else {
                scrollUpDistance.current += lastScrollY.current - currentScrollY;

                if (scrollUpDistance.current > 500) {
                    setHidden(false);
                }
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`sticky-header ${hidden ? "sticky-header--hidden" : ""}`}>
            <h1>Cómo liberarte de los pensamientos que te atormentan en 5 pasos</h1>
        </header>
    )
}

export default ArticleHeader