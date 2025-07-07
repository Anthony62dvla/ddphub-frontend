import React, { useState, useEffect } from 'react';

// --- SVG Icon Components ---
const UserCircleIcon = () => (
  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ChevronDownIcon = () => (
    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const EditIcon = () => (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);
const PlusIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);

// --- Reusable Components ---

const InviteContributorModal = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('contributor');

    if (!isOpen) return null;

    const handleInviteClick = () => {
        if (email) {
            onInvite(email, role);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Invite a Contributor</h3>
                <p className="text-gray-600 mb-6">Enter the email address of the professional you would like to invite.</p>
                <div className="mb-4">
                    <label htmlFor="invite-email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                    <input type="email" id="invite-email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="colleague@example.com" />
                </div>
                <div className="mb-6">
                    <label htmlFor="invite-role" className="block text-gray-700 text-sm font-bold mb-2">Assign Role</label>
                    <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="contributor">Contributing Professional</option>
                        <option value="viewer">Viewer Only</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">Cancel</button>
                    <button onClick={handleInviteClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Send Invitation</button>
                </div>
            </div>
        </div>
    );
};

const DDPSection = ({ number, title, content, onSave, profileId, canEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (typeof content === 'string') {
            setEditedContent(content);
        } else if (Array.isArray(content)) {
            setEditedContent(content.join('\n'));
        } else if (typeof content === 'object' && content !== null) {
            setEditedContent(Object.entries(content).map(([key, value]) => `${key}: ${value}`).join('\n'));
        }
    }, [content]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(profileId, number, editedContent);
        setIsSaving(false);
        setIsEditing(false);
    };

    const renderContent = () => {
        if (Array.isArray(content)) {
            return <ul className="list-disc list-inside space-y-2">{content.map((item, index) => <li key={index}>{item}</li>)}</ul>;
        }
        if (typeof content === 'object' && content !== null) {
            return <ul className="space-y-2">{Object.entries(content).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}</ul>;
        }
        return <p className="whitespace-pre-wrap">{content}</p>;
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-blue-700">{number}. {title}</h4>
                    {canEdit && !isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                            <EditIcon /><span className="ml-1">Edit</span>
                        </button>
                    )}
                </div>
                <div className="text-gray-700 text-base leading-relaxed">
                    {isEditing ? (
                        <textarea className="w-full h-48 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
                    ) : (
                        renderContent()
                    )}
                </div>
            </div>
            {isEditing && (
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300" disabled={isSaving}>Cancel</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center" disabled={isSaving}>
                        {isSaving && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main App Component for the Profile Page ---
export default function App() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // NEW: State for user dropdown menu

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const parts = path.split('/');
        const id = parts[parts.length - 1];
        setProfileId(id || '1'); 
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    
    if (profileId) {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authorization error. Please log in.");
            setIsLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/profiles/${profileId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Could not fetch profile data or you do not have permission.');
                }
                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }
  }, [profileId]);

  const handleSaveSection = async (profileId, sectionNumber, newContent) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setNotification({ message: "Your session has expired. Please log in again.", type: 'error' });
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3001/api/profiles/${profileId}/section/${sectionNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ newContent })
        });

        if (!response.ok) { throw new Error('Failed to save changes.'); }

        const updatedSection = await response.json();
        setProfile(prevProfile => ({
            ...prevProfile,
            sections: { ...prevProfile.sections, [sectionNumber]: updatedSection }
        }));
        setNotification({ message: 'Section saved successfully!', type: 'success' });

    } catch (err) {
        setNotification({ message: err.message, type: 'error' });
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleInvite = async (email, role) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setNotification({ message: "Your session has expired. Please log in again.", type: 'error' });
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/profiles/${profile.id}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ email, role })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send invitation.');
        }
        
        setNotification({ message: data.message, type: 'success' });

    } catch (err) {
        setNotification({ message: err.message, type: 'error' });
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // --- NEW: Logout Functionality ---
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const canEdit = user && (user.role === 'lead_professional' || user.role === 'contributor');
  const canInvite = user && user.role === 'lead_professional';


  if (isLoading) return <div className="text-center p-10">Loading profile...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!profile) return <div className="text-center p-10">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <InviteContributorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onInvite={handleInvite} />

      {notification.message && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {notification.message}
        </div>
      )}

      {/* --- UPDATED: Header with Logout Functionality --- */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/dashboard" className="text-xl font-bold text-blue-600">DDP Hub</a>
            <div className="flex items-center">
              {user && <span className="text-gray-700 font-medium hidden sm:block">Welcome, {user.fullName}</span>}
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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">DDP Profile: {profile.learnerName}</h2>
                <p className="mt-1 text-lg text-gray-600">Status: <span className="font-semibold text-green-700">{profile.status}</span> | Next Review: <span className="font-semibold">{profile.reviewDate}</span></p>
            </div>
            {canInvite && (
                <button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
                    <PlusIcon />
                    Invite Contributor
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.sections && Object.entries(profile.sections).map(([number, { title, content }]) => (
                <DDPSection 
                    key={number} 
                    profileId={profile.id}
                    number={number} 
                    title={title} 
                    content={content}
                    onSave={handleSaveSection}
                    canEdit={canEdit}
                />
            ))}
        </div>

      </main>
    </div>
  );
}

