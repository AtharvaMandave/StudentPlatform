'use client';

const StatisticsChart = () => {
    return (
        <div className="bg-[#151621] p-6 rounded-2xl border border-[#2A2B3A]">
            <h3 className="text-base font-semibold text-white mb-6">Statistics on March</h3>

            {/* Chart Visualization (CSS only for now) */}
            <div className="flex justify-center mb-8 relative">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#1F1F2E" strokeWidth="20" fill="transparent" />
                        <circle cx="80" cy="80" r="70" stroke="#6366F1" strokeWidth="20" fill="transparent" strokeDasharray="440" strokeDashoffset="145" strokeLinecap="round" />
                        <circle cx="80" cy="80" r="70" stroke="#10B981" strokeWidth="20" fill="transparent" strokeDasharray="440" strokeDashoffset="350" strokeLinecap="round" className="opacity-80" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-white">67%</span>
                        <span className="text-xs text-gray-400">Avg</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { label: 'Class complete', val: '68%', color: 'bg-primary' },
                    { label: 'Assignment complete', val: '68%', color: 'bg-emerald-500' },
                    { label: 'Session complete', val: '68%', color: 'bg-orange-500' }
                ].map((item, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400">{item.label}</span>
                            <span className="text-white">{item.val}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#2A2B3A] rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full w-[68%]`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatisticsChart;
