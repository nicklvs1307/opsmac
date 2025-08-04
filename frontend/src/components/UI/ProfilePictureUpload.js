import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ProfilePictureUpload = ({ currentAvatar, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      setError('Por favor, selecione uma imagem para upload.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await axiosInstance.post('/api/settings/profile/avatar', formData, {
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
      setError(err.response?.data?.error || 'Erro ao fazer upload do avatar.');
      setMessage('');
    }
  };

  return (
    <div className="profile-picture-upload-container">
      <h3>Foto de Perfil</h3>
      {preview && (
        <div className="avatar-preview">
          <img src={preview} alt="Prévia do Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile}>Upload Avatar</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ProfilePictureUpload;
