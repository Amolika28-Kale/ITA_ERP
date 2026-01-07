import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, Admin 👋
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This is your Task ERP admin dashboard. Manage everything from here.
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
