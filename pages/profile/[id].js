import { UserCircleIcon, ChevronDownIcon, PlusIcon, EditIcon } from '../components/Icons';
import InviteContributorModal from '../components/InviteContributorModal';
import DDPSection from '../components/DDPSection'; // <--- DDPSection is now imported from its own file
import Link from 'next/link'; // Import Link for Next.js internal navigation
import React, { useState, useEffect } from 'react';
// Import useRouter for client-side navigation within Next.js
import { useRouter } from 'next/router';

// --- Import Icons from the central Icons.js file ---
// This assumes you have created and populated '../components/Icons.js'
// with all the icon definitions (UserCircleIcon, ChevronDownIcon, PlusIcon, EditIcon).


// --- Import Reusable Components from their new files ---
// This assumes you have created and populated these files in '../components/'



export default function ProfilePage() { // Correct component name for pages/profile/[id].js
  const router = useRouter(); // Initialize router hook
  const { id: profileIdFromRouter } = router.query; // Get profile ID from URL
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Use profileIdFromRouter directly
  const profileId = profileIdFromRouter;

  useEffect(() => {
    // Fetch user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Only fetch profile if profileId is available from router
    if (profileId) {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authorization error. Please log in.");
        setIsLoading(false);
        // Redirect to login page using router
        router.push('/login');
        return;
      }

      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          // Use process.env.NEXT_PUBLIC_API_URL
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) {
              throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
          }

          const response = await fetch(`${apiUrl}/api/profiles/${profileId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
            // Handle 401 Unauthorized specifically
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login'); // Redirect to login
                return;
            }
            throw new Error('Could not fetch profile data or you do not have permission.');
          }
          const data = await response.json();
          setProfile(data);
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError(err.message || 'An error occurred while fetching the profile.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }
  }, [profileId, router]); // Add router to dependency array as it's used inside useEffect

  const handleSaveSection = async (profileId, sectionNumber, newContent) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotification({ message: "Your session has expired. Please log in again.", type: 'error' });
      router.push('/login'); // Redirect to login
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
          throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }

      const response = await fetch(`${apiUrl}/api/profiles/${profileId}/section/${sectionNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newContent })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save changes.');
      }

      // Assuming backend returns the updated section content directly
      const updatedSectionContent = await response.json();
      setProfile(prevProfile => {
        if (!prevProfile) return prevProfile; // Defensive check
        const updatedSections = { ...prevProfile.sections };
        updatedSections[sectionNumber] = {
            ...updatedSections[sectionNumber], // Keep existing title etc.
            content: updatedSectionContent // Use the content returned from the backend
        };
        return { ...prevProfile, sections: updatedSections };
      });
      setNotification({ message: 'Section saved successfully!', type: 'success' });

    } catch (err) {
      console.error("Error saving section:", err);
      setNotification({ message: err.message || 'Server error saving section.', type: 'error' });
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleInvite = async (email, role) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotification({ message: "Your session has expired. Please log in again.", type: 'error' });
      router.push('/login'); // Redirect to login
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
          throw new Error('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }

      const response = await fetch(`${apiUrl}/api/profiles/${profile.id}/invite`, {
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
      console.error("Error inviting contributor:", err);
      setNotification({ message: err.message || 'Server error while inviting contributor.', type: 'error' });
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // --- Logout Functionality ---
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login'); // Use Next.js Router for navigation
  };

  const canEdit = user && (user.role === 'lead_professional' || user.role === 'contributor');
  const canInvite = user && user.role === 'lead_professional';

  // Render loading, error, or not found states first
  if (isLoading) return <div className="text-center p-10">Loading profile...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  // Use profile && profile.id to ensure profile data is loaded before rendering
  if (!profile || !profile.id) return <div className="text-center p-10">Profile not found or still loading.</div>;


  return (
    <div className="min-h-screen bg-gray-50">

      {/* Invite Contributor Modal */}
      <InviteContributorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onInvite={handleInvite} />

      {/* Notification Display */}
      {notification.message && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {notification.message}
        </div>
      )}

      {/* --- UPDATED: Header with Logout Functionality --- */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Use Link for internal navigation */}
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              DDP Hub
            </Link>
            <div className="flex items-center">
              {user && <span className="text-gray-700 font-medium hidden sm:block">Welcome, {user.fullName}</span>}
              <div className="ml-3 relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <UserCircleIcon className="h-8 w-8 text-gray-500" />
                  <ChevronDownIcon className="h-5 w-5 text-gray-500 ml-1" />
                </button>
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    {/* Use Link for internal navigation */}
                    {/* Corrected: Escaped single quote */}
                    <Link href="/profile/your-profile-id" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                      Your Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                      Settings
                    </Link>
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
            <h2 className="text-3xl font-bold text-gray-900">DDP Profile: {profile.learner_name}</h2> {/* Corrected to learner_name */}
            {/* Corrected: Escaped single quote */}
            <p className="mt-1 text-lg text-gray-600">Status: <span className="font-semibold text-green-700">{profile.status}</span> | Next Review: <span className="font-semibold">{profile.review_date ? new Date(profile.review_date).toLocaleDateString() : 'N/A'}</span></p>
          </div>
          {canInvite && (
            <button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
              <PlusIcon className="h-5 w-5 mr-2" /> {/* Added Tailwind classes for size/margin */}
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

