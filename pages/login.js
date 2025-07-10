import React, { useState } from 'react';
// Assuming MailIcon and LockIcon are imported from a components folder or an icon library
// You might need to adjust these imports based on your actual project structure
import { MailIcon, LockIcon, UserIcon } from '../components/Icons'; // Example: if you have a custom Icons component
// Or if using a library like @heroicons/react:
// import { EnvelopeIcon as MailIcon, LockClosedIcon as LockIcon } from '@heroicons/react/24/outline';


export default function LoginPage() { // Renamed from App to LoginPage for clarity, assuming this is pages/login.js
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    // --- UPDATED: API Call to the Back-End Login Endpoint ---
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect on successful login
      window.location.href = '/dashboard'; // This will cause a full page reload

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    } finally {
      // Ensure loading state is reset even on success, before redirect
      // (though redirect will make this less visible)
      setIsLoading(false);
    }
  };

  // --- JSX RETURN BLOCK - MUST BE INSIDE THE COMPONENT FUNCTION ---
  return (
    // Main container with a gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">

      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col md:flex-row">

        {/* Left Side: Branding and Welcome Message */}
        <div className="w-full md:w-1/2 bg-blue-600 text-white p-8 md:p-12 flex flex-col justify-center items-center md:items-start rounded-t-2xl md:rounded-l-2xl md:rounded-r-none">
          <h1 className="text-3xl font-bold mb-3">The DDP Hub</h1>
          <p className="text-lg text-blue-100">Welcome back. Let's continue to build a world where every learner is seen, valued, and empowered to thrive.</p>
          <div className="mt-8">
            <svg className="w-32 h-32 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Member Login</h2>
          <p className="text-gray-600 mb-8">Please enter your details to sign in.</p>

          <form onSubmit={handleSubmit}>

            {/* Email Input */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</p>}

            {/* Submit Button */}
            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign In'}
              </button>
            </div>

            {/* Links */}
            <div className="text-center">
              <a href="#" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Forgot Password?
              </a>
            </div>
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                Don't have an account? <a href="/register" className="font-bold text-blue-500 hover:text-blue-800">Register here</a>.
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
} // <--- End of the LoginPage function

