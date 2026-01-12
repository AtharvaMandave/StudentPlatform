'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Calendar, Save, Send, ChevronRight, Loader2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Card } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Progress';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

const STEPS = ['Progress', 'Reflection', 'Next Week'];

export default function CheckInPage() {
    const params = useParams();
    const router = useRouter();
    const connectionId = params.connectionId;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [checkIn, setCheckIn] = useState(null);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        completedTopics: [],
        totalHoursStudied: 0,
        tasksCompleted: 0,
        goalsMet: false,
        reflection: {
            whatWentWell: '',
            challenges: '',
            keyLearnings: '',
        },
        nextWeekPlan: {
            goals: [],
            focusTopics: [],
            plannedHours: 0,
        },
        weeklyMood: '',
        energyLevel: 3,
        partnerInteraction: {
            helpfulnessRating: 5,
            communicationQuality: 'GOOD',
            wouldRecommend: true,
            feedback: '',
        },
    });

    const [newGoal, setNewGoal] = useState('');

    useEffect(() => {
        fetchData();
    }, [connectionId]);

    const fetchData = async () => {
        try {
            const checkInRes = await connectAPI.getCurrentCheckIn(connectionId);
            const data = checkInRes?.data || checkInRes;

            if (data?.checkIn) {
                setCheckIn(data.checkIn);
                const checkInData = data.checkIn;
                setFormData({
                    completedTopics: checkInData.completedTopics || [],
                    totalHoursStudied: checkInData.totalHoursStudied ?? 0,
                    tasksCompleted: checkInData.tasksCompleted ?? 0,
                    goalsMet: checkInData.goalsMet ?? false,
                    reflection: {
                        whatWentWell: checkInData.reflection?.whatWentWell ?? '',
                        challenges: checkInData.reflection?.challenges ?? '',
                        keyLearnings: checkInData.reflection?.keyLearnings ?? '',
                    },
                    nextWeekPlan: {
                        goals: checkInData.nextWeekPlan?.goals || [],
                        focusTopics: checkInData.nextWeekPlan?.focusTopics || [],
                        plannedHours: checkInData.nextWeekPlan?.plannedHours ?? 0,
                    },
                    weeklyMood: checkInData.weeklyMood ?? '',
                    energyLevel: checkInData.energyLevel ?? 3,
                    partnerInteraction: {
                        helpfulnessRating: checkInData.partnerInteraction?.helpfulnessRating ?? 5,
                        communicationQuality: checkInData.partnerInteraction?.communicationQuality ?? 'GOOD',
                        wouldRecommend: checkInData.partnerInteraction?.wouldRecommend ?? true,
                        feedback: checkInData.partnerInteraction?.feedback ?? '',
                    },
                });
            }
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to load check-in' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (submit = false) => {
        setSaving(true);
        try {
            await connectAPI.updateCheckIn(connectionId, formData, submit);
            setAlert({
                type: 'success',
                message: submit ? 'Submitted' : 'Saved',
            });
            if (submit) {
                setTimeout(() => router.push(`/connect/partners`), 1000);
            }
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to save',
            });
        } finally {
            setSaving(false);
        }
    };

    const addGoal = () => {
        if (!newGoal.trim()) return;
        setFormData(prev => ({
            ...prev,
            nextWeekPlan: {
                ...prev.nextWeekPlan,
                goals: [...prev.nextWeekPlan.goals, newGoal.trim()],
            },
        }));
        setNewGoal('');
    };

    const removeGoal = (index) => {
        setFormData(prev => ({
            ...prev,
            nextWeekPlan: {
                ...prev.nextWeekPlan,
                goals: prev.nextWeekPlan.goals.filter((_, i) => i !== index),
            },
        }));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading check-in...</div>;

    const isSubmitted = checkIn?.status === 'SUBMITTED';
    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/connect/partners" className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Weekly Check-In
                            {isSubmitted && <Badge variant="success">Submitted</Badge>}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Week {checkIn?.weekNumber} of {checkIn?.year}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                {!isSubmitted && (
                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            {STEPS.map((step, i) => (
                                <span key={step} className={i <= currentStep ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                                    {step}
                                </span>
                            ))}
                        </div>
                        <ProgressBar progress={progress} size="xs" color="primary" />
                    </div>
                )}

                {/* Content */}
                <Card>
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-3">How was your week?</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['GREAT', 'GOOD', 'OKAY', 'STRUGGLING', 'BURNED_OUT'].map((mood) => (
                                        <button
                                            key={mood}
                                            onClick={() => !isSubmitted && setFormData(prev => ({ ...prev, weeklyMood: mood }))}
                                            disabled={isSubmitted}
                                            className={cn(
                                                "p-3 rounded-lg border text-xs font-medium transition-colors",
                                                formData.weeklyMood === mood
                                                    ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900"
                                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#18181B] dark:border-[#27272A]"
                                            )}
                                        >
                                            {mood.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Hours Studied</label>
                                    <input
                                        type="number"
                                        value={formData.totalHoursStudied}
                                        onChange={(e) => setFormData(prev => ({ ...prev, totalHoursStudied: parseInt(e.target.value) || 0 }))}
                                        disabled={isSubmitted}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tasks Completed</label>
                                    <input
                                        type="number"
                                        value={formData.tasksCompleted}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tasksCompleted: parseInt(e.target.value) || 0 }))}
                                        disabled={isSubmitted}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {['whatWentWell', 'challenges', 'keyLearnings'].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium mb-2 capitalize">
                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <textarea
                                        value={formData.reflection[field]}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            reflection: { ...prev.reflection, [field]: e.target.value }
                                        }))}
                                        disabled={isSubmitted}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-md resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Planned Hours Next Week</label>
                                <input
                                    type="number"
                                    value={formData.nextWeekPlan.plannedHours}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nextWeekPlan: { ...prev.nextWeekPlan, plannedHours: parseInt(e.target.value) || 0 } }))}
                                    disabled={isSubmitted}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Goals</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newGoal}
                                        onChange={(e) => setNewGoal(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                                        disabled={isSubmitted}
                                        placeholder="Add a goal..."
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-md"
                                    />
                                    <Button onClick={addGoal} disabled={isSubmitted} variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.nextWeekPlan.goals.map((goal, i) => (
                                        <Badge key={i} variant="default" className="gap-2">
                                            {goal}
                                            {!isSubmitted && (
                                                <button onClick={() => removeGoal(i)} className="hover:text-red-500">×</button>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Footer */}
                {!isSubmitted && (
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : handleSave(false)}
                            disabled={saving}
                        >
                            {currentStep > 0 ? 'Back' : 'Save Draft'}
                        </Button>

                        {currentStep < STEPS.length - 1 ? (
                            <Button onClick={() => setCurrentStep(currentStep + 1)} className="bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button onClick={() => handleSave(true)} disabled={saving} className="bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Check-in'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
