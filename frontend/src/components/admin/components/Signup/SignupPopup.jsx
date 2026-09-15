import React, { useState } from 'react';
import styles from './SignupPopup.module.css';
import { useUser } from "../../../../context/UserContext";

const SignupPopup = ({ isOpen, isClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
    });
    const { url } = useUser();
    const [errors, setErrors] = useState({});

    // Email and phone number validators
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhoneNumber = (phoneNumber) => /^\d{10}$/.test(phoneNumber);

    // Handle input change
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

        if (!formData.name.trim()) newErrors.name = 'Name is required.';
        if (!formData.username.trim()) newErrors.username = 'Username is required.';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Enter a valid email.';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required.';
        } else if (!validatePhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be 10 digits.';
        }

        setErrors(newErrors);

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
                    });
                    isClose(); // Close the modal
                } else {
                    const errorData = await response.json();
                    alert(`Signup failed: ${errorData.message}`);
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                
                <h2 className={styles.heading}>Signup Form</h2>
                <form onSubmit={handleSubmit}>
                    {['name', 'username', 'email', 'password', 'confirmPassword', 'phoneNumber'].map(
                        (field, index) => (
                            <div key={index} className={styles.formGroup}>
                                <label htmlFor={field} className={styles.label}>
                                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                                </label>
                                <input
                                    type={field.includes('password') ? 'password' : 'text'}
                                    id={field}
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder={`Enter your ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                                />
                                {errors[field] && (
                                    <p className={styles.errorText}>{errors[field]}</p>
                                )}
                            </div>
                        )
                    )}
                    <button type="submit" className={styles.submitButton}>
                        Signup
                    </button>
                </form>

                <p className={styles.signupLink}>
                    <button
                        onClick={isClose} // Open signup popup
                        className={styles.signupTrigger}
                    >
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignupPopup;
