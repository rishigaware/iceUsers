import React, { useState } from 'react';
import styles from './Signup.module.css'; // Import the CSS module
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useUser } from "../../../../context/UserContext";


const SignupForm = () => {
    const navigate = useNavigate(); // Initialize the navigate function
    const { url } = useUser();


    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        agentCode: '',
    });

    const [errors, setErrors] = useState({});

    // Validate email format
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validate phone number format
    const validatePhoneNumber = (phoneNumber) => /^\d{10}$/.test(phoneNumber);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation logic
        if (!formData.name.trim()) newErrors.name = 'Name is required.';
        if (!formData.username.trim()) newErrors.username = 'Username is required.';
        if (!formData.email.trim()) newErrors.email = 'Email is required.';
        else if (!validateEmail(formData.email)) newErrors.email = 'Enter a valid email.';

        if (!formData.password) newErrors.password = 'Password is required.';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm your password.';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required.';
        else if (!validatePhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10 digits.';

        if (!formData.agentCode.trim()) newErrors.agentCode = 'Agent code is required.';

        setErrors(newErrors);

        // If no errors, submit the form
        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await fetch(`${url}/api/user/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    alert('Signup successful!');
                    setFormData({
                        name: '',
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phoneNumber: '',
                        agentCode: '',
                    });
                    navigate('/login');

                } else {
                    const errorData = await response.json();
                    alert(`Signup failed: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.heading}>Signup Form</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        {errors.confirmPassword && (
                            <p className={styles.errorText}>{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            placeholder="Enter your phone number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        {errors.phoneNumber && (
                            <p className={styles.errorText}>{errors.phoneNumber}</p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="agentCode" className={styles.label}>Agent Code</label>
                        <input
                            type="text"
                            id="agentCode"
                            name="agentCode"
                            placeholder="Enter agent code"
                            value={formData.agentCode}
                            onChange={handleChange}
                            className={styles.input}
                        />
                        {errors.agentCode && (
                            <p className={styles.errorText}>{errors.agentCode}</p>
                        )}
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        Signup
                    </button>
                </form>
                <div className={styles.signupLink}>
                    <button
                        className={styles.signupTrigger}
                        onClick={() => navigate('/login')} // Navigate to /login
                    >
                        Already have an account? Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
