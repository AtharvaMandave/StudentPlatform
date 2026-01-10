'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search, Filter, Users, Target, Clock, BookOpen,
    ChevronRight, UserPlus, Loader2, RefreshCw, Sparkles
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

// Import sidebar for dashboard layout
import DashboardLayout from '@/components/connect/DashboardLayout';
import PartnerCard from '@/components/connect/PartnerCard';
import FilterBar from '@/components/connect/FilterBar';

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
            // Handle both response structures
            const profile = response?.data || response;
            console.log('Profile check response:', profile);

            if (profile && profile.isProfileComplete) {
                setHasProfile(true);
            } else {
                setHasProfile(false);
            }
        } catch (error) {
            console.log('Profile check error:', error?.response?.status);
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
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to load partners',
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
            setAlert({ type: 'success', message: 'Connection request sent!' });
            // Remove from list
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
            <div className="min-h-screen bg-light-purple flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // No profile - show prompt to create
    if (!hasProfile) {
        return (
            <div className="min-h-screen bg-light-purple flex items-center justify-center p-4">
                <div className="card-white p-8 max-w-md text-center animate-slide-up">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8 text-violet-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        Set Up Your Profile
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Before you can find study partners, please complete your Student Connect profile.
                    </p>
                    <Link href="/connect/profile">
                        <Button className="w-full">
                            Create Profile
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Find Study Partners</h1>
                        <p className="text-gray-500 text-sm">
                            Connect with students who share your goals
                        </p>
                    </div>
                    <Button variant="secondary" onClick={fetchPartners} disabled={loading}>
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                {filterOptions && (
                    <FilterBar
                        filters={filters}
                        setFilters={setFilters}
                        options={filterOptions}
                    />
                )}

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : partners.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No partners found</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Try adjusting your filters or check back later
                        </p>
                        <Button variant="secondary" onClick={() => setFilters({ level: 'ALL', availability: 'ALL', mode: 'ALL' })}>
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-4">
                            Found {pagination.total} potential partner{pagination.total !== 1 ? 's' : ''}
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {partners.map((partner) => (
                                <PartnerCard
                                    key={partner.userId}
                                    partner={partner}
                                    onSendRequest={handleSendRequest}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-500 px-4">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
