import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle("dark");
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const AuthLinks = () => (
        <>
            <Link to="/dashboard" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                Dashboard
            </Link>
            <span>
                <button
                    onClick={handleLogout}
                    className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)] cursor-pointer"
                >
                    Logout
                </button>
            </span>
        </>
    );

    const GuestLinks = () => (
        <>
            <Link to="/login" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                Login
            </Link>
            <Link to="/signup" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                Signup
            </Link>
        </>
    );

    return (
        <nav className="fixed w-full z-50 py-4 transition-all duration-300 bg-[var(--color-bg)]">
            <div className="container mx-auto px-6 md:px-8 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-[var(--color-primary)]">
                    Hometown Liquors
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                        Home
                    </Link>
                    <Link to="/products" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                        Products
                    </Link>
                    <Link to="/cart" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                        Cart
                    </Link>

                    {currentUser ? <AuthLinks /> : <GuestLinks />}

                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'}`}
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? (
                            <Sun className="text-[var(--color-primary)]" size={20} />
                        ) : (
                            <Moon className="text-[var(--color-primary)]" size={20} />
                        )}
                    </button>
                </div>

                <div className="flex items-center md:hidden">
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 mr-2 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300'} transition-colors cursor-pointer`}
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? (
                            <Sun className="text-[var(--color-primary)]" size={20} />
                        ) : (
                            <Moon className="text-[var(--color-primary)]" size={20} />
                        )}
                    </button>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="btn-primary btn-hover"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="text-[var(--button-text-color)]" size={24} />
                        ) : (
                            <Menu className="text-[var(--button-text-color)]" size={24} />
                        )}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-[var(--color-bg)] shadow-lg py-4 px-6 md:hidden opacity-90">
                    <div className="flex flex-col space-y-4">
                        <Link to="/" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                            Home
                        </Link>
                        <Link to="/products" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                            Products
                        </Link>
                        <Link to="/cart" className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                            Cart
                        </Link>

                        {currentUser ? <AuthLinks /> : <GuestLinks />}
                    </div>
                </div>
            )}
        </nav>
    );
}
