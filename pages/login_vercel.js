import React, { useState } from 'react';

// --- SVG Icon Components ---
const LockIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);


// --- Main App Component ---
// This component represents the entire login page.
export default function App() {
  // State hooks to manage the email and password input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NEW: State for loading indicator


  // This function will be called when the user submits the form.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default form submission behaviour
    setError('');
    setIsLoading(true); // NEW: Set loading state to true

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    // --- UPDATED: API Call to the Back-End Login Endpoint ---
    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            // If the server response is not successful (e.g., 401 Unauthorized)
            throw new Error(data.message || 'Invalid credentials.');
        }

        // --- NEW: Handle Successful Login ---
        // 1. Store the token securely in the browser's localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 2. Redirect to the dashboard page
        window.location.href = '/dashboard';

    } catch (err) {
        // Catch errors from the API call (e.g., invalid credentials, server down)
        setError(err.message);
        setIsLoading(false); // NEW: Reset loading state on error
    }
  };

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
}
