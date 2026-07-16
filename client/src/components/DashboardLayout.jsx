import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false); // Reset on desktop
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100%', position: 'relative' }}>

            {/* Mobile Toggle Trigger */}
            {isMobile && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '1.5rem',
                        right: '1.5rem',
                        zIndex: 45,
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                >
                    <Menu size={24} />
                </button>
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            <main style={{
                flex: 1,
                width: '100%', // Ensure content takes remaining width
                // On mobile, content is full width. On desktop, flex handles it.
                // We typically don't need margin-left if it's flex row, but Sidebar is sticky/fixed?
                // In my Sidebar CSS: isMobile ? 'fixed' : 'sticky' failed?
                // Wait, if Sidebar is part of Flex container, 'sticky' works well.
                // If Sidebar is 'fixed' on mobile, it overlays. Good.
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
