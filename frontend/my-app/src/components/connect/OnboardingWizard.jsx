'use client';

import { useState } from 'react';
import {
    ArrowRight, ArrowLeft, Check, Target, Clock, MessageCircle,
    Users, CheckCircle2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const STUDY_FREQUENCIES = [
    { value: 'DAILY', label: 'Daily', description: 'Study together every day', icon: '🔥' },
    { value: 'EVERY_OTHER_DAY', label: 'Every Other Day', description: 'Alternate days', icon: '📅' },
    { value: 'WEEKENDS', label: 'Weekends Only', description: 'Focus on weekends', icon: '🌅' },
    { value: 'WEEKLY', label: 'Weekly', description: 'Once a week sync', icon: '📆' },
];

const COMMUNICATION_EXPECTATIONS = [
    { value: 'HIGH', label: 'High', description: 'Daily check-ins, quick responses', icon: '💬' },
    { value: 'MEDIUM', label: 'Medium', description: 'Regular updates, flexible timing', icon: '📝' },
    { value: 'LOW', label: 'Low', description: 'Weekly updates, async communication', icon: '📬' },
];

const GOALS = [
    { value: 'DSA', label: 'DSA', description: 'Data Structures & Algorithms', icon: '🧮' },
    { value: 'WEB_DEV', label: 'Web Development', description: 'Frontend, Backend, Full Stack', icon: '🌐' },
    { value: 'HIGHER_STUDIES', label: 'Higher Studies', description: 'GRE, IELTS, Masters prep', icon: '🎓' },
    { value: 'UPSC', label: 'UPSC', description: 'Civil Services preparation', icon: '📚' },
    { value: 'GATE', label: 'GATE', description: 'Graduate Aptitude Test', icon: '🔬' },
    { value: 'PLACEMENTS', label: 'Placements', description: 'Campus placement prep', icon: '💼' },
    { value: 'OTHER', label: 'Other', description: 'Custom study goal', icon: '✨' },
];

export default function OnboardingWizard({
    partnerName,
    onComplete,
    onSkip,
    initialData = {}
}) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        primaryGoal: initialData.primaryGoal || '',
        studyFrequency: initialData.studyFrequency || '',
        communicationExpectations: initialData.communicationExpectations || '',
    });
    const [loading, setLoading] = useState(false);

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await onComplete(formData);
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1:
                return !!formData.primaryGoal;
            case 2:
                return !!formData.studyFrequency;
            case 3:
                return !!formData.communicationExpectations;
            default:
                return true;
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs mb-4 uppercase tracking-wider">
                        <Users className="w-3 h-3" />
                        <span>New Connection</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome! Let's set up your partnership
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {partnerName ? `You're now connected with ${partnerName}` : 'Set your study preferences'}
                    </p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                                s < step && "bg-white text-black",
                                s === step && "bg-white text-black ring-2 ring-white/20 ring-offset-2 ring-offset-[#09090B]",
                                s > step && "bg-white/10 text-gray-500"
                            )}>
                                {s < step ? <Check className="w-4 h-4" /> : s}
                            </div>
                            {s < 3 && (
                                <div className={cn(
                                    "w-16 h-0.5 mx-2 rounded-full transition-all",
                                    s < step ? "bg-white" : "bg-white/10"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-[#121217] border border-white/10 rounded-xl p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-lg font-semibold text-white mb-2">
                                    What's your primary goal?
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Choose the main focus area for this study partnership
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {GOALS.map((goal) => (
                                    <button
                                        key={goal.value}
                                        onClick={() => setFormData({ ...formData, primaryGoal: goal.value })}
                                        className={cn(
                                            "p-4 rounded-lg border text-left transition-all",
                                            formData.primaryGoal === goal.value
                                                ? "bg-white text-black border-white"
                                                : "border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{goal.icon}</span>
                                            <div>
                                                <p className="font-medium text-sm">{goal.label}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{goal.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-lg font-semibold text-white mb-2">
                                    How often do you want to study?
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Set the preferred study frequency with your partner
                                </p>
                            </div>

                            <div className="space-y-3">
                                {STUDY_FREQUENCIES.map((freq) => (
                                    <button
                                        key={freq.value}
                                        onClick={() => setFormData({ ...formData, studyFrequency: freq.value })}
                                        className={cn(
                                            "w-full p-4 rounded-lg border text-left transition-all flex items-center gap-4",
                                            formData.studyFrequency === freq.value
                                                ? "bg-white text-black border-white"
                                                : "border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5"
                                        )}
                                    >
                                        <span className="text-2xl">{freq.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{freq.label}</p>
                                            <p className="text-xs text-gray-500">{freq.description}</p>
                                        </div>
                                        {formData.studyFrequency === freq.value && (
                                            <CheckCircle2 className="w-5 h-5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-4">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-lg font-semibold text-white mb-2">
                                    Communication expectations
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    How responsive do you expect this partnership to be?
                                </p>
                            </div>

                            <div className="space-y-3">
                                {COMMUNICATION_EXPECTATIONS.map((exp) => (
                                    <button
                                        key={exp.value}
                                        onClick={() => setFormData({ ...formData, communicationExpectations: exp.value })}
                                        className={cn(
                                            "w-full p-4 rounded-lg border text-left transition-all flex items-center gap-4",
                                            formData.communicationExpectations === exp.value
                                                ? "bg-white text-black border-white"
                                                : "border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5"
                                        )}
                                    >
                                        <span className="text-2xl">{exp.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{exp.label}</p>
                                            <p className="text-xs text-gray-500">{exp.description}</p>
                                        </div>
                                        {formData.communicationExpectations === exp.value && (
                                            <CheckCircle2 className="w-5 h-5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                        <div>
                            {step > 1 ? (
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            ) : onSkip ? (
                                <Button
                                    variant="ghost"
                                    onClick={onSkip}
                                    className="text-gray-500 hover:text-gray-300"
                                >
                                    Skip for now
                                </Button>
                            ) : null}
                        </div>

                        <div>
                            {step < totalSteps ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className="bg-white hover:bg-gray-200 text-black"
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleComplete}
                                    disabled={!isStepValid() || loading}
                                    className="bg-white hover:bg-gray-200 text-black"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                                            Setting up...
                                        </>
                                    ) : (
                                        <>
                                            Complete Setup
                                            <Check className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                {(formData.primaryGoal || formData.studyFrequency || formData.communicationExpectations) && (
                    <div className="mt-6 p-4 bg-[#121217]/50 border border-white/10 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Preferences</p>
                        <div className="flex flex-wrap gap-2">
                            {formData.primaryGoal && (
                                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full border border-white/10">
                                    {GOALS.find(g => g.value === formData.primaryGoal)?.label}
                                </span>
                            )}
                            {formData.studyFrequency && (
                                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full border border-white/10">
                                    {STUDY_FREQUENCIES.find(f => f.value === formData.studyFrequency)?.label}
                                </span>
                            )}
                            {formData.communicationExpectations && (
                                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full border border-white/10">
                                    {COMMUNICATION_EXPECTATIONS.find(e => e.value === formData.communicationExpectations)?.label} Communication
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
