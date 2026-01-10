'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { StudentIllustration } from '@/components/ui/Illustrations';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setAlert(null);

        try {
            await authAPI.login(formData.email, formData.password);
            setAlert({ type: 'success', message: 'Welcome back! Redirecting...' });
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Unable to sign in. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-purple flex items-center justify-center p-4">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left - Illustration */}
                <div className="hidden lg:flex flex-col items-center justify-center animate-fade-in">
                    <StudentIllustration className="w-80 h-80" />
                    <div className="text-center mt-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Student Portal</h2>
                        <p className="text-gray-500">Access your courses, grades, and more</p>
                    </div>
                </div>

                {/* Right - Login Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="card-white p-8 animate-slide-up">
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

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back!</h2>
                            <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                icon={Mail}
                                placeholder="you@college.edu"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                autoComplete="email"
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                icon={Lock}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                autoComplete="current-password"
                            />

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button type="submit" loading={loading} className="w-full mt-2">
                                Sign In
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-500 text-sm">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-violet-600 hover:text-violet-700 font-medium">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
