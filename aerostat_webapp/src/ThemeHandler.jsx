import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const ThemeHandler = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return window.localStorage.getItem('theme') || 'light';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        window.localStorage.setItem('theme', newTheme);
    };
    useEffect(() => {
        window.localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeHandler;
