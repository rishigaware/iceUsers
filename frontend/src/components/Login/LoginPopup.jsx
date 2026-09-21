import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { useUser } from '../../context/UserContext'; // Import the useUser hook for context
import styles from './LoginPopup.module.css'; // Import CSS module for styling
import SignupPopup from '../Signup/SignupPopup';
import { checkIsAdmin } from '../../utils/roles';

const Login = ({ isOpen, isClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, url } = useUser(); // Use the setUser function from context
  const navigate = useNavigate(); // Initialize the navigate function

  const [isSignupVisible, setSignupVisible] = useState(false);

    const openSignup = () => {
        setSignupVisible(true);
    } 

    const closeSignup = () => {
        setSignupVisible(false);
    } 

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
  
    try {
      // Make a POST request to the backend API
      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:');
  
        // Check if user data exists in the response
        if (data && data.user) {
          // Store the user in context and localStorage
          setUser(data.user); // Set user in context
          localStorage.setItem('user', JSON.stringify(data.user)); // Store user in localStorage
          isClose();
          if (checkIsAdmin(data.user)) {
            navigate('/admin/home');
          } else {
            navigate('/');
          }
        } else {
          window.alert('User data is missing from the response');
        }
      } else {
        const data = await response.json(); // Extract the error message
        // Handle different error statuses
        if (response.status === 401) {
          window.alert('Invalid password');
        } else if (response.status === 404) {
          window.alert('User not found');
        } else {
          window.alert(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      window.alert('An error occurred during login');
    }

    
  };

  return (
    isOpen && (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2 className={styles.loginHeading}>Login</h2>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>
            <button type="submit" className={styles.cardButton}>
                Login
            </button>
            </form>

            <p className={styles.signupLink}>
                Don&apos;t have an account?{' '}
                <button
                    onClick={() => setSignupVisible(true)} // Open signup popup
                    className={styles.signupTrigger}
                >
                    Sign up here
                </button>
            </p>
        </div>
        {
            isSignupVisible && 
            <SignupPopup 
                    isOpen={isSignupVisible} isClose={closeSignup}
            />
        }

      </div>
    )
  );
};

export default Login;
