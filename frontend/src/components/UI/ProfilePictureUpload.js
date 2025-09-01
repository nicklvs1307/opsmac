import React, { useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { useTranslation } from 'react-i18next';

const ProfilePictureUpload = ({ currentAvatar, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setMessage('');
      setError('');
      console.log('[ProfilePictureUpload] Selected file:', file);
    } else {
      setSelectedFile(null);
      setPreview(currentAvatar || '');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(t('profile_picture_upload.select_image_error'));
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await axiosInstance.post('/settings/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[ProfilePictureUpload] Upload success response:', response.data);
      setMessage(response.data.message);
      setError('');
      if (onUploadSuccess) {
        onUploadSuccess(response.data.avatar_url);
      }
    } catch (err) {
      console.error('[ProfilePictureUpload] Upload error:', err.response?.data || err.message);
      setError(err.response?.data?.error || t('profile_picture_upload.upload_error'));
      setMessage('');
    }
  };

  return (
    <div className="profile-picture-upload-container">
      <h3>{t('profile_picture_upload.title')}</h3>
      {preview && (
        <div className="avatar-preview">
          <img
            src={preview}
            alt={t('profile_picture_upload.preview_alt')}
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile}>
        {t('profile_picture_upload.upload_button')}
      </button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ProfilePictureUpload;
