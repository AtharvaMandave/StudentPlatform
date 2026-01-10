'use client';

const StudentProfileCard = ({ user }) => {
    return (
        <div className="bg-[#151621] p-6 rounded-2xl border border-[#2A2B3A] flex flex-col items-center text-center">
            <div className="relative mb-4 group">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary via-purple-500 to-pink-500">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                        alt="Profile"
                        className="w-full h-full rounded-full bg-[#0B0B15] object-cover border-4 border-[#0B0B15]"
                    />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-[#151621] rounded-full"></div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{user?.name || 'Loading...'}</h3>
            <p className="text-sm text-gray-500 mb-6 capitalize">{user?.role || 'Student'}</p>

            <div className="flex items-center justify-between w-full px-2">
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-white">4</span>
                    <span className="text-xs text-gray-500">Courses</span>
                </div>
                <div className="w-px h-8 bg-[#2A2B3A]"></div>
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-white">85%</span>
                    <span className="text-xs text-gray-500">Attendance</span>
                </div>
                <div className="w-px h-8 bg-[#2A2B3A]"></div>
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-white">3.8</span>
                    <span className="text-xs text-gray-500">GPA</span>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileCard;
