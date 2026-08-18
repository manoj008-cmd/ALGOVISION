import React, { useState } from 'react';
import type { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for all fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email: string) => {
    if (!email || !email.includes('@')) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      setError(null);
      setSuccessMessage(null);
      onLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again or sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!name || !studentId || !phone || !email || !password) {
      setError("Please fill in all registration fields.");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.signup({ name, studentId, phone, email, password });
      setError(null);
      setSuccessMessage("Registration successful! Please sign in with your new credentials.");
      toggleForm(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    if (isLogin) {
        handleLoginSubmit();
    } else {
        handleSignupSubmit();
    }
  };

  const toggleForm = (forceLogin = false) => {
    setIsLogin(forceLogin ? true : !isLogin);
    setError(null);
    // Don't clear success message on programmatic toggle from signup
    if (!forceLogin) {
      setSuccessMessage(null);
    }
    setEmail('');
    setPassword('');
    setName('');
    setStudentId('');
    setPhone('');
    setConfirmPassword('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-xl animate-blob"></div>
        <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-indigo-600 rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-50px] left-1/4 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:border-indigo-500">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
             {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-2 text-gray-400">
            {isLogin ? "Sign in to continue your journey." : "Visualize algorithms, master complexity."}
          </p>
        </div>
        
        {successMessage && <p className="text-sm text-green-300 text-center bg-green-900/50 p-3 rounded-md">{successMessage}</p>}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
             <>
               <InputField label="Full Name" id="name" type="text" value={name} onChange={setName} required />
               <InputField label="Student ID" id="studentId" type="text" value={studentId} onChange={setStudentId} required />
               <InputField label="Phone Number" id="phone" type="tel" value={phone} onChange={setPhone} required />
             </>
          )}

          <InputField label="College Email" id="email" type="email" value={email} onChange={(val) => { setEmail(val); setError(null); }} required placeholder="you@sode-edu.in" isError={!!error && error.includes('email')}/>
          <InputField label="Password" id="password" type="password" value={password} onChange={setPassword} required placeholder="••••••••"/>
          
          {!isLogin && (
            <InputField label="Confirm Password" id="confirmPassword" type="password" value={confirmPassword} onChange={setConfirmPassword} required placeholder="••••••••"/>
          )}

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => toggleForm()} className="font-medium text-indigo-400 hover:text-indigo-300">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Helper component for form inputs
const InputField = ({ label, id, type, value, onChange, placeholder = '', required = false, isError = false }) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 bg-gray-700/50 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 ${isError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'}`}
            placeholder={placeholder}
        />
    </div>
);


export default Auth;