import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    // min-h-screen ऐवजी h-screen आणि overflow-hidden वापरा
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      <Sidebar />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* DESKTOP HEADER (जर हा sticky नसेल तर इथे राहील) */}
        <Header />

        {/* CONTENT AREA: फक्त हा भाग स्क्रोल होईल */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="pt-20 lg:pt-6 pb-12 px-4 sm:px-6 lg:px-10">
            
            <div className="w-full lg:max-w-[1600px] lg:mx-auto mt-6">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Outlet />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}