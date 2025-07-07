import React, { useState, useEffect } from 'react';

// ... (previous code remains unchanged)

export default function App() {
  // ... (state declarations remain unchanged)

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    if (!token) {
        setError("Authorization error. Please log in to view your dashboard.");
        setIsLoading(false);
        return;
    }

    const fetchProfiles = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/api/profiles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) { throw new Error('Failed to fetch profiles.'); }
            const data = await response.json();
            setProfiles(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchProfiles();
  }, []);

  const handleCreateProfile = async (learnerName) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setError("Your session has expired. Please log in again.");
        return;
    }

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ learnerName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create new profile.');
        }

        const newProfile = await response.json();
        setProfiles(prevProfiles => [newProfile, ...prevProfiles]);

    } catch (err) {
        setError(err.message);
    }
  };

  // --- NEW: Logout Functionality ---
  const handleLogout = () => {
    // Clear user data and token from storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Redirect to the login page
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <CreateProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProfile}
      />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">DDP Hub</h1>
            </div>
            <div className="flex items-center">
              {user && <span className="text-gray-700 font-medium hidden sm:block">Welcome, {user.fullName}</span>}
              
              {/* --- NEW: User Dropdown Menu --- */}
              <div className="ml-3 relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <UserCircleIcon />
                  <ChevronDownIcon />
                </button>
                {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Log Out
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Your DDP Dashboard</h2>
          
          {user && user.role === 'lead_professional' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              <PlusIcon />
              Create New DDP Profile
            </button>
          )}
        </div>

        {isLoading ? (
            <p className="text-center text-gray-500">Loading profiles...</p>
        ) : error ? (
            <div className="text-center bg-red-100 text-red-700 p-4 rounded-lg">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.length > 0 ? profiles.map((profile) => (
                <div key={profile.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800">{profile.learnerName}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusClass(profile.status)}`}>
                        {profile.status}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-2 text-sm">Last Updated: {profile.last_updated ? new Date(profile.last_updated).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 px-6 py-4">
                    <a href={`/profile/${profile.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                      View Profile &rarr;
                    </a>
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 col-span-full mt-8 bg-white p-8 rounded-lg shadow">
                    <h3 className="text-xl font-semibold">No DDP Profiles Found</h3>
                    {user && user.role === 'lead_professional' && (
                        <p className="mt-2">Click the "Create New DDP Profile" button to get started.</p>
                    )}
                </div>
              )}
            </div>
        )}

      </main>
    </div>
  );
}
