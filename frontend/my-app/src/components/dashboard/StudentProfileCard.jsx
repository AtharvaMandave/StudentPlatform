'use client';
import { Avatar } from '@/components/ui/Avatar';

const StudentProfileCard = ({ user }) => {
    return (
        <div className="bg-[#121217] p-6 rounded-xl border border-white/10 flex flex-col items-center text-center">
            <div className="mb-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto border border-white/10">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{user?.name || 'Loading...'}</h3>
            <p className="text-sm text-gray-500 mb-6 capitalize">{user?.role || 'Student'}</p>

            <div className="grid grid-cols-3 w-full border-t border-white/10 pt-4">
                <div className="flex flex-col gap-1 border-r border-white/10">
                    <span className="text-lg font-bold text-white">4</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Courses</span>
                </div>
                <div className="flex flex-col gap-1 border-r border-white/10">
                    <span className="text-lg font-bold text-white">85%</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Attendance</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-white">3.8</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">GPA</span>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileCard;
