import { Sun, Moon } from "lucide-react";
import AboutModal from "./AboutModal";
import { useTheme } from "./ThemeContext";

export default function NavBar(props) {
    const { isDarkMode, toggleTheme } = useTheme();

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