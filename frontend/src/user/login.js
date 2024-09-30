import React, { useState } from 'react';
import axios from 'axios';
import { X, Eye, EyeOff } from 'lucide-react';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';

const Login = ({ closeModal, onLogin }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errors, setErrors] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (isLoggingIn) return;

        if (!username || !password) {
            setErrors('Username and password are required.');
            return;
        }

        setIsLoggingIn(true);
        try {
            const response = await axios.post('http://localhost:5000/auth/login', {
                username,
                password,
            });

            const { token } = response.data;
            localStorage.setItem('token', token);
            setErrors('');

            onLogin(username, token);

            closeModal();
        } catch (error) {
            if (error.response && error.response.data.message) {
                setErrors(error.response.data.message);
            } else {
                setErrors('An error occurred while logging in. Please try again.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-contentlogin">
                <button className="close-button" onClick={closeModal}>
                    <X size={20} />
                </button>
                <h2 className="modal-title">Login</h2>

                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <div className="password-input">
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {errors && <div className="error-message">{errors}</div>}

                <button
                    className="login-button"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </div>
    );
};

export default Login;
