import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Experienced software developer with a passion for creating innovative solutions.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    experience: '5+ years',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditForm(prev => ({
      ...prev,
      skills
    }));
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.4 }}>Profile</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Manage your personal information and preferences
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Personal Information</div>
              {!isEditing ? (
                <button 
                  className="btn" 
                  onClick={() => setIsEditing(true)}
                  style={{ padding: '8px 12px', fontSize: 14 }}
                >
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn" 
                    onClick={handleSave}
                    style={{ padding: '8px 12px', fontSize: 14 }}
                  >
                    Save
                  </button>
                  <button 
                    className="btn" 
                    onClick={handleCancel}
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: 14,
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-6">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Name</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.25)',
                      color: '#e6edf3'
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 800 }}>{profile.name}</div>
                )}
              </div>
              <div className="col-6">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Email</div>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.25)',
                      color: '#e6edf3'
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 800 }}>{profile.email}</div>
                )}
              </div>
              <div className="col-6">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Phone</div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.25)',
                      color: '#e6edf3'
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 800 }}>{profile.phone}</div>
                )}
              </div>
              <div className="col-6">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Location</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.25)',
                      color: '#e6edf3'
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 800 }}>{profile.location}</div>
                )}
              </div>
              <div className="col-6">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Experience</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.25)',
                      color: '#e6edf3'
                    }}
                  />
                ) : (
                  <div style={{ fontWeight: 800 }}>{profile.experience}</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Bio</div>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(0,0,0,0.25)',
                    color: '#e6edf3',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <div>{profile.bio}</div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Skills</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  placeholder="Enter skills separated by commas"
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(0,0,0,0.25)',
                    color: '#e6edf3'
                  }}
                />
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.skills.map((skill) => (
                    <span key={skill} className="badge">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>Social Links</div>
            <div className="row">
              <div className="col-6">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>LinkedIn</div>
                {isEditing ? (
                  <input
                    type="url"
                    value={editForm.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.25)',
                      color: '#e6edf3'
                    }}
                  />
                ) : (
                  <a 
                    href={profile.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#58a6ff', textDecoration: 'none' }}
                  >
                    {profile.linkedin}
                  </a>
                )}
              </div>
              <div className="col-6">
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>GitHub</div>
                {isEditing ? (
                  <input
                    type="url"
                    value={editForm.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.25)',
                      color: '#e6edf3'
                    }}
                  />
                ) : (
                  <a 
                    href={profile.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#58a6ff', textDecoration: 'none' }}
                  >
                    {profile.github}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}