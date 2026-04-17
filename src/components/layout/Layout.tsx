import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between bg-[#1a1a2e] text-white p-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6c63ff] rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">HD</span>
            </div>
            <span className="font-semibold text-sm">HelpDesk</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}