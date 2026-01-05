import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icon';
import { Tooltip } from './Tooltip';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onNewSession,
  onSelectSession,
  onLogout,
  isOpen,
  onClose,
  isDarkMode,
  toggleTheme,
  onOpenSettings
}) => {
  const navigate = useNavigate();

  // Handle closing sidebar on mobile when an item is selected
  const handleMobileClick = () => {
    if (window.innerWidth < 1024) {
      if (window.innerWidth < 768) onClose();
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileClick();
  };

  return (
    <div className={`
        overflow-hidden
        /* Mobile: Fixed, Slide-in */
        fixed inset-y-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}

        /* Desktop: Relative, Push/Collapse */
        lg:static lg:h-full lg:shadow-none lg:transition-all lg:duration-300 lg:translate-x-0 lg:rounded-2xl
        ${isOpen ? 'lg:w-72 lg:opacity-100' : 'lg:w-0 lg:opacity-0 lg:border-none'}
    `}>
      {/* LEFT COLUMN: Main Content (Light) */}
      <div className="flex-1 flex flex-col bg-[#EDEDED] text-slate-700 h-full overflow-hidden">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-6">

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewSession();
              handleMobileClick();
            }}
            className="w-full flex items-center gap-3 px-1 py-1 rounded-md hover:bg-slate-200/50 transition-colors text-sm font-medium text-slate-700"
          >
            <div className="p-1 rounded-md border border-slate-300 bg-white">
              <Icons.Plus className="w-4 h-4" />
            </div>
            New Chat
          </button>

          {/* Management Section */}
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Management</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigation('/knowledge')}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 text-sm"
              >
                <Icons.Book className="w-4 h-4" />
                Knowledge Base
              </button>
              <button
                onClick={() => handleNavigation('/ocr')}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 text-sm"
              >
                <Icons.ScanText className="w-4 h-4" />
                OCR History
              </button>
              <button
                onClick={() => {
                  onOpenSettings();
                  handleMobileClick();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 text-sm"
              >
                <Icons.Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* History Section */}
          <div className="pb-4">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">History</h3>
            <div className="space-y-1">
              {sessions.map((session) => (
                <Tooltip key={session.id} content={session.title} className="w-full">
                  <button
                    onClick={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm truncate block mb-1
                   ${currentSessionId === session.id
                        ? 'bg-white text-slate-900 font-medium shadow-sm'
                        : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                      }`}
                  >
                    {session.title}
                  </button>
                </Tooltip>
              ))}
              {sessions.length === 0 && (
                <div className="px-2 text-sm text-slate-400 italic">No history yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions (Logout, etc) */}
        <div className="p-3 border-t border-black/5 bg-[#EDEDED]">
          {/* Mobile-only Controls (Theme, Admin) */}
          <div className="lg:hidden flex justify-around mb-4 border-b border-black/5 pb-2">
            <Tooltip content={isDarkMode ? "Light Mode" : "Dark Mode"}>
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-slate-800 transition-colors"
              >
                {isDarkMode ? <Icons.Sun className="h-5 w-5" /> : <Icons.Moon className="h-5 w-5" />}
              </button>
            </Tooltip>

            <Tooltip content="Admin">
              <button
                onClick={() => handleNavigation('/admin')}
                className="p-2 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Icons.Shield className="h-5 w-5" />
              </button>
            </Tooltip>
          </div>

          <button onClick={onLogout} className="flex w-full items-center justify-center rounded-md bg-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 transition-colors">
            <Icons.LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
        </div>

      </div>

    </div>
  );
};

export default Sidebar;