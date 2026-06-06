import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import AboutModal from "./AboutModal";

export const useTheme = () => {
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
        } else return localStorage.theme
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
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    return [theme, isDarkMode, toggleTheme];
};

export default function NavBar(props) {
    const [, isDarkMode, toggleTheme] = useTheme();

    return <nav className="mb-2 bg-white shadow dark:bg-gray-800 flex justify-between">
        <div className="container flex items-center justify-between p-4 mx-auto text-gray-600 capitalize dark:text-gray-300">
            <div>
                <span><h2 className="text-lg font-bold">Gruppen-Tool</h2></span>
            </div>

            <AboutModal></AboutModal>

            <div className="flex gap-4">
                <div className="relative inline-block">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-900 dark:bg-gray-700"
                    >
                        {isDarkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-white" />}
                    </button>
                </div>
            </div>
        </div>
    </nav>
}