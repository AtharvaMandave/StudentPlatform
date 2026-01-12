'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import OnboardingWizard from '@/components/connect/OnboardingWizard';
import Alert from '@/components/ui/Alert';
import { connectAPI } from '@/lib/connectApi';
import api from '@/lib/api';

export default function OnboardingPage() {
    const params = useParams();
    const router = useRouter();
    const connectionId = params.connectionId;

    const [loading, setLoading] = useState(true);
    const [partner, setPartner] = useState(null);
    const [alert, setAlert] = useState(null);
    const [alreadyComplete, setAlreadyComplete] = useState(false);

    useEffect(() => {
        fetchConnectionInfo();
    }, [connectionId]);

    const fetchConnectionInfo = async () => {
        try {
            // Get partner info
            const response = await connectAPI.getPartners();
            const partners = response?.data || response || [];
            const currentPartner = partners.find(p => p.connectionId === connectionId);

            if (currentPartner) {
                setPartner(currentPartner);

                // Check if onboarding is already complete
                if (currentPartner.onboardingComplete) {
                    setAlreadyComplete(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch connection info:', error);
            setAlert({
                type: 'error',
                message: 'Failed to load connection information',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (preferences) => {
        try {
            // Call onboarding completion API
            await api.post(`/connect/onboarding/${connectionId}`, preferences);

            setAlert({
                type: 'success',
                message: 'Onboarding complete! Redirecting to study plan setup...',
            });

            // Redirect to goal alignment / study plan creation
            setTimeout(() => {
                router.push(`/connect/goals/${connectionId}`);
            }, 1500);
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to complete onboarding',
            });
            throw error;
        }
    };

    const handleSkip = () => {
        router.push(`/connect/chat/${connectionId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (alreadyComplete) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Onboarding Complete</h1>
                    <p className="text-gray-400 mb-6">
                        You've already completed onboarding with {partner?.name || 'your partner'}.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.push(`/connect/plan/${connectionId}`)}
                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium"
                        >
                            View Study Plan
                        </button>
                        <button
                            onClick={() => router.push(`/connect/chat/${connectionId}`)}
                            className="px-6 py-3 bg-[#1A1B26] border border-[#2A2B3A] text-white rounded-xl font-medium hover:bg-[#2A2B3A]"
                        >
                            Go to Chat
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <OnboardingWizard
                partnerName={partner?.name}
                onComplete={handleComplete}
                onSkip={handleSkip}
                initialData={{
                    primaryGoal: partner?.primaryGoal,
                }}
            />
        </>
    );
}
