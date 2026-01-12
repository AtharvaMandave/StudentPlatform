'use client';
import { Timer, Target, GraduationCap } from 'lucide-react';

const icons = {
    timer: Timer,
    target: Target,
    cap: GraduationCap
};

const StatsCard = ({ title, value, subtext, icon, color = 'default' }) => {
    const Icon = icons[icon] || Timer;

    return (
        <div className="bg-[#121217] p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-colors">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
