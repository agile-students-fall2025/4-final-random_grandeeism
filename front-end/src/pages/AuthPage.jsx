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
import { Button } from "../components/ui/button.jsx";

const AuthPage = ({ onNavigate }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  return (
    <div className="min-h-screen bg-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-background border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          
          <div className="space-y-4">
            <div className="text-center text-primary">
                {/* <p className="mb-4">Authentication features will include:</p>
                <ul className="text-left space-y-2 max-w-xs mx-auto">
                  <li>• Email and password login</li>
                  <li>• New user registration</li>
                  <li>• Password reset via email</li>
                  <li>• Social login (Google, GitHub)</li>
                  <li>• Remember me functionality</li>
                  <li>• Form validation and error messages</li>
                </ul> */}
                <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-1 bg-card cursor-pointer mb-3 border-gray-2 p-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 rounded-md"  onClick={() => onNavigate?.('home')}>
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="h-[18px] w-[18px]"
                  />
                  Continue with Google
                </button>
                <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-1 bg-card cursor-pointer border-gray-2 p-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 rounded-md"  onClick={() => onNavigate?.('home')}>
                  <img
                    src="https://www.svgrepo.com/show/512317/github-142.svg"
                    alt="GitHub"
                    className="h-[18px] w-[18px]"
                  />
                  Continue with GitHub
                </button>
                <div className="flex items-center my-5">
                  <div className="flex-grow h-px bg-muted-foreground"></div>
                  <p className="text-sm text-center text-muted-foreground px-3">or continue with</p>
                  <div className="flex-grow h-px bg-muted-foreground"></div>
                </div>
                <div className="text-left">
                  <label for="email" className="inline-block mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="m@example.com"
                    className="flex-1 text-[14px] placeholder:text-muted-foreground border border-border rounded-md py-2 px-4 block w-full focus-within:outline-2 focus-within:outline-blue-500 bg-card"
                  />
                  <label for="password" className="inline-block mb-2 text-sm block mt-4">Password</label>
                  <input
                    type="password"
                    id="password"
                    // placeholder="Enter your password..."
                    className="flex-1 text-[14px] placeholder:text-muted-foreground border border-border rounded-md py-2 px-4 block w-full focus-within:outline-2 focus-within:outline-blue-500 bg-card"
                  />
                  {mode === 'register' ? 
                    <>
                      <label for="confirm-password" className="inline-block mb-2 text-sm mt-4">Confirm Password</label>
                      <input
                      type="password"
                      id="confirm-password"
                      // placeholder="Enter your password..."
                      className="flex-1 text-[14px] placeholder:text-muted-foreground border border-border rounded-md py-2 px-4 block w-full focus-within:outline-2 focus-within:outline-blue-500 bg-card"/>
                    </>
                  : <></>
                  }
                  <button className="flex-1 text-[14px] border border-border rounded-md py-2 px-4 block w-full hover:cursor-pointer mt-8 bg-primary text-primary-foreground font-medium" onClick={() => onNavigate?.('home')}>
                    {mode === 'login' ? 'Log In' : 'Create Account'}
                  </button>
                </div>
              <div className="text-center w-full flex justify-center align-center mt-6">
                <p className="text-center mr-2 text-sm text-muted-foreground">{mode === 'login' ? "Don't have an account?" : "Already have an account?"}</p>
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-sm text-muted-foreground hover:text-primary underline hover:cursor-pointer"
                >
                  {mode === 'login' ? "Sign up" : 'Sign in'}
                </button>


              </div>
            </div>

            
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Protected by reCAPTCHA and subject to Privacy Policy
        </p>
        {/* <Button variant="outline">Button</Button> */}
      </div>
    </div>
  );
};

export default AuthPage;