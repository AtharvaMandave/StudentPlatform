'use client';
import { BookOpen } from 'lucide-react';

const CareerGuideBanner = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl p-8 border border-[#2A2B3A] group">
            {/* Background Gradient & Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1B26] to-[#0F101A] z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] z-0 group-hover:bg-primary/15 transition-all duration-500"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
                        <BookOpen size={32} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Career Guide tools and resources</h3>
                        <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                            Explore foundational content and tools to help you understand, learn, and improve at the skills for this role.
                        </p>
                    </div>
                </div>

                <button className="whitespace-nowrap px-6 py-2.5 bg-[#2A2B3A] hover:bg-[#34354A] text-white text-sm font-medium rounded-lg border border-[#3F4056] transition-all hover:scale-105 active:scale-95">
                    Go to Guide
                </button>
            </div>
        </div>
    );
};

export default CareerGuideBanner;
