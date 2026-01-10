'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Check, GraduationCap, Shield } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import PasswordStrength from '@/components/ui/PasswordStrength';
import { RegisterIllustration, SuccessIllustration } from '@/components/ui/Illustrations';
import { authAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        acceptTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep = (currentStep) => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!formData.name || formData.name.length < 2) newErrors.name = 'Please enter your full name';
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        }

        if (currentStep === 2) {
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
            else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password = 'Include uppercase, lowercase, and a number';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        if (currentStep === 3) {
            if (!formData.acceptTerms) newErrors.acceptTerms = 'Please accept the terms to continue';
        }

        return newErrors;
    };

    const nextStep = () => {
        const newErrors = validateStep(step);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateStep(3);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setAlert(null);

        try {
            await authAPI.register(formData.name, formData.email, formData.password, formData.role);
            setSuccess(true);
        } catch (error) {
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Registration failed. Please try again.',
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Check your email!</h2>
                    <p className="text-gray-500 mb-6">
                        We've sent a verification link to <span className="text-violet-600 font-medium">{formData.email}</span>.
                        Click the link to activate your account.
                    </p>
                    <Link href="/login">
                        <Button className="w-full">Go to Sign In</Button>
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

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left - Illustration */}
                <div className="hidden lg:flex flex-col items-center justify-center animate-fade-in">
                    <RegisterIllustration className="w-80 h-80" />
                    <div className="text-center mt-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Our Community</h2>
                        <p className="text-gray-500">Create your account and start learning today</p>
                    </div>
                </div>

                {/* Right - Register Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="card-white p-8 animate-slide-up">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Student Portal</h1>
                                <p className="text-sm text-gray-500">College Platform</p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center gap-2 mb-6">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex-1 flex items-center">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                        s < step ? "bg-violet-500 text-white" :
                                            s === step ? "bg-violet-500 text-white shadow-lg shadow-violet-200" :
                                                "bg-gray-100 text-gray-400"
                                    )}>
                                        {s < step ? <Check className="w-4 h-4" /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div className={cn(
                                            "flex-1 h-1 mx-2 rounded-full transition-all",
                                            s < step ? "bg-violet-500" : "bg-gray-100"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">
                                {step === 1 && "Personal Information"}
                                {step === 2 && "Create Password"}
                                {step === 3 && "Almost Done!"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {step === 1 && "Tell us about yourself"}
                                {step === 2 && "Choose a secure password"}
                                {step === 3 && "Select your role and accept terms"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Step 1 */}
                            {step === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        name="name"
                                        icon={User}
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        icon={Mail}
                                        placeholder="you@college.edu"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={errors.email}
                                    />
                                    <Button type="button" onClick={nextStep} className="w-full mt-2">
                                        Continue
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <Input
                                            label="Password"
                                            type="password"
                                            name="password"
                                            icon={Lock}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            error={errors.password}
                                        />
                                        <PasswordStrength password={formData.password} />
                                    </div>
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        name="confirmPassword"
                                        icon={Lock}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={errors.confirmPassword}
                                    />
                                    <div className="flex gap-3 mt-2">
                                        <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </Button>
                                        <Button type="button" onClick={nextStep} className="flex-1">
                                            Continue
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            I am a
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <RoleCard
                                                icon={GraduationCap}
                                                label="Student"
                                                selected={formData.role === 'student'}
                                                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                                            />
                                            <RoleCard
                                                icon={Shield}
                                                label="Admin"
                                                selected={formData.role === 'admin'}
                                                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="relative mt-0.5">
                                            <input
                                                type="checkbox"
                                                name="acceptTerms"
                                                checked={formData.acceptTerms}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                formData.acceptTerms
                                                    ? "bg-violet-500 border-violet-500"
                                                    : "border-gray-300 group-hover:border-gray-400"
                                            )}>
                                                {formData.acceptTerms && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            I agree to the{' '}
                                            <Link href="/terms" className="text-violet-600 hover:underline">Terms of Service</Link>
                                            {' '}and{' '}
                                            <Link href="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>
                                        </span>
                                    </label>
                                    {errors.acceptTerms && (
                                        <p className="text-sm text-red-500">{errors.acceptTerms}</p>
                                    )}

                                    <div className="flex gap-3 mt-2">
                                        <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </Button>
                                        <Button type="submit" loading={loading} className="flex-1">
                                            Create Account
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-gray-500 text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="text-violet-600 hover:text-violet-700 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoleCard({ icon: Icon, label, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "p-4 rounded-xl border-2 transition-all text-center",
                selected
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            )}
        >
            <Icon className={cn(
                "w-6 h-6 mx-auto mb-2 transition-colors",
                selected ? "text-violet-600" : "text-gray-400"
            )} />
            <span className={cn(
                "text-sm font-medium transition-colors",
                selected ? "text-violet-700" : "text-gray-600"
            )}>
                {label}
            </span>
        </button>
    );
}
