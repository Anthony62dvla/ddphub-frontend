import React, { useState, useEffect } from 'react';

// --- SVG Icon Components ---
const UserCircleIcon = () => (
  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const PlusIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);

// --- Create Profile Modal Component ---
const CreateProfileModal = ({ isOpen, onClose, onCreate }) => {
    const [learnerName, setLearnerName] = useState('');

    if (!isOpen) return null;

    const handleCreate = () => {
        if (learnerName.trim()) {
            onCreate(learnerName);
            setLearnerName(''); // Reset field
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Create New DDP Profile</h3>
                <p className="text-gray-600 mb-6">Enter the full name of the learner to begin creating their new DDP.</p>
                
                <div className="mb-6">
                    <label htmlFor="learner-name" className="block text-gray-700 text-sm font-bold mb-2">Learner's Full Name</label>
                    <input 
                        type="text" 
                        id="learner-name"
                        value={learnerName}
                        onChange={(e) => setLearnerName(e.target.value)}
                        className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Jamie Smith"
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                        Cancel
                    </button>
                    <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        Create Profile
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Helper function to determine status color ---
const getStatusClass = (status) => {
    switch (status) {
        case 'Active':
            return 'bg-green-100 text-green-800';
        case 'In Review':
            return 'bg-yellow-100 text-yellow-800';
        case 'Awaiting Learner Input':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// --- Main App Component ---
export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // NEW: State for user dropdown menu

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
            const response = await fetch('http://localhost:3001/api/profiles', {
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
        const response = await fetch('http://localhost:3001/api/profiles', {
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
