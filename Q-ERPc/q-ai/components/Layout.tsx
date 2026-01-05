import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ChatSession } from '../types';

interface LayoutProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewSession: () => void;
    onLogout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onOpenSettings: () => void;
}

import { useNavigate } from 'react-router-dom';
import { Icons } from './Icon';
import { Tooltip } from './Tooltip';

export const Layout: React.FC<LayoutProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    sessions,
    currentSessionId,
    onSelectSession,
    onNewSession,
    onLogout,
    theme,
    toggleTheme,
    onOpenSettings
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex h-full w-full bg-[#E3E3E3] relative overflow-hidden transition-colors duration-300 p-3 gap-3">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onNewSession={onNewSession}
                onSelectSession={onSelectSession}
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isDarkMode={theme === 'dark'}
                toggleTheme={toggleTheme}
                onOpenSettings={onOpenSettings}
            />

            {/* Main Content Area (Strip + Page) */}
            <div className="flex-1 flex h-full relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">

                {/* Desktop Side Strip (Persistent, Left side of Content Area) */}
                <div className="hidden lg:flex flex-col items-center py-4 w-12 bg-[#001529] text-white/70 animate-in fade-in duration-300 shrink-0">
                    {/* Toggle Button */}
                    <Tooltip content={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:text-white transition-colors"
                        >
                            <div className={`transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`}>
                                <Icons.SidebarToggle className="w-6 h-6" />
                            </div>
                        </button>
                    </Tooltip>

                    <div className="mt-auto flex flex-col gap-4">
                        <Tooltip content={theme === 'dark' ? "Light Mode" : "Dark Mode"}>
                            <button
                                onClick={toggleTheme}
                                className="p-2 hover:text-white transition-colors"
                            >
                                {theme === 'dark' ? <Icons.Sun className="h-5 w-5" /> : <Icons.Moon className="h-5 w-5" />}
                            </button>
                        </Tooltip>

                        <Tooltip content="Admin">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:text-white transition-colors"
                            >
                                <Icons.Shield className="h-5 w-5" />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 h-full flex flex-col overflow-hidden relative bg-white">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
