'use client';

import { useState, useEffect } from 'react';
import {
    Bell, Check, X, Loader2, Clock, Send, Inbox, UserCheck, Sparkles, ChevronRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Card } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';
import ConnectNav from '@/components/connect/ConnectNav';

export default function RequestsPage() {
    const [activeTab, setActiveTab] = useState('received');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const [pendingRes, sentRes] = await Promise.all([
                connectAPI.getPendingRequests(),
                connectAPI.getSentRequests(),
            ]);
            // Ensure arrays even if API response is nested differently
            const pendingData = pendingRes?.data?.requests || pendingRes?.data || pendingRes || [];
            const sentData = sentRes?.data?.requests || sentRes?.data || sentRes || [];

            setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
            setSentRequests(Array.isArray(sentData) ? sentData : []);
        } catch (error) {
            console.error(error);
            setAlert({
                type: 'error',
                message: 'Failed to load requests',
            });
            setPendingRequests([]);
            setSentRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await connectAPI.acceptRequest(requestId);
            setPendingRequests(prev => prev.filter(r => r._id !== requestId));
            setAlert({ type: 'success', message: 'Connected' });
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to accept request',
            });
        }
    };

    const handleReject = async (requestId) => {
        try {
            await connectAPI.rejectRequest(requestId);
            setPendingRequests(prev => prev.filter(r => r._id !== requestId));
            setAlert({ type: 'info', message: 'Request declined' });
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to reject request',
            });
        }
    };

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ConnectNav pendingCount={pendingRequests.length} />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Requests</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage connection invitations.</p>
                    </div>
                </div>

                {/* Tabs - Minimal */}
                <div className="flex border-b border-gray-200 dark:border-[#27272A] mb-8">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'received'
                                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        Received ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'sent'
                                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        Sent ({sentRequests.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </div>
                ) : activeTab === 'received' ? (
                    pendingRequests.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="No pending requests"
                            description="Invitations from other students will appear here."
                        />
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {pendingRequests.map((request) => (
                                <ReceivedRequestCard
                                    key={request._id}
                                    request={request}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    sentRequests.length === 0 ? (
                        <EmptyState
                            icon={Send}
                            title="No sent requests"
                            description="Requests you send to others will appear here."
                            action={() => window.location.href = '/connect'}
                            actionLabel="Find Partners"
                        />
                    ) : (
                        <div className="space-y-3">
                            {sentRequests.map((request) => (
                                <SentRequestCard key={request._id} request={request} />
                            ))}
                        </div>
                    )
                )}
            </div>
        </DashboardLayout>
    );
}

function ReceivedRequestCard({ request, onAccept, onReject }) {
    const [loading, setLoading] = useState({ accept: false, reject: false });

    const handleAccept = async () => {
        setLoading({ ...loading, accept: true });
        await onAccept(request._id);
    };

    const handleReject = async () => {
        setLoading({ ...loading, reject: true });
        await onReject(request._id);
    };

    return (
        <Card className="p-5 flex flex-col h-full" hover>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar name={request.requester.name} size="md" />
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{request.requester.name}</h4>
                        <p className="text-xs text-gray-500">{request.requester.primaryGoal} • {request.requester.studyLevel}</p>
                    </div>
                </div>
                <Badge variant="default" className="text-xs">
                    {request.matchScore}% match
                </Badge>
            </div>

            {request.requestMessage && (
                <div className="mb-6 flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#18181B] p-3 rounded-md italic border border-gray-100 dark:border-[#27272A]">
                        "{request.requestMessage}"
                    </p>
                </div>
            )}

            <div className="flex gap-3 pt-4 mt-auto border-t border-gray-100 dark:border-[#27272A]">
                <Button
                    size="sm"
                    className="flex-1 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                    onClick={handleAccept}
                    loading={loading.accept}
                    disabled={loading.reject}
                >
                    Accept
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-200 dark:border-[#27272A]"
                    onClick={handleReject}
                    loading={loading.reject}
                    disabled={loading.accept}
                >
                    Decline
                </Button>
            </div>
        </Card>
    );
}

function SentRequestCard({ request }) {
    return (
        <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar name={request.receiver.name} size="sm" />
                <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{request.receiver.name}</p>
                    <p className="text-xs text-gray-500">Sent {formatTimeAgo(request.createdAt)}</p>
                </div>
            </div>
            <Badge variant="warning" className="text-xs">Pending</Badge>
        </Card>
    );
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}
