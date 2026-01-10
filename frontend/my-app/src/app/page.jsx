import Link from 'next/link';
import { ArrowRight, BookOpen, Users, TrendingUp, GraduationCap, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { StudentIllustration } from '@/components/ui/Illustrations';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-light-purple">
            {/* Navigation */}
            <nav className="px-6 py-4 border-b border-violet-100 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">Student Portal</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Sign in</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="px-6 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-violet-500" />
                            Now available for all students
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-6">
                            Your complete{' '}
                            <span className="text-violet-600">student portal</span>
                            {' '}for academic success
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Access your courses, track payments, view results, and stay updated with
                            all your academic needs in one beautiful, easy-to-use platform.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Link href="/register">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                    Sign In
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span>Free to use</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span>Secure & Private</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center animate-fade-in">
                        <StudentIllustration className="w-full max-w-md" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-16 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Everything you need in one place
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our student portal provides all the tools you need to succeed in your academic journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={BookOpen}
                            title="Course Management"
                            description="Access all your enrolled courses, materials, and schedules in one organized dashboard."
                        />
                        <FeatureCard
                            icon={TrendingUp}
                            title="Track Progress"
                            description="Monitor your grades, payments, and academic progress with detailed analytics."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Stay Connected"
                            description="Get important notices, connect with instructors, and never miss an update."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="card-white p-10">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                            Ready to get started?
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Join thousands of students already using our platform to excel in their studies.
                        </p>
                        <Link href="/register">
                            <Button size="lg">
                                Create Your Account
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-violet-100 bg-white/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-sm">© 2024 Student Portal. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <Link href="/privacy" className="hover:text-violet-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-violet-600 transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-violet-600 transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }) {
    return (
        <div className="card-white p-6 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
