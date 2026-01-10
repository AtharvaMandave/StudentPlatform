'use client';
import { Timer, Target, GraduationCap } from 'lucide-react';

const icons = {
    timer: Timer,
    target: Target,
    cap: GraduationCap
};

const StatsCard = ({ title, value, subtext, icon, color = 'primary' }) => {
    const Icon = icons[icon] || Timer;

    const colors = {
        primary: 'text-primary bg-primary/10',
        purple: 'text-purple-400 bg-purple-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10'
    };

    return (
        <div className="bg-[#151621] p-6 rounded-2xl border border-[#2A2B3A] hover:border-primary/30 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-4xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</h3>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                </div>
                <div className={`p-3 rounded-xl ${colors[color]} group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
