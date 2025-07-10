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
            }
        );
        contentToSave = parsedObject;
    } catch (e) {
        console.error("Error parsing object content for section save:", e);
        // Handle error, maybe show a notification to the user
        setIsSaving(false);
        return;
    }
}

await onSave(profileId, number, contentToSave); // Pass the correctly formatted content
setIsSaving(false);
setIsEditing(false);