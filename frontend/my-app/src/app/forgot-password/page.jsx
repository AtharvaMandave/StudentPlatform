'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, GraduationCap } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { SuccessIllustration } from '@/components/ui/Illustrations';
import { authAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        setAlert(null);

        try {
            await authAPI.forgotPassword(email);
            setSuccess(true);
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send reset link. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-light-purple flex items-center justify-center p-4">
                <div className="card-white p-8 max-w-md w-full text-center animate-slide-up">
                    <SuccessIllustration className="w-40 h-40 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Check your email</h2>
                    <p className="text-gray-500 mb-6">
                        We've sent a password reset link to <span className="text-violet-600 font-medium">{email}</span>.
                        Click the link to reset your password.
                    </p>
                    <Link href="/login">
                        <Button className="w-full">Back to Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-purple flex items-center justify-center p-4">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="card-white p-8 max-w-md w-full animate-slide-up">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Student Portal</h1>
                        <p className="text-sm text-gray-500">College Platform</p>
                    </div>
                </div>

                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-violet-600 transition-colors mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                </Link>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot password?</h2>
                    <p className="text-gray-500 text-sm">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        icon={Mail}
                        placeholder="you@college.edu"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                        }}
                        error={error}
                        autoComplete="email"
                    />

                    <Button type="submit" loading={loading} className="w-full">
                        Send Reset Link
                    </Button>
                </form>
            </div>
        </div>
    );
}
