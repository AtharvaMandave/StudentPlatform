'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users, MessageSquare, Trash2, Loader2, UserX, Flame, Target
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';
import ConnectNav from '@/components/connect/ConnectNav';

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const response = await connectAPI.getPartners();
            // Handle different response structures
            const data = response?.data || response || [];
            setPartners(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load partners:', error);
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to load partners',
            });
            setPartners([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePartner = async (partnerId) => {
        if (!confirm('Are you sure you want to remove this partner?')) return;

        try {
            await connectAPI.removePartner(partnerId);
            setPartners(prev => prev.filter(p => p.partnerId !== partnerId));
            setAlert({ type: 'success', message: 'Partner removed' });
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to remove partner',
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

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Partners</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Your connected study partners ({partners.length})
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : partners.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-[#1A1B26] flex items-center justify-center mx-auto mb-4 border border-[#2A2B3A]">
                            <Users className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No partners yet</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Start discovering study partners to connect with
                        </p>
                        <Link href="/connect">
                            <Button className="bg-primary hover:bg-primary/90 text-white">Find Partners</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {partners.map((partner) => (
                            <PartnerRow
                                key={partner.connectionId}
                                partner={partner}
                                onRemove={handleRemovePartner}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

function PartnerRow({ partner, onRemove }) {
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        setRemoving(true);
        await onRemove(partner.partnerId);
        setRemoving(false);
    };

    return (
        <div className="bg-[#151621] border border-[#2A2B3A] p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {partner.name?.charAt(0) || 'U'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{partner.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>{partner.primaryGoal}</span>
                    <span>•</span>
                    <span>{partner.studyLevel}</span>
                    {partner.progressStats?.currentStreak > 0 && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-orange-400">
                                <Flame className="w-3 h-3" />
                                {partner.progressStats.currentStreak} day streak
                            </span>
                        </>
                    )}
                </div>
                {partner.currentFocus && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Target className="w-3 h-3" />
                        <span className="truncate">{partner.currentFocus}</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="hidden md:block text-right text-sm">
                <p className="text-gray-400">{partner.messageCount || 0} messages</p>
                <p className="text-xs text-gray-500">
                    Connected {new Date(partner.connectedAt).toLocaleDateString()}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Link href={`/connect/chat/${partner.connectionId}`}>
                    <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90 text-white">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={removing}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                    {removing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
