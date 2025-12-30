import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios to send cookies with every request
    axios.defaults.withCredentials = true;
    const API_URL = '/api/auth';

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await axios.get(`${API_URL}/me`);
                // Validation: Ensure we got a real user object, not HTML (from 404/rewrite)
                if (res.data && res.data._id && res.data.email) {
                    setUser(res.data);
                } else {
                    console.warn("Auth Check returned invalid data (likely HTML from 404):", res.data);
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth Check Failed:", error);
                setUser(null);
            } finally {
                console.log('Auth check finished, setLoading false');
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/login`, { email, password });
        if (res.data.requireOtp) {
            return res.data;
        }
        setUser(res.data);
        return res.data;
    };

    const verifyOtp = async (userId, otp) => {
        const res = await axios.post(`${API_URL}/verify-otp`, { userId, otp });
        setUser(res.data);
        return res.data;
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error) {
            console.error(error);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, verifyOtp, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
