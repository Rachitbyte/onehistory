import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebar = () => setIsSidebarOpen((open) => !open);

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, openSidebar, closeSidebar, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
