'use client';

const StatisticsChart = () => {
    return (
        <div className="bg-[#121217] p-6 rounded-xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Performance</h3>

            {/* Chart Visualization */}
            <div className="flex justify-center mb-8 relative">
                <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Ring */}
                        <circle cx="80" cy="80" r="70" stroke="#27272A" strokeWidth="12" fill="transparent" />
                        {/* Progress Ring 1 */}
                        <circle cx="80" cy="80" r="70" stroke="#FFFFFF" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="145" strokeLinecap="round" />
                        {/* Progress Ring 2 - Subtle */}
                        <circle cx="80" cy="80" r="70" stroke="#52525B" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="350" strokeLinecap="round" className="opacity-50" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-white tracking-tighter">67%</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">AVG</span>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                {[
                    { label: 'Class complete', val: '68%', color: 'bg-white' },
                    { label: 'Assignment complete', val: '54%', color: 'bg-zinc-500' },
                    { label: 'Session complete', val: '32%', color: 'bg-zinc-700' }
                ].map((item, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400 font-medium">{item.label}</span>
                            <span className="text-white font-mono">{item.val}</span>
                        </div>
                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: item.val }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatisticsChart;
