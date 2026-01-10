'use client';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const AssignmentsList = () => {
    const days = [
        { day: 'S', date: '01' },
        { day: 'M', date: '02' },
        { day: 'T', date: '03' },
        { day: 'W', date: '04' },
        { day: 'T', date: '05' },
        { day: 'F', date: '06' },
        { day: 'S', date: '07' },
        { day: 'S', date: '08', active: true },
        { day: 'M', date: '09' },
        { day: 'T', date: '10' },
        { day: 'W', date: '11' },
        { day: 'T', date: '12' },
        { day: 'F', date: '13' },
        { day: 'S', date: '14' },
        { day: 'S', date: '15' },
    ];

    const tasks = [
        { title: 'English lesson', time: '9:30 - 10:30', color: 'border-l-primary' },
        { title: 'Homework', time: '9:30 - 10:30', color: 'border-l-pink-500' },
        { title: 'Advanced User Experience Tech', time: '9:30 - 10:30', color: 'border-l-emerald-500' },
        { title: 'Information Architecture for UX', time: '9:30 - 10:30', color: 'border-l-orange-500' },
    ];

    return (
        <div className="bg-[#151621] p-6 rounded-2xl border border-[#2A2B3A] mt-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Assignments <span className="text-gray-500 font-normal text-sm ml-2">(Mar 01 - Mar 15)</span></h3>
                <div className="flex gap-2">
                    <button className="p-1 rounded hover:bg-[#2A2B3A] text-gray-400"><ChevronLeft size={20} /></button>
                    <button className="p-1 rounded hover:bg-[#2A2B3A] text-gray-400"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Calendar Strip */}
            <div className="flex justify-between mb-8 overflow-x-auto pb-2 no-scrollbar gap-2">
                {days.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 min-w-[30px] cursor-pointer group">
                        <span className={`text-xs font-medium ${d.active ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}`}>{d.day}</span>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${d.active
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-gray-400 hover:bg-[#2A2B3A]'
                            }`}>
                            {d.date}
                        </div>
                        {d.active && <div className="w-1 h-1 rounded-full bg-primary mt-1"></div>}
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                {tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-4 group cursor-pointer">
                        <div className="text-xs text-gray-500 pt-1 w-12 text-right">10:00</div>
                        <div className={`flex-1 p-4 rounded-xl bg-[#0B0B15] border border-[#2A2B3A] border-l-4 ${task.color} hover:bg-[#1A1B26] transition-all flex items-center justify-between`}>
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-primary transition-colors">{task.title}</h4>
                                <p className="text-xs text-gray-500">{task.time}</p>
                            </div>

                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(u => (
                                    <div key={u} className="w-6 h-6 rounded-full border border-[#0B0B15] bg-gray-700"></div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-2">
                            <div className="w-5 h-5 rounded-full border-2 border-[#2A2B3A] group-hover:border-primary transition-colors cursor-pointer"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignmentsList;
