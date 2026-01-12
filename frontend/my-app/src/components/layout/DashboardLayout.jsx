'use client';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-main)] text-white overflow-hidden flex">
            <Sidebar />

            <main className="flex-1 ml-64 relative flex flex-col h-screen overflow-hidden">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 relative">
                    {/* Background Ambient Glows */}
                    <div className="fixed top-0 left-64 right-0 h-[500px] pointer-events-none z-0">
                        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
                        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 w-full pb-4">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
