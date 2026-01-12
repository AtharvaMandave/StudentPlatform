'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Loader2, MoreVertical, ExternalLink, UserMinus, MessageSquare, Calendar, ListChecks
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Card } from '@/components/ui/GlassCard'; // Correct import
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConnectNav from '@/components/connect/ConnectNav';
import { connectAPI } from '@/lib/connectApi';

function PartnerRow({ partner, onRemove }) {
    const [removing, setRemoving] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleRemove = async () => {
        if (!confirm(`Remove ${partner.name} from your partners? This cannot be undone.`)) return;
        setRemoving(true);
        try {
            await onRemove(partner.partnerId);
        } finally {
            setRemoving(false);
        }
    };

    return (
        <Card className="flex items-center gap-4 p-4" hover>
            <Avatar name={partner.name} size="md" />

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{partner.name}</h3>
                <p className="text-sm text-gray-500 truncate">
                    Connected since {new Date(partner.connectedAt).toLocaleDateString()}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Link href={`/connect/plan/${partner.connectionId}`}>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-500">
                        <ListChecks className="w-4 h-4" />
                    </Button>
                </Link>
                <Link href={`/connect/checkin/${partner.connectionId}`}>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-500">
                        <Calendar className="w-4 h-4" />
                    </Button>
                </Link>
                <Link href={`/connect/chat/${partner.connectionId}`}>
                    <Button size="sm" className="bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                    </Button>
                </Link>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMenu(!showMenu)}
                        className="h-9 w-9 p-0 text-gray-500"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-lg shadow-lg z-50 py-1">
                                <Link
                                    href={`/connect/onboarding/${partner.connectionId}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#27272A]"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Onboarding
                                </Link>
                                <button
                                    onClick={handleRemove}
                                    disabled={removing}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                                    Remove Partner
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}

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
            const data = response?.data || response || [];
            setPartners(data);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load partners',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (partnerId) => {
        try {
            await connectAPI.removePartner(partnerId);
            setPartners(prev => prev.filter(p => p.partnerId !== partnerId));
            setAlert({ type: 'success', message: 'Partner removed' });
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to remove partner' });
        }
    };

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ConnectNav />

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Partners</h1>
                    <p className="text-sm text-gray-500">Manage your active connections</p>
                </div>

                {loading ? (
                    <LoadingState count={3} type="row" />
                ) : partners.length === 0 ? (
                    <EmptyState
                        title="No partners yet"
                        description="Find study partners to start collaborating."
                        action={() => window.location.href = '/connect'}
                        actionLabel="Find Partners"
                    />
                ) : (
                    <div className="space-y-3">
                        {partners.map((partner) => (
                            <PartnerRow
                                key={partner.partnerId || partner.connectionId}
                                partner={partner}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
