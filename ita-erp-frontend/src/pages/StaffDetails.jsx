import { useEffect, useState } from "react";
import { getAllStaff } from "../services/settingsService";
import { 
  Users, Search, User, Mail, Phone, Calendar, 
  Briefcase, Banknote, Heart, Star, MapPin,
  ChevronDown, ChevronUp, Download, Shield
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function StaffDetails() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStaff, setExpandedStaff] = useState({});
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchTerm, departmentFilter, staff]);

  const loadStaff = async () => {
    try {
      const res = await getAllStaff();
      setStaff(res.data);
      setFilteredStaff(res.data);
    } catch (err) {
      toast.error("Failed to load staff details");
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff;
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm)
      );
    }
    
    if (departmentFilter !== "all") {
      filtered = filtered.filter(s => s.department === departmentFilter);
    }
    
    setFilteredStaff(filtered);
  };

  const toggleStaffExpand = (staffId) => {
    setExpandedStaff(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }));
  };

  const exportToCSV = () => {
    const headers = [
      "Name", "Email", "Phone", "WhatsApp", "Department", "Role",
      "Joining Date", "Address", "Bank Account", "IFSC Code", "UPI ID",
      "Personal Wishlist", "Expectations"
    ].join(",");

    const rows = staff.map(s => {
      const row = [
        s.name || "",
        s.email || "",
        s.phone || "",
        s.whatsappNumber || "",
        s.department || "",
        s.role || "",
        s.joiningDate ? format(new Date(s.joiningDate), "dd/MM/yyyy") : "",
        `"${(s.address || "").replace(/"/g, '""')}"`,
        s.bankDetails?.accountNumber || "",
        s.bankDetails?.ifscCode || "",
        s.bankDetails?.upiId || "",
        `"${(s.personalWishlist || "").replace(/"/g, '""')}"`,
        `"${(s.expectationsFromITA || "").replace(/"/g, '""')}"`
      ];
      return row.join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `staff_details_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  };

  // Get unique departments
  const departments = [...new Set(staff.map(s => s.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading staff details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Members Details</h1>
          <p className="text-gray-500 mt-1">Complete information of all staff members</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase">Departments</p>
          <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase">With Bank Details</p>
          <p className="text-2xl font-bold text-gray-900">
            {staff.filter(s => s.bankDetails?.accountNumber).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 uppercase">With Wishlist</p>
          <p className="text-2xl font-bold text-gray-900">
            {staff.filter(s => s.personalWishlist).length}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone, department..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {filteredStaff.map((staffMember) => (
          <div key={staffMember._id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Header - Always visible */}
            <div 
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleStaffExpand(staffMember._id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                  {staffMember.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{staffMember.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {staffMember.email}
                    </span>
                    {staffMember.department && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} /> {staffMember.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                  {staffMember.role}
                </span>
                {expandedStaff[staffMember._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedStaff[staffMember._id] && (
              <div className="p-6 border-t bg-gray-50/50 space-y-6">
                {/* Personal & Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <User size={16} className="text-blue-600" />
                      Personal Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      {staffMember.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          {staffMember.phone}
                        </p>
                      )}
                      {staffMember.whatsappNumber && (
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="text-green-600" />
                          {staffMember.whatsappNumber} (WhatsApp)
                        </p>
                      )}
                      {staffMember.dateOfBirth && (
                        <p className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          DOB: {format(new Date(staffMember.dateOfBirth), "dd/MM/yyyy")}
                        </p>
                      )}
                      {staffMember.joiningDate && (
                        <p className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          Joined: {format(new Date(staffMember.joiningDate), "dd/MM/yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-red-600" />
                      Address
                    </h4>
                    <p className="text-sm text-gray-600">{staffMember.address || "Not provided"}</p>
                    
                    {staffMember.bio && (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2 flex items-center gap-2">
                          <FileText size={16} className="text-purple-600" />
                          Bio
                        </h4>
                        <p className="text-sm text-gray-600">{staffMember.bio}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                {staffMember.bankDetails && Object.values(staffMember.bankDetails).some(Boolean) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Banknote size={16} className="text-emerald-600" />
                      Bank Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-white p-4 rounded-lg border">
                      {staffMember.bankDetails.accountHolderName && (
                        <div>
                          <p className="text-xs text-gray-500">Account Holder</p>
                          <p className="font-medium">{staffMember.bankDetails.accountHolderName}</p>
                        </div>
                      )}
                      {staffMember.bankDetails.bankName && (
                        <div>
                          <p className="text-xs text-gray-500">Bank Name</p>
                          <p>{staffMember.bankDetails.bankName}</p>
                        </div>
                      )}
                      {staffMember.bankDetails.accountNumber && (
                        <div>
                          <p className="text-xs text-gray-500">Account Number</p>
                          <p className="font-mono">{staffMember.bankDetails.accountNumber}</p>
                        </div>
                      )}
                      {staffMember.bankDetails.ifscCode && (
                        <div>
                          <p className="text-xs text-gray-500">IFSC Code</p>
                          <p className="font-mono">{staffMember.bankDetails.ifscCode}</p>
                        </div>
                      )}
                      {staffMember.bankDetails.upiId && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500">UPI ID</p>
                          <p>{staffMember.bankDetails.upiId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Wishlist & Expectations */}
                {(staffMember.personalWishlist || staffMember.expectationsFromITA) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffMember.personalWishlist && (
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Heart size={16} className="text-red-600" />
                          Personal Wishlist
                        </h4>
                        <p className="text-sm text-gray-600">{staffMember.personalWishlist}</p>
                      </div>
                    )}
                    {staffMember.expectationsFromITA && (
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Star size={16} className="text-yellow-600" />
                          Expectations from ITA
                        </h4>
                        <p className="text-sm text-gray-600">{staffMember.expectationsFromITA}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredStaff.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No staff members found</p>
          </div>
        )}
      </div>
    </div>
  );
}