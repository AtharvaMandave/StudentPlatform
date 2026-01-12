'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Trash2, Check, Clock, Circle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Card } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Progress';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

export default function StudyPlanPage() {
    const params = useParams();
    const router = useRouter();
    const connectionId = params.connectionId;

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [partner, setPartner] = useState(null);
    const [alert, setAlert] = useState(null);
    const [newItem, setNewItem] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchData();
    }, [connectionId]);

    const fetchData = async () => {
        try {
            console.log('Fetching partners...');
            const partnersRes = await connectAPI.getPartners();
            const partners = partnersRes?.data || partnersRes || [];
            console.log('Partners:', partners);

            const currentPartner = partners.find(p => p.connectionId === connectionId);
            console.log('Current partner:', currentPartner);

            if (currentPartner) setPartner(currentPartner);

            try {
                console.log('Fetching study plan for connection:', connectionId);
                const planRes = await connectAPI.getStudyPlan(connectionId);
                console.log('Plan response:', planRes);

                const data = planRes?.data || planRes;
                const fetchedPlan = data?.plan || data;
                const role = data?.currentUserRole;

                console.log('Fetched plan:', fetchedPlan);
                console.log('Current user role:', role);

                if (fetchedPlan) {
                    // Process checklist to add myStatus
                    if (fetchedPlan.checklist && role) {
                        fetchedPlan.checklist = fetchedPlan.checklist.map(item => ({
                            ...item,
                            myStatus: role === 'studentA' ? item.studentAStatus : item.studentBStatus
                        }));
                    }
                    setPlan(fetchedPlan);
                } else {
                    console.warn('No plan found in response');
                    setAlert({ type: 'info', message: 'No study plan found. Create one from the goals page.' });
                }
            } catch (e) {
                console.error('Study plan fetch error:', e);
                if (e.response?.status === 404) {
                    console.log('404 - Redirecting to goals page');
                    setAlert({ type: 'info', message: 'No study plan found. Redirecting to create one...' });
                    setTimeout(() => router.push(`/connect/goals/${connectionId}`), 1500);
                } else {
                    setAlert({ type: 'error', message: e.response?.data?.message || 'Failed to load study plan' });
                }
            }
        } catch (error) {
            console.error('General fetch error:', error);
            setAlert({ type: 'error', message: 'Failed to load plan' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.trim()) return;
        setAdding(true);
        try {
            await connectAPI.addChecklistItem(connectionId, { topic: newItem.trim() });
            setNewItem('');
            fetchData();
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to add item' });
        } finally {
            setAdding(false);
        }
    };

    const handleStatusChange = async (itemId, currentStatus) => {
        const nextStatus = currentStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
        try {
            await connectAPI.updateChecklistItem(connectionId, itemId, { status: nextStatus });
            fetchData();
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to update status' });
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await connectAPI.removeChecklistItem(connectionId, itemId);
            fetchData();
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to remove item' });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading plan...</div>;

    const checklist = plan?.checklist || [];
    const completedCount = checklist.filter(i => i.myStatus === 'COMPLETED').length;
    const progress = checklist.length ? (completedCount / checklist.length) * 100 : 0;

    return (
        <DashboardLayout>
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/connect/partners" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Study Plan</h1>
                        <p className="text-sm text-gray-500">with {partner?.name}</p>
                    </div>
                </div>

                {/* Progress Card */}
                <Card className="mb-8 bg-gray-50 dark:bg-[#18181B] border-none">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Progress</span>
                        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <ProgressBar progress={progress} size="sm" color="primary" />
                </Card>

                {/* Checklist */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-[#27272A] bg-gray-50/50 dark:bg-[#18181B]/50 flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 dark:text-white">Topics</h3>
                        <span className="text-xs text-gray-500">{completedCount}/{checklist.length} completed</span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-[#27272A]">
                        {/* Add Input */}
                        <div className="p-4 flex gap-2">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                placeholder="Add a new topic..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10"
                            />
                            <Button
                                size="sm"
                                onClick={handleAddItem}
                                disabled={!newItem.trim() || adding}
                                variant="secondary"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* List */}
                        {checklist.map((item) => (
                            <div key={item._id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#18181B] transition-colors group">
                                <button
                                    onClick={() => handleStatusChange(item._id, item.myStatus)}
                                    className={cn(
                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                        item.myStatus === 'COMPLETED'
                                            ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-black"
                                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                                    )}
                                >
                                    {item.myStatus === 'COMPLETED' && <Check className="w-3 h-3" />}
                                </button>

                                <span className={cn(
                                    "flex-1 text-sm transition-colors",
                                    item.myStatus === 'COMPLETED' ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"
                                )}>
                                    {item.topic}
                                </span>

                                <button
                                    onClick={() => handleRemoveItem(item._id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {checklist.length === 0 && (
                            <div className="p-8 text-center text-sm text-gray-500">
                                No topics added yet.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
