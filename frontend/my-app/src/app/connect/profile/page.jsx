'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, ArrowLeft, Check, Target, BookOpen,
    Clock, MessageSquare, GraduationCap, Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
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
        // Check if profile exists
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
        <div className="min-h-screen bg-light-purple flex items-center justify-center p-4">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="card-white p-8 max-w-2xl w-full animate-slide-up">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Connect</h1>
                        <p className="text-sm text-gray-500">Set up your study partner profile</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex-1 flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                s < step ? "bg-violet-500 text-white" :
                                    s === step ? "bg-violet-500 text-white shadow-lg shadow-violet-200" :
                                        "bg-gray-100 text-gray-400"
                            )}>
                                {s < step ? <Check className="w-4 h-4" /> : s}
                            </div>
                            {s < 4 && (
                                <div className={cn(
                                    "flex-1 h-1 mx-2 rounded-full transition-all",
                                    s < step ? "bg-violet-500" : "bg-gray-100"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Goal Selection */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-violet-500" />
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
                                        "p-4 rounded-xl border-2 text-left transition-all",
                                        formData.primaryGoal === goal.value
                                            ? "border-violet-500 bg-violet-50"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{goal.icon}</span>
                                        <div>
                                            <p className="font-medium text-gray-800">{goal.label}</p>
                                            <p className="text-xs text-gray-500">{goal.desc}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button onClick={nextStep} className="w-full">
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Step 2: Level Selection */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-violet-500" />
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
                                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                                        formData.studyLevel === level.value
                                            ? "border-violet-500 bg-violet-50"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <p className="font-medium text-gray-800">{level.label}</p>
                                    <p className="text-sm text-gray-500">{level.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-1">
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Availability */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-violet-500" />
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
                                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                                        formData.availability.type === avail.value
                                            ? "border-violet-500 bg-violet-50"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <p className="font-medium text-gray-800">{avail.label}</p>
                                    <p className="text-sm text-gray-500">{avail.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>1 hour</span>
                                <span>8 hours</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-1">
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Mode & Bio */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-violet-500" />
                                Final touches
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Add some details to help others know you better
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred study mode
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {MODES.map((mode) => (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, preferredMode: mode.value }))}
                                        className={cn(
                                            "p-3 rounded-xl border-2 text-center transition-all",
                                            formData.preferredMode === mode.value
                                                ? "border-violet-500 bg-violet-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <span className="text-xl">{mode.icon}</span>
                                        <p className="text-sm font-medium text-gray-700 mt-1">{mode.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current focus (optional)
                            </label>
                            <input
                                type="text"
                                value={formData.currentFocus}
                                onChange={(e) => setFormData(prev => ({ ...prev, currentFocus: e.target.value }))}
                                placeholder="e.g., Learning React, Solving Arrays"
                                className="input-light"
                                maxLength={100}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio (optional)
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Tell potential partners a bit about yourself..."
                                className="input-light min-h-[100px] resize-none"
                                maxLength={300}
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/300</p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={prevStep} className="flex-1">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <Button onClick={handleSubmit} loading={loading} className="flex-1">
                                {existingProfile ? 'Update Profile' : 'Create Profile'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
