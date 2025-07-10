// ddphub-frontend/components/CreateProfileModal.js
import React, { useState } from 'react';

const CreateProfileModal = ({ isOpen, onClose, onCreate }) => {
  const [learnerName, setLearnerName] = useState('');

  if (!isOpen) return null;

  const handleCreateClick = () => {
    if (learnerName.trim()) {
      onCreate(learnerName);
      setLearnerName(''); // Clear input after creation
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Create New DDP Profile</h3>
        <p className="text-gray-600 mb-6">Enter the name of the learner for this new profile.</p>
        <div className="mb-4">
          <label htmlFor="learner-name" className="block text-gray-700 text-sm font-bold mb-2">Learner&apos;s Name</label>
          <input
            type="text"
            id="learner-name"
            value={learnerName}
            onChange={(e) => setLearnerName(e.target.value)}
            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Alex Smith"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">Cancel</button>
          <button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Create Profile</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProfileModal;