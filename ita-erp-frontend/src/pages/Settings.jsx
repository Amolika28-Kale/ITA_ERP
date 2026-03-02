import { useEffect, useState } from "react";
import { 
  User, Lock, Mail, ShieldCheck, Save, Loader2, 
  Phone, MapPin, FileText, Calendar, Briefcase, 
  Heart, Star, Banknote, ChevronDown, ChevronUp
} from "lucide-react";
import { fetchMyProfile, updateProfile, changePassword } from "../services/settingsService";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function Settings() {
  const [profile, setProfile] = useState({});
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: true,
    professional: true,
    bank: true,
    expectations: true
  });

  useEffect(() => {
    fetchMyProfile()
      .then((res) => setProfile(res.data))
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleBankDetailsChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      bankDetails: { ...(prev.bankDetails || {}), [field]: value }
    }));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profile);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const updatePass = async () => {
    setLoading(true);
    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error("Current password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <header className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Complete your profile information</p>
      </header>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b"
          >
            <div className="flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>
            {expandedSections.personal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.personal && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={profile.name || ""}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  className="w-full mt-1 p-2.5 bg-gray-50 border rounded-lg"
                  value={profile.email || ""}
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ""}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.department || ""}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g. Sales, Support"
                />
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('contact')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b"
          >
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-green-600" />
              <h2 className="text-lg font-semibold">Contact Information</h2>
            </div>
            {expandedSections.contact ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.contact && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.phone || ""}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.whatsappNumber || ""}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  rows="2"
                  value={profile.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Your full address"
                />
              </div>
            </div>
          )}
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('professional')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b"
          >
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-purple-600" />
              <h2 className="text-lg font-semibold">Professional Details</h2>
            </div>
            {expandedSections.professional ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.professional && (
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  rows="3"
                  value={profile.bio || ""}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <input
                    className="w-full mt-1 p-2.5 bg-gray-50 border rounded-lg capitalize"
                    value={profile.role || ""}
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Joining Date</label>
                  <input
                    type="date"
                    className="w-full mt-1 p-2.5 bg-gray-50 border rounded-lg"
                    value={profile.joiningDate ? profile.joiningDate.split('T')[0] : ""}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('bank')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b"
          >
            <div className="flex items-center gap-2">
              <Banknote size={18} className="text-emerald-600" />
              <h2 className="text-lg font-semibold">Bank Details</h2>
            </div>
            {expandedSections.bank ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.bank && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Account Holder Name</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.bankDetails?.accountHolderName || ""}
                  onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.bankDetails?.bankName || ""}
                  onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Account Number</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.bankDetails?.accountNumber || ""}
                  onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.bankDetails?.ifscCode || ""}
                  onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">UPI ID</label>
                <input
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  value={profile.bankDetails?.upiId || ""}
                  onChange={(e) => handleBankDetailsChange('upiId', e.target.value)}
                  placeholder="example@okhdfcbank"
                />
              </div>
            </div>
          )}
        </div>

        {/* Personal Wishlist & Expectations */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('expectations')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b"
          >
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-red-600" />
              <h2 className="text-lg font-semibold">My Wishlist & Expectations</h2>
            </div>
            {expandedSections.expectations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedSections.expectations && (
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">My Personal Wishlist</label>
                <textarea
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  rows="3"
                  value={profile.personalWishlist || ""}
                  onChange={(e) => handleInputChange('personalWishlist', e.target.value)}
                  placeholder="What are your personal goals and wishes?"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">What I Expect from ITA</label>
                <textarea
                  className="w-full mt-1 p-2.5 border rounded-lg"
                  rows="3"
                  value={profile.expectationsFromITA || ""}
                  onChange={(e) => handleInputChange('expectationsFromITA', e.target.value)}
                  placeholder="How can ITA help you grow?"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock size={18} className="text-red-600" />
          Change Password
        </h2>
        
        <div className="space-y-4">
          <input
            type="password"
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
          <input
            type="password"
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
          <button
            onClick={updatePass}
            disabled={loading}
            className="w-full px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition disabled:opacity-50"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}