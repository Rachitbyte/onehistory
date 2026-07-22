import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    return (
        <div className="relative flex min-h-full">
            <Sidebar />
            <main className="min-w-0 flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
