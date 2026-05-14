import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, MapPin, Camera, Save, Lock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // Use a helper to get the full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${avatarPath}`;
  };

  const [formData, setFormData] = useState({
    name: user ? user.full_name || user.username : '',
    email: user?.email || '',
    phone: user?.profile?.phone_number || '',
    address: user?.profile?.address || '',
    avatar: getAvatarUrl(user?.profile?.avatar)
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: ''
  });
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('full_name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone_number', formData.phone);
      payload.append('address', formData.address);
      
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }
      
      const response = await api.patch('/profile/update_profile/', payload);
      const updatedUser = response.data;
      
      // Update store and localStorage
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setAvatarFile(null);
      
      // Update local form state with new data
      setFormData({
        ...formData,
        avatar: getAvatarUrl(updatedUser.profile?.avatar)
      });
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password2) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsSubmittingPassword(true);
    try {
      await api.post('/auth/change-password/', passwordData);
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', new_password2: '' });
    } catch (error) {
      toast.error(error.response?.data?.old_password || error.response?.data?.new_password || 'Failed to change password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 overflow-hidden">
                  {formData.avatar ? <img src={formData.avatar} alt="avatar" className="w-full h-full object-cover"/> : formData.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors cursor-pointer">
                <Camera size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-xl text-sm font-medium transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-white text-blue-600 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8">
          <div className="mb-8 border-b border-slate-100 pb-8">
            <h2 className="text-2xl font-bold text-slate-900">{formData.name || '-'}</h2>
            <p className="text-slate-500">{formData.email || '-'}</p>
          </div>

            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 mb-4">Personal Information</h3>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                  <User size={16} /> Full Name
                </label>
                {isEditing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                ) : (
                  <p className="text-slate-900 font-medium">{formData.name || '-'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                  <Mail size={16} /> Email Address
                </label>
                {isEditing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                ) : (
                  <p className="text-slate-900 font-medium">{formData.email || '-'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                  <Phone size={16} /> Phone Number
                </label>
                {isEditing ? (
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                ) : (
                  <p className="text-slate-900 font-medium">{formData.phone || '-'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                  <MapPin size={16} /> Address
                </label>
                {isEditing ? (
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                ) : (
                  <p className="text-slate-900 font-medium">{formData.address || '-'}</p>
                )}
              </div>
            </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Security</h3>
            {!isChangingPassword ? (
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Lock size={16} /> Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-900">Change Password</h4>
                  <button type="button" onClick={() => setIsChangingPassword(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.new_password2}
                    onChange={(e) => setPasswordData({...passwordData, new_password2: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmittingPassword}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 mt-2"
                >
                  {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
