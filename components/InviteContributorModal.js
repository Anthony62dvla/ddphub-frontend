// ddphub-frontend/components/InviteContributorModal.js
import React, { useState } from 'react';

const InviteContributorModal = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('contributor'); // Default role for invitation

  if (!isOpen) return null; // Don't render if not open

  const handleInviteClick = () => {
    if (email) {
      onInvite(email, role);
      setEmail(''); // Clear email after inviting
      setRole('contributor'); // Reset role
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

export default InviteContributorModal;