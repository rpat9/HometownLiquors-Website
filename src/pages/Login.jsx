import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try{
            await login(email, password);
            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] fade-in">

            <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">Sign In</h2>

                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-[var(--color-text-primary)] p-2 border border-[var(--color-border)] rounded"
                />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-[var(--color-text-primary)] p-2 border border-[var(--color-border)] rounded"
                />

                <button 
                    type="submit" 
                    className="btn-primary btn-hover w-full mt-2" 
                    disabled={loading}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-md text-[var(--color-text-primary)]">Don't have an account? <a href="/signup" className="text-[var(--color-primary)]">Sign Up</a></div>

            </form>
        </div>
    )
}
