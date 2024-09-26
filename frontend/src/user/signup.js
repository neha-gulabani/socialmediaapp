import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../styles/signup.css';

const Register = ({ closeModal }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:5000/auth/signup', {
                username,
                password,
            });
            setSuccessMessage(`User ${response.data.username} registered successfully!`);
            setErrorMessage(''); // Clear any previous error message
        } catch (error) {
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('An error occurred while registering. Please try again.');
            }
            setSuccessMessage(''); // Clear any previous success message
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-contentsignup">
                <button className="close-button" onClick={closeModal}>
                    <X size={20} />
                </button>
                <h2 className="modal-title">Register</h2>

                {errorMessage && <div className="error-message">{errorMessage}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input">
                        <input
                            type={passwordVisible ? "text" : "password"}
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

                <button className="register-button" onClick={handleRegister}>Register</button>
            </div>
        </div>
    );
};

export default Register;


