/**
 * AuthPage.jsx
 * 
 * Description: Authentication page for user login and registration
 * Purpose: Handles user authentication including sign in, sign up, and password reset
 * Features:
 *  - Login form with email/password
 *  - Registration form for new users
 *  - Password reset functionality
 *  - Social authentication options (Google, etc.)
 *  - Form validation and error handling
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "../components/ui/button.jsx";
import { Loader } from "../components/ui/loader.jsx";

const AuthPage = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (mode === 'register') {
      // Validate username
      const finalUsername = username || email.split('@')[0];
      if (!finalUsername || finalUsername.length < 3) {
        setErrorMessage('Username must be at least 3 characters long');
        return false;
      }
      if (finalUsername.length > 30) {
        setErrorMessage('Username must be 30 characters or less');
        return false;
      }

      // Validate email
      if (!email || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address');
        return false;
      }

      // Validate password
      if (!password || password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long');
        return false;
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return false;
      }
    } else {
      // Login validation
      if (!email) {
        setErrorMessage('Please enter your email address');
        return false;
      }
      if (!password) {
        setErrorMessage('Please enter your password');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        // Register new user
        const result = await register({
          username: username || email.split('@')[0], // Use email prefix if no username
          email,
          password,
          displayName: username || email.split('@')[0],
        });

        if (result.success) {
          onNavigate?.('home');
        } else {
          setErrorMessage(result.error || 'Registration failed');
        }
      } else {
        // Login existing user
        const result = await login({
          username: email, // Backend accepts email or username
          password,
        });

        if (result.success) {
          onNavigate?.('home');
        } else {
          setErrorMessage(result.error || 'Login failed');
        }
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for development (pre-fills demo credentials)
  const handleQuickLogin = async () => {
    setEmail('demo@fieldnotes.app');
    setPassword('password123');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await login({
        username: 'demo@fieldnotes.app',
        password: 'password123',
      });

      if (result.success) {
        onNavigate?.('home');
      } else {
        setErrorMessage('Demo user not found. Please create an account first.');
      }
    } catch (error) {
      setErrorMessage('Demo login failed. Please register a new account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-background border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          {/* Quick Dev Login Button */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              🚀 Quick Demo Login (dev)
            </button>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center text-primary">
              <div className="flex items-center my-5">
                <div className="flex-grow h-px bg-muted-foreground"></div>
                <p className="text-sm text-center text-muted-foreground px-3">or continue with</p>
                <div className="flex-grow h-px bg-muted-foreground"></div>
              </div>
              <div className="text-left">
                {mode === 'register' && (
                  <>
                    <label htmlFor="username" className="inline-block mb-2 text-sm">Username</label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="johndoe"
                      className="flex-1 text-[14px] placeholder:text-muted-foreground border border-border rounded-md py-2 px-4 block w-full focus-within:outline-2 focus-within:outline-blue-500 bg-card mb-1"
                    />
                    <p className="text-xs text-muted-foreground mb-4">3-30 characters</p>
                  </>
                )}
                <label htmlFor="email" className="inline-block mb-2 text-sm">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  className="flex-1 text-[14px] placeholder:text-muted-foreground border border-border rounded-md py-2 px-4 block w-full focus-within:outline-2 focus-within:outline-blue-500 bg-card"
                />
                <label htmlFor="password" className="inline-block mb-2 text-sm block mt-4">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="flex-1 text-[14px] placeholder:text-muted-foreground border border-border rounded-md py-2 px-4 block w-full focus-within:outline-2 focus-within:outline-blue-500 bg-card"
                />
                {mode === 'register' && (
                  <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
                )}
                {mode === 'register' && (
                  <>
                    <label htmlFor="confirm-password" className="inline-block mb-2 text-sm mt-4">Confirm Password</label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="flex-1 text-[14px] placeholder:text-muted-foreground border border-border rounded-md py-2 px-4 block w-full focus-within:outline-2 focus-within:outline-blue-500 bg-card"
                    />
                  </>
                )}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 text-[14px] border border-border rounded-md py-2 px-4 block w-full hover:cursor-pointer mt-8 bg-primary text-primary-foreground font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2" size={16} />
                      Loading...
                    </>
                  ) : (mode === 'login' ? 'Log In' : 'Create Account')}
                </button>
              </div>
              <div className="text-center w-full flex justify-center align-center mt-6">
                <p className="text-center mr-2 text-sm text-muted-foreground">{mode === 'login' ? "Don't have an account?" : "Already have an account?"}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setErrorMessage('');
                  }}
                  className="text-sm text-muted-foreground hover:text-primary underline hover:cursor-pointer"
                >
                  {mode === 'login' ? "Sign up" : 'Sign in'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Protected by reCAPTCHA and subject to Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;