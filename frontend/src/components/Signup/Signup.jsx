import React, { useState } from 'react';
import styles from './Signup.module.css'; // Import the CSS module
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useUser } from "../../context/UserContext";
import { FaTimes } from 'react-icons/fa';


const SignupForm = () => {
    const navigate = useNavigate(); // Initialize the navigate function
    const { url } = useUser();  // Get user and setUser from context


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
                <FaTimes className={styles.closeIcon} onClick={() => navigate('/')} />
                <h2 className={styles.heading}>Registration Notice</h2>
                
                <div style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                }}>
                    <strong>Public registration is restricted.</strong><br />
                    All user accounts are assigned and created directly by administrators. Please contact your admin or customer support to obtain your login credentials.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className={styles.submitButton}
                        style={{ cursor: 'pointer' }}
                    >
                        Go to Login
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            padding: '12px',
                            background: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            color: '#495057'
                        }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
