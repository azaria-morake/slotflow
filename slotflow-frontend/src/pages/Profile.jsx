import { useState, useEffect } from 'react'
import { Form, Button, Card, Tab, Tabs } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { profileSchema, passwordSchema } from '../utils/validators'
import ImageUpload from '../components/Common/ImageUpload'
import FormInput from '../components/Common/FormInput'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'


const Profile = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema)
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema)
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me/')
        setProfileData(response.data)
        resetProfile({
          username: response.data.username,
          email: response.data.email
        })
      } catch (error) {
        toast.error('Failed to fetch profile data')
      }
    }
    
    if (user) {
      fetchProfile()
    }
  }, [user, resetProfile])

const handleProfileUpdate = async (data) => {
  setIsLoading(true)
  try {
    const formData = new FormData()
    formData.append('username', data.username)
    formData.append('email', data.email)
    // Do not include profile_picture here if you're uploading it separately

    const response = await api.patch('/auth/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    setProfileData(response.data)
    toast.success('Profile updated successfully')
  } catch (error) {
    toast.error('Failed to update profile')
  } finally {
    setIsLoading(false)
  }
}



  const handlePasswordUpdate = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password
      })
      toast.success('Password updated successfully')
      resetPassword()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

const handleImageUpload = async (file) => {
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response = await api.put(
      '/auth/me/profile-picture/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Verify the response contains the new image URL
    if (response.data.profile_picture) {
      setProfileData(prev => ({
        ...prev,
        profile_picture: response.data.profile_picture
      }));
      toast.success('Profile picture updated successfully');
      
      // Force refresh the image by adding timestamp
      setProfileData(prev => ({
        ...prev,
        profile_picture: `${response.data.profile_picture}?${Date.now()}`
      }));
    } else {
      throw new Error('No image URL in response');
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error.response?.data?.detail || 'Failed to update profile picture');
  }
};


  const handleRemoveImage = async () => {
    try {
      await api.delete('/auth/me/profile-picture/')
      setProfileData({ ...profileData, profile_picture: null })
      toast.success('Profile picture removed successfully')
    } catch (error) {
      toast.error('Failed to remove profile picture')
    }
  }

  if (!profileData) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="form-container">
      <h2 className="text-center mb-4">Profile</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="profile" title="Profile Info">
          <Form onSubmit={handleProfileSubmit(handleProfileUpdate)}>
            <ImageUpload
  label="Profile Picture"
  name="profile_picture"
  initialImage={profileData.profile_picture}
  onImageChange={handleImageUpload}
  onRemoveImage={handleRemoveImage}
  register={registerProfile}
  errors={profileErrors}
/>

            
            <FormInput
              label="Username"
              name="username"
              register={registerProfile}
              errors={profileErrors}
            />
            
            <FormInput
              label="Email"
              name="email"
              type="email"
              register={registerProfile}
              errors={profileErrors}
            />
            
            <Button type="submit" variant="accent" className="w-100" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Form>
        </Tab>
        
        <Tab eventKey="password" title="Change Password">
          <Form onSubmit={handlePasswordSubmit(handlePasswordUpdate)}>
            <FormInput
              label="Current Password"
              name="old_password"
              type="password"
              register={registerPassword}
              errors={passwordErrors}
            />
            
            <FormInput
              label="New Password"
              name="new_password"
              type="password"
              register={registerPassword}
              errors={passwordErrors}
            />
            
            <FormInput
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              register={registerPassword}
              errors={passwordErrors}
            />
            
            <Button type="submit" variant="accent" className="w-100" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Change Password'}
            </Button>
          </Form>
        </Tab>
      </Tabs>
      
      <div className="text-center mt-3">
        <Button variant="outline-danger" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  )
}

export default Profile