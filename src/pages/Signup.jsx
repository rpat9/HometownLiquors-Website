import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFirestore } from "../contexts/FirestoreContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const { signup } = useAuth();
    const { createUserProfile } = useFirestore();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            
            const userCredential = await signup(email, password);
            const userId = userCredential.user.uid;

            await createUserProfile(userId, {
                createdAt: new Date(),
                email,
                name,
                userId,
                password,
                notificationPreferences: {
                    lowStock: true,
                    newStock: true,
                    restockAlerts: true
                },
                orderHistory: [],
                favorites: []
            });

            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] fade-in">
            <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">Sign Up</h2>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-[var(--color-text-primary)] p-2 border border-gray-300 rounded"
                />

                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-[var(--color-text-primary)] p-2 border border-gray-300 rounded"
                />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-[var(--color-text-primary)] p-2 border border-gray-300 rounded"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-[var(--color-text-primary)] p-2 border border-gray-300 rounded"
                />

                <button 
                    type="submit" 
                    className="btn-primary btn-hover w-full mt-2" 
                    disabled={loading}
                >
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>

                <div className="text-md text-[var(--color-text-primary)]">
                    By signing up, you confirm that you are 21 years or older and acknowledge that you browse at your own risk.
                </div>

                <div className="text-md text-[var(--color-text-primary)]">
                    Already have an account? <a href="/login" className="text-[var(--color-primary)] hover:underline">Sign In</a>
                </div>
            </form>
        </div>
    );
}