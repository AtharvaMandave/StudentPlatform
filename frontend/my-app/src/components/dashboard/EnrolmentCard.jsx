'use client';
import { Book, Clock, MoreVertical } from 'lucide-react';

const EnrolmentCard = ({ title, progress, lessons, duration, imageGradient }) => {
    return (
        <div className="bg-[#151621] p-5 rounded-2xl border border-[#2A2B3A] hover:border-primary/30 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${imageGradient} flex items-center justify-center shadow-lg`}>
                    {/* Placeholder for course icon/image */}
                    <Book size={20} className="text-white/80" />
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>

            <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                <div className="flex items-center gap-1.5">
                    <Book size={14} />
                    <span>{lessons} lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{duration}</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400">Courses Progress</span>
                        <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#2A2B3A] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <button className="px-4 py-1.5 bg-[#1F1F2E] hover:bg-primary hover:text-white text-gray-300 text-xs font-medium rounded-lg border border-[#2A2B3A] hover:border-primary transition-all duration-200">
                    Continue
                </button>
            </div>
        </div>
    );
};

export default EnrolmentCard;
