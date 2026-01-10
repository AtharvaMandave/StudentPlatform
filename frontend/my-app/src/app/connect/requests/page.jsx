'use client';

import { useState, useEffect } from 'react';
import {
    UserPlus, Check, X, Loader2, Clock, Send
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
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
            // Handle different response structures
            const pendingData = pendingRes?.data || pendingRes || [];
            const sentData = sentRes?.data || sentRes || [];
            setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
            setSentRequests(Array.isArray(sentData) ? sentData : []);
        } catch (error) {
            console.error('Failed to load requests:', error);
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to load requests',
            });
            // Ensure arrays are set even on error
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
            setAlert({ type: 'success', message: 'Request accepted! You are now connected.' });
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

            <div className="p-6">
                <ConnectNav />

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Connection Requests</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage your connection requests
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-[#151621] rounded-xl border border-[#2A2B3A] inline-flex">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'received'
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-gray-400 hover:text-white hover:bg-[#1E1F2E]"
                        )}
                    >
                        Received ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'sent'
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-gray-400 hover:text-white hover:bg-[#1E1F2E]"
                        )}
                    >
                        Sent ({sentRequests.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : activeTab === 'received' ? (
                    pendingRequests.length === 0 ? (
                        <EmptyState
                            icon={UserPlus}
                            title="No pending requests"
                            description="When someone sends you a connection request, it will appear here."
                        />
                    ) : (
                        <div className="space-y-4 grid md:grid-cols-2 gap-4">
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
                            description="Requests you send to other users will appear here."
                        />
                    ) : (
                        <div className="space-y-4 grid md:grid-cols-2 gap-4">
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
        <div className="bg-[#151621] border border-[#2A2B3A] p-5 rounded-2xl">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {request.requester.name?.charAt(0) || 'U'}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <h3 className="font-semibold text-white">{request.requester.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <span>{request.requester.primaryGoal}</span>
                        <span>•</span>
                        <span>{request.requester.studyLevel}</span>
                    </div>

                    {request.requestMessage && (
                        <p className="text-sm text-gray-300 mb-3 bg-[#1A1B26] rounded-lg p-3 border border-[#2A2B3A]">
                            "{request.requestMessage}"
                        </p>
                    )}

                    {/* Match Score */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-400">Match Score:</span>
                        <span className={cn(
                            "text-sm font-semibold",
                            request.matchScore >= 80 ? "text-emerald-400" : "text-primary"
                        )}>
                            {request.matchScore}%
                        </span>
                    </div>

                    {/* Match Reasons */}
                    <div className="flex flex-wrap gap-1 mb-4">
                        {request.matchReasons?.slice(0, 3).map((reason, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full bg-[#1A1B26] text-primary border border-primary/20"
                            >
                                {reason.replace(/^Same goal: |^Same level: /, '')}
                            </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            loading={loading.accept}
                            disabled={loading.reject}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleReject}
                            loading={loading.reject}
                            disabled={loading.accept}
                            className="bg-[#1A1B26] border border-[#2A2B3A] text-white hover:bg-[#2A2B3A]"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Decline
                        </Button>
                    </div>
                </div>

                {/* Time */}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(request.createdAt)}
                </div>
            </div>
        </div>
    );
}

function SentRequestCard({ request }) {
    return (
        <div className="bg-[#151621] border border-[#2A2B3A] p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-semibold">
                {request.receiver.name?.charAt(0) || 'U'}
            </div>

            <div className="flex-1">
                <h3 className="font-medium text-white">{request.receiver.name}</h3>
                <p className="text-sm text-gray-400">
                    {request.receiver.primaryGoal} • Match {request.matchScore}%
                </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">
                    Pending
                </span>
                <span className="text-xs text-gray-500">
                    {formatTimeAgo(request.createdAt)}
                </span>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1B26] flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
            <p className="text-gray-500 text-sm">{description}</p>
        </div>
    );
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}
