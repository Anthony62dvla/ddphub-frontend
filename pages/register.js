import React, { useState } from 'react';

// ... (previous code remains unchanged)

export default function App() {
  // ... (state declarations remain unchanged)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation checks remain unchanged

    // --- UPDATED: API Call to the Back-End ---
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName,
                email,
                password,
                role,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        // On success, show a confirmation message and clear the form.
        setSuccess('Registration successful! You can now log in.');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('learner');

    } catch (err) {
        setError(err.message);
    }
  };

  // ... (rest of the component remains unchanged)
}

  return (
    // Main container with a gradient background, consistent with the login page
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl flex flex-col md:flex-row">
        
        {/* Left Side: Branding and Welcome Message */}
        <div className="w-full md:w-1/2 bg-blue-600 text-white p-8 md:p-12 flex flex-col justify-center items-center md:items-start rounded-t-2xl md:rounded-l-2xl md:rounded-r-none">
          <h1 className="text-3xl font-bold mb-3">Join the DDP Hub</h1>
          <p className="text-lg text-blue-100">Create your account to begin a new journey of strengths-based planning and collaboration. Let's build a more inclusive future, together.</p>
           <div className="mt-8">
            <svg className="w-32 h-32 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
          <p className="text-gray-600 mb-8">Let's get you started.</p>

          <form onSubmit={handleSubmit}>
            
            {/* Full Name Input */}
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon /></div>
                <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Jane Doe" required />
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MailIcon /></div>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" required />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Minimum 8 characters" required />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Re-enter your password" required />
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">I am a...</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="learner">Learner / Young Person</option>
                <option value="parent">Parent / Carer</option>
                <option value="lead_professional">Lead Professional (e.g., SENCo)</option>
                <option value="contributor">Contributing Professional (e.g., Teacher, Therapist)</option>
              </select>
            </div>

            {/* Error and Success Message Display */}
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</p>}
            {success && <p className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-6">{success}</p>}

            {/* Submit Button */}
            <div className="mb-6">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300">Create Account</button>
            </div>

            {/* Link to Login */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account? <a href="/login" className="font-bold text-blue-500 hover:text-blue-800">Sign in here</a>.
              </p>
            </div>
            
          </form>
        </div>
        
      </div>
    </div>
  );

