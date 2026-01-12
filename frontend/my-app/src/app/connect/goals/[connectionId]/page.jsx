'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, ArrowRight, Target, Calendar, ListTodo, Plus, X,
    Loader2, CheckCircle2, Sparkles, Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { connectAPI } from '@/lib/connectApi';

const GOALS = [
    { value: 'DSA', label: 'DSA', icon: '🧮' },
    { value: 'WEB_DEV', label: 'Web Development', icon: '🌐' },
    { value: 'HIGHER_STUDIES', label: 'Higher Studies', icon: '🎓' },
    { value: 'UPSC', label: 'UPSC', icon: '📚' },
    { value: 'GATE', label: 'GATE', icon: '🔬' },
    { value: 'PLACEMENTS', label: 'Placements', icon: '💼' },
    { value: 'OTHER', label: 'Other', icon: '✨' },
];

export default function GoalAlignmentPage() {
    const params = useParams();
    const router = useRouter();
    const connectionId = params.connectionId;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [partner, setPartner] = useState(null);
    const [alert, setAlert] = useState(null);
    const [existingPlan, setExistingPlan] = useState(null);

    const [formData, setFormData] = useState({
        sharedGoal: '',
        shortTermTarget: {
            description: '',
            deadline: '',
            topics: [],
        },
        longTermTarget: {
            description: '',
            deadline: '',
            topics: [],
        },
    });

    const [newShortTopic, setNewShortTopic] = useState('');
    const [newLongTopic, setNewLongTopic] = useState('');

    useEffect(() => {
        fetchData();
    }, [connectionId]);

    const fetchData = async () => {
        try {
            // Fetch partner info
            const partnersRes = await connectAPI.getPartners();
            const partners = partnersRes?.data || partnersRes || [];
            const currentPartner = partners.find(p => p.connectionId === connectionId);
            if (currentPartner) {
                setPartner(currentPartner);
                setFormData(prev => ({
                    ...prev,
                    sharedGoal: currentPartner.primaryGoal || '',
                }));
            }

            // Check if plan already exists
            try {
                const planRes = await connectAPI.getStudyPlan(connectionId);
                if (planRes?.data?.plan) {
                    setExistingPlan(planRes.data.plan);
                    // Pre-fill form with existing plan
                    const plan = planRes.data.plan;
                    setFormData({
                        sharedGoal: plan.sharedGoal || '',
                        shortTermTarget: plan.shortTermTarget || { description: '', deadline: '', topics: [] },
                        longTermTarget: plan.longTermTarget || { description: '', deadline: '', topics: [] },
                    });
                }
            } catch (e) {
                // No existing plan, that's fine
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setAlert({
                type: 'error',
                message: 'Failed to load connection data',
            });
        } finally {
            setLoading(false);
        }
    };

    const addTopic = (type, topic) => {
        if (!topic.trim()) return;

        if (type === 'short') {
            setFormData(prev => ({
                ...prev,
                shortTermTarget: {
                    ...prev.shortTermTarget,
                    topics: [...(prev.shortTermTarget.topics || []), topic.trim()],
                },
            }));
            setNewShortTopic('');
        } else {
            setFormData(prev => ({
                ...prev,
                longTermTarget: {
                    ...prev.longTermTarget,
                    topics: [...(prev.longTermTarget.topics || []), topic.trim()],
                },
            }));
            setNewLongTopic('');
        }
    };

    const removeTopic = (type, index) => {
        if (type === 'short') {
            setFormData(prev => ({
                ...prev,
                shortTermTarget: {
                    ...prev.shortTermTarget,
                    topics: prev.shortTermTarget.topics.filter((_, i) => i !== index),
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                longTermTarget: {
                    ...prev.longTermTarget,
                    topics: prev.longTermTarget.topics.filter((_, i) => i !== index),
                },
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.sharedGoal) {
            setAlert({ type: 'error', message: 'Please select a shared goal' });
            return;
        }

        setSaving(true);
        try {
            // First, check if plan exists by trying to fetch it
            let planExists = existingPlan !== null;

            if (!planExists) {
                try {
                    const checkRes = await connectAPI.getStudyPlan(connectionId);
                    planExists = !!(checkRes?.data?.plan || checkRes?.plan);
                } catch (e) {
                    // 404 means no plan exists, which is fine
                    planExists = false;
                }
            }

            if (planExists) {
                // Update existing plan
                await connectAPI.updateStudyPlan(connectionId, formData);
            } else {
                // Create new plan
                await connectAPI.createStudyPlan(connectionId, formData);
            }

            setAlert({ type: 'success', message: 'Goals saved successfully!' });

            // Redirect to study plan page
            setTimeout(() => {
                router.push(`/connect/plan/${connectionId}`);
            }, 1500);
        } catch (error) {
            console.error('Save goals error:', error);
            setAlert({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Failed to save goals',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/connect/partners`}
                        className="p-2 rounded-lg hover:bg-[#1A1B26] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-gray-400" />
                            Goal Alignment
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Set shared goals with {partner?.name || 'your partner'}
                        </p>
                    </div>
                </div>

                {/* Goal Selection */}
                <div className="bg-[#121217] border border-white/10 rounded-xl p-6 mb-6">
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-gray-400" />
                        Shared Primary Goal
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {GOALS.map((goal) => (
                            <button
                                key={goal.value}
                                onClick={() => setFormData(prev => ({ ...prev, sharedGoal: goal.value }))}
                                className={`p-4 rounded-lg border text-center transition-all ${formData.sharedGoal === goal.value
                                    ? 'bg-white text-black border-white'
                                    : 'border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-2xl block mb-2">{goal.icon}</span>
                                <span className="text-xs font-medium">{goal.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Short-term Target */}
                <div className="bg-[#121217] border border-white/10 rounded-xl p-6 mb-6">
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Short-term Target (1-2 weeks)
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">What do you want to achieve?</label>
                            <input
                                type="text"
                                value={formData.shortTermTarget.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    shortTermTarget: { ...prev.shortTermTarget, description: e.target.value }
                                }))}
                                placeholder="e.g., Complete Arrays and Strings in DSA"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/30 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Target Deadline</label>
                            <input
                                type="date"
                                value={formData.shortTermTarget.deadline ? formData.shortTermTarget.deadline.split('T')[0] : ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    shortTermTarget: { ...prev.shortTermTarget, deadline: e.target.value }
                                }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Topics to Cover</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newShortTopic}
                                    onChange={(e) => setNewShortTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTopic('short', newShortTopic)}
                                    placeholder="Add a topic..."
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/30 text-sm"
                                />
                                <Button
                                    onClick={() => addTopic('short', newShortTopic)}
                                    className="bg-white hover:bg-gray-200 text-black"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.shortTermTarget.topics?.map((topic, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-white/10 text-white rounded-full text-xs flex items-center gap-2 border border-white/10"
                                    >
                                        {topic}
                                        <button onClick={() => removeTopic('short', i)} className="hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Long-term Target */}
                <div className="bg-[#121217] border border-white/10 rounded-xl p-6 mb-6">
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Long-term Target (1-3 months)
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">What's your bigger goal?</label>
                            <input
                                type="text"
                                value={formData.longTermTarget.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    longTermTarget: { ...prev.longTermTarget, description: e.target.value }
                                }))}
                                placeholder="e.g., Complete entire DSA roadmap from Arrays to Dynamic Programming"
                                className="w-full px-4 py-3 bg-[#1A1B26] border border-[#2A2B3A] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Target Deadline</label>
                            <input
                                type="date"
                                value={formData.longTermTarget.deadline ? formData.longTermTarget.deadline.split('T')[0] : ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    longTermTarget: { ...prev.longTermTarget, deadline: e.target.value }
                                }))}
                                className="w-full px-4 py-3 bg-[#1A1B26] border border-[#2A2B3A] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Major Milestones</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newLongTopic}
                                    onChange={(e) => setNewLongTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTopic('long', newLongTopic)}
                                    placeholder="Add a milestone..."
                                    className="flex-1 px-4 py-2 bg-[#1A1B26] border border-[#2A2B3A] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <Button
                                    onClick={() => addTopic('long', newLongTopic)}
                                    className="bg-white hover:bg-gray-200 text-black"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.longTermTarget.topics?.map((topic, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-white/10 text-white rounded-full text-xs flex items-center gap-2 border border-white/10"
                                    >
                                        {topic}
                                        <button onClick={() => removeTopic('long', i)} className="hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <Link href={`/connect/partners`}>
                        <Button variant="ghost" className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Partners
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || !formData.sharedGoal}
                        className="bg-white hover:bg-gray-200 text-black"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue to Study Plan
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
