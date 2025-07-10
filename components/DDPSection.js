// ddphub-frontend/components/DDPSection.js
import React, { useState, useEffect } from 'react';
// Import EditIcon from your central Icons.js file
import { EditIcon } from './Icons'; // Path relative to components/

const DDPSection = ({ number, title, content, onSave, profileId, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize editedContent based on the type of content
    if (typeof content === 'string') {
      setEditedContent(content);
    } else if (Array.isArray(content)) {
      setEditedContent(content.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join('\n')); // Handle array of objects
    } else if (typeof content === 'object' && content !== null) {
      // Handle object content (e.g., for section 11)
      setEditedContent(Object.entries(content).map(([key, value]) => `${key}: ${value}`).join('\n'));
    } else {
        setEditedContent(''); // Default for null/undefined content
    }
  }, [content]); // Re-run when content prop changes

  const handleSave = async () => {
    setIsSaving(true);
    let contentToSave = editedContent;

    // Convert editedContent back to the appropriate format based on section number
    // Ensure these section numbers match your DDP structure's array/object types
    if (['3', '5', '9', '10'].includes(number)) { // Sections that are arrays
        contentToSave = editedContent.split('\n').filter(item => item.trim() !== '');
    } else if (['1', '11'].includes(number)) { // Sections that are objects
        try {
            const parsedObject = {};
            editedContent.split('\n').forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    parsedObject[key] = value;
                }
            });
            contentToSave = parsedObject;
        } catch (e) {
            console.error("Error parsing object content for section save:", e);
            // Handle error, maybe show a notification to the user
            setIsSaving(false);
            return;
        }
    }

    // This is the correct placement for the await onSave call and its surrounding logic
    await onSave(profileId, number, contentToSave); // Pass the correctly formatted content
    setIsSaving(false);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (Array.isArray(content)) {
      return <ul className="list-disc list-inside space-y-2">{content.map((item, index) => <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>)}</ul>;
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

export default DDPSection;
