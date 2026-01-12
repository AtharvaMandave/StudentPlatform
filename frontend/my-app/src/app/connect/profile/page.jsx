'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, ArrowLeft, Check, Target, BookOpen,
    Clock, MessageSquare, User
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConnectNav from '@/components/connect/ConnectNav';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

const GOALS = [
    { value: 'DSA', label: 'DSA Preparation', icon: '🧮', desc: 'Data Structures & Algorithms' },
    { value: 'WEB_DEV', label: 'Web Development', icon: '🌐', desc: 'Frontend, Backend, Full-stack' },
    { value: 'HIGHER_STUDIES', label: 'Higher Studies', icon: '🎓', desc: 'MS, PhD, Research' },
    { value: 'UPSC', label: 'UPSC Preparation', icon: '🏛️', desc: 'Civil Services Exam' },
    { value: 'GATE', label: 'GATE Exam', icon: '📚', desc: 'Graduate Aptitude Test' },
    { value: 'PLACEMENTS', label: 'Campus Placements', icon: '💼', desc: 'Interview Prep' },
    { value: 'OTHER', label: 'Other', icon: '🎯', desc: 'Different goal' },
];

const LEVELS = [
    { value: 'BEGINNER', label: 'Beginner', desc: 'Just starting out' },
    { value: 'INTERMEDIATE', label: 'Intermediate', desc: 'Have some experience' },
    { value: 'ADVANCED', label: 'Advanced', desc: 'Comfortable with concepts' },
];

const AVAILABILITY = [
    { value: 'DAILY', label: 'Daily', desc: 'Available every day' },
    { value: 'WEEKENDS', label: 'Weekends', desc: 'Weekends only' },
    { value: 'FLEXIBLE', label: 'Flexible', desc: 'Varies' },
];

const MODES = [
    { value: 'ONLINE', label: 'Online Study', icon: '💻' },
    { value: 'DISCUSSION', label: 'Discussion-based', icon: '💬' },
    { value: 'BOTH', label: 'Both', icon: '🤝' },
];

export default function ProfileSetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [existingProfile, setExistingProfile] = useState(null);

    const [formData, setFormData] = useState({
        primaryGoal: '',
        studyLevel: '',
        availability: { type: 'FLEXIBLE', hoursPerDay: 2 },
        preferredMode: 'BOTH',
        bio: '',
        currentFocus: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await connectAPI.getProfile();
                if (data) {
                    setExistingProfile(data);
                    setFormData({
                        primaryGoal: data.primaryGoal || '',
                        studyLevel: data.studyLevel || '',
                        availability: data.availability || { type: 'FLEXIBLE', hoursPerDay: 2 },
                        preferredMode: data.preferredMode || 'BOTH',
                        bio: data.bio || '',
                        currentFocus: data.currentFocus || '',
                    });
                }
            } catch (error) {
                // Profile doesn't exist, continue with empty form
            }
        };
        fetchProfile();
    }, []);

    const nextStep = () => {
        if (step === 1 && !formData.primaryGoal) {
            setAlert({ type: 'error', message: 'Please select your primary goal' });
            return;
        }
        if (step === 2 && !formData.studyLevel) {
            setAlert({ type: 'error', message: 'Please select your study level' });
            return;
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        setAlert(null);

        try {
            await connectAPI.updateProfile(formData);
            setAlert({ type: 'success', message: 'Profile saved successfully!' });
            setTimeout(() => router.push('/connect'), 1500);
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to save profile',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <ConnectNav />
                {alert && (
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                <div className="flex justify-center mt-6">
                    <div className="bg-[#121217] border border-white/10 p-8 max-w-2xl w-full rounded-xl">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                                <User className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Student Connect Profile</h1>
                                <p className="text-xs text-gray-500">Set up your study partner preferences</p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center gap-2 mb-8">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="flex-1 flex items-center">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                                        s < step ? "bg-white text-black" :
                                            s === step ? "bg-white text-black ring-2 ring-white/20 ring-offset-2 ring-offset-[#121217]" :
                                                "bg-white/10 text-gray-500"
                                    )}>
                                        {s < step ? <Check className="w-3 h-3" /> : s}
                                    </div>
                                    {s < 4 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 mx-2 rounded-full transition-all",
                                            s < step ? "bg-white" : "bg-white/10"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Goal Selection */}
                        {step === 1 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-gray-400" />
                                        What's your primary goal?
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        We'll match you with partners who share the same goal
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3 mb-6">
                                    {GOALS.map((goal) => (
                                        <button
                                            key={goal.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, primaryGoal: goal.value }))}
                                            className={cn(
                                                "p-4 rounded-lg border text-left transition-all",
                                                formData.primaryGoal === goal.value
                                                    ? "border-white bg-white/5"
                                                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{goal.icon}</span>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{goal.label}</p>
                                                    <p className="text-xs text-gray-500">{goal.desc}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <Button onClick={nextStep} className="w-full bg-white hover:bg-gray-200 text-black">
                                    Continue
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Level Selection */}
                        {step === 2 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-gray-400" />
                                        What's your current level?
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        This helps us find partners at a similar stage
                                    </p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, studyLevel: level.value }))}
                                            className={cn(
                                                "w-full p-4 rounded-lg border text-left transition-all",
                                                formData.studyLevel === level.value
                                                    ? "border-white bg-white/5"
                                                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                            )}
                                        >
                                            <p className="font-medium text-white text-sm">{level.label}</p>
                                            <p className="text-xs text-gray-500">{level.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={prevStep} className="flex-1">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button onClick={nextStep} className="flex-1 bg-white hover:bg-gray-200 text-black">
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Availability */}
                        {step === 3 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        When are you available?
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Match with partners who have similar schedules
                                    </p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {AVAILABILITY.map((avail) => (
                                        <button
                                            key={avail.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                availability: { ...prev.availability, type: avail.value }
                                            }))}
                                            className={cn(
                                                "w-full p-4 rounded-lg border text-left transition-all",
                                                formData.availability.type === avail.value
                                                    ? "border-white bg-white/5"
                                                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                                            )}
                                        >
                                            <p className="font-medium text-white text-sm">{avail.label}</p>
                                            <p className="text-xs text-gray-500">{avail.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Hours per day: {formData.availability.hoursPerDay}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="8"
                                        value={formData.availability.hoursPerDay}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            availability: { ...prev.availability, hoursPerDay: parseInt(e.target.value) }
                                        }))}
                                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>1 hour</span>
                                        <span>8 hours</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={prevStep} className="flex-1">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button onClick={nextStep} className="flex-1 bg-white hover:bg-gray-200 text-black">
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Mode & Bio */}
                        {step === 4 && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-gray-400" />
                                        Final touches
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Add some details to help others know you better
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Preferred study mode
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {MODES.map((mode) => (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, preferredMode: mode.value }))}
                                                className={cn(
                                                    "p-3 rounded-lg border text-center transition-all",
                                                    formData.preferredMode === mode.value
                                                        ? "border-white bg-white text-black"
                                                        : "border-white/10 hover:border-white/20 text-gray-400"
                                                )}
                                            >
                                                <span className="text-xl">{mode.icon}</span>
                                                <p className="text-xs font-medium mt-1">{mode.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Current focus (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.currentFocus}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currentFocus: e.target.value }))}
                                        placeholder="e.g., Learning React, Solving Arrays"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 text-sm"
                                        maxLength={100}
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Bio (optional)
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Tell potential partners a bit about yourself..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 min-h-[100px] resize-none text-sm"
                                        maxLength={300}
                                    />
                                    <p className="text-xs text-gray-600 mt-1">{formData.bio.length}/300</p>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={prevStep} className="flex-1">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button onClick={handleSubmit} loading={loading} className="flex-1 bg-white hover:bg-gray-200 text-black">
                                        {existingProfile ? 'Update Profile' : 'Create Profile'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
