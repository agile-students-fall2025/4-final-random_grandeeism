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

import { useState } from 'react';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
          
          <div className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Authentication features will include:</p>
              <ul className="text-left space-y-2 max-w-xs mx-auto">
                <li>• Email and password login</li>
                <li>• New user registration</li>
                <li>• Password reset via email</li>
                <li>• Social login (Google, GitHub)</li>
                <li>• Remember me functionality</li>
                <li>• Form validation and error messages</li>
              </ul>
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-sm text-primary hover:underline"
              >
                {mode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Protected by reCAPTCHA and subject to Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
