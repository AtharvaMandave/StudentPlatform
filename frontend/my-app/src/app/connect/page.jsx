'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Filter, RefreshCw, ArrowRight, Search,
    Code, BookOpen, Briefcase, GraduationCap, Layout
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Card, CardHeader } from '@/components/ui/GlassCard'; // Renamed import but file is Card
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils'; // Keep existing utility

import DashboardLayout from '@/components/layout/DashboardLayout';
import PartnerCard from '@/components/connect/PartnerCard';
import FilterBar from '@/components/connect/FilterBar';
import ConnectNav from '@/components/connect/ConnectNav';

export default function DiscoverPage() {
    const router = useRouter();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filters, setFilters] = useState({
        level: 'ALL',
        availability: 'ALL',
        mode: 'ALL',
    });
    const [filterOptions, setFilterOptions] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [hasProfile, setHasProfile] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        checkProfile();
    }, []);

    useEffect(() => {
        if (hasProfile) {
            fetchPartners();
            fetchFilterOptions();
        }
    }, [filters, hasProfile]);

    const checkProfile = async () => {
        setCheckingProfile(true);
        try {
            const response = await connectAPI.getProfile();
            const profile = response?.data || response;
            if (profile && profile.isProfileComplete) {
                setHasProfile(true);
            } else {
                setHasProfile(false);
            }
        } catch (error) {
            setHasProfile(false);
        } finally {
            setCheckingProfile(false);
        }
    };

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const response = await connectAPI.discoverPartners(filters, pagination.page);
            const data = response?.data || response;
            setPartners(data.partners || []);
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error(error); // Log error for debugging
            setAlert({
                type: 'error',
                message: 'Failed to load partners',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const response = await connectAPI.getFilterOptions();
            const data = response?.data || response;
            setFilterOptions(data);
        } catch (error) {
            console.error('Failed to load filter options');
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            await connectAPI.sendRequest(userId);
            setAlert({ type: 'success', message: 'Request sent' });
            // Optimistic update
            setPartners(prev => prev.filter(p => p.userId !== userId));
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send request',
            });
        }
    };

    // Loading while checking profile
    if (checkingProfile) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#09090B] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-500">Checking profile...</p>
                </div>
            </div>
        );
    }

    // No profile prompt
    if (!hasProfile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-[#27272A] rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Layout className="w-6 h-6 text-gray-900 dark:text-white" />
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Set up your profile
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Complete your profile to start matchmaking with other students.
                    </p>

                    <Link href="/connect/profile" className="block">
                        <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                            Create Profile
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ConnectNav />

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Discover</h1>
                        <p className="text-sm text-gray-500 mt-1">Find study partners that match your goals.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] text-gray-700 dark:text-gray-300",
                                showFilters && "bg-gray-100 dark:bg-[#27272A]"
                            )}
                        >
                            <Filter className="w-3.5 h-3.5 mr-2" />
                            Filters
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={fetchPartners}
                            disabled={loading}
                            className="border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] text-gray-700 dark:text-gray-300"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && filterOptions && (
                    <div className="mb-8 p-4 bg-gray-50 dark:bg-[#18181B] rounded-lg border border-gray-200 dark:border-[#27272A]">
                        <FilterBar
                            filters={filters}
                            setFilters={setFilters}
                            options={filterOptions}
                        />
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <LoadingState count={6} type="card" />
                ) : partners.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No partners found"
                        description="Try adjusting your filters to see more results."
                        action={() => setFilters({ level: 'ALL', availability: 'ALL', mode: 'ALL' })}
                        actionLabel="Clear Filters"
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {partners.map((partner) => (
                            <PartnerCard
                                key={partner.userId}
                                partner={partner}
                                onSendRequest={handleSendRequest}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-gray-100 dark:border-[#27272A]">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="text-gray-500"
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium text-gray-900 dark:text-white px-2">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="text-gray-500"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
