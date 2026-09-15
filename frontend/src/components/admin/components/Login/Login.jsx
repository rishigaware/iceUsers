import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { useUser } from "../../../../context/UserContext";
import styles from './Login.module.css'; // Import CSS module for styling

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, url } = useUser(); // Use the setUser function from context
  const navigate = useNavigate(); // Initialize the navigate function

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
          setUser(data.user); // Set user in context
          localStorage.setItem('user', JSON.stringify(data.user)); // Store user in localStorage

          // Redirect to the homepage ("/") after successful login
          navigate('/');
        } else {
          window.alert('User data is missing from the response');
        }
      } else {
        const data = await response.json();
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
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h2 className={styles.loginHeading}>Login</h2>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className={styles.loginButton}>Login</button>
        </form>
          <p className={styles.signupLink}>
            Don&apos;t have an account? <a href="/signup">Sign up here</a>
          </p>
      </div>
    </div>
  );
};

export default Login;
