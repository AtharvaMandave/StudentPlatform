'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, GraduationCap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SuccessIllustration, ErrorIllustration } from '@/components/ui/Illustrations';
import { authAPI } from '@/lib/api';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await authAPI.verifyEmail(params.token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                setTimeout(() => router.push('/login'), 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (params.token) verifyEmail();
    }, [params.token, router]);

    return (
        <div className="min-h-screen bg-light-purple flex items-center justify-center p-4">
            <div className="card-white p-8 max-w-md w-full text-center animate-slide-up">
                {/* Logo */}
                <div className="flex items-center gap-3 justify-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                </div>

                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying your email...</h2>
                        <p className="text-gray-500">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <SuccessIllustration className="w-40 h-40 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email verified!</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <p className="text-sm text-gray-400 mb-4">Redirecting to sign in...</p>
                        <Link href="/login">
                            <Button className="w-full">Go to Sign In</Button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <ErrorIllustration className="w-40 h-40 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification failed</h2>
                        <p className="text-gray-500 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link href="/login">
                                <Button className="w-full">Go to Sign In</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="secondary" className="w-full">Register Again</Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
