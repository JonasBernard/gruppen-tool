import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const getSystemTheme = () => {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    const saveTheme = (theme) => {
        localStorage.theme = theme;
    }

    const loadTheme = () => {
        if (!('theme' in localStorage)) {
            const theme = getSystemTheme();
            saveTheme(theme);
            return theme;
        } else return localStorage.theme;
    }

    const [theme, setTheme] = useState(loadTheme());
    const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    useEffect(() => {
        saveTheme(theme);
        setIsDarkMode(theme === 'dark');
        realizeTheme(theme);
    }, [theme]);

    const realizeTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};