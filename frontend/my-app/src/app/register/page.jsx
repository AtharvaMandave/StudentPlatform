'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Check, GraduationCap, Shield, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();

        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      await authAPI.register(formData);
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

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: '', color: '' };

    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 66, label: 'Medium', color: 'bg-yellow-500' };
    return { score: 100, label: 'Strong', color: 'bg-white' };
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white overflow-hidden relative font-sans">
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Registration Successful</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Welcome aboard! You can now sign in to your account.
              {/* We've sent a verification link to <span className="text-white font-medium">{formData.email}</span>. */}
            </p>
            <a href="/login">
              <button className="w-full px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all">
                Go to Sign In
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-hidden relative font-sans">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {alert && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-xl ${alert.type === 'success'
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{alert.message}</span>
            <button onClick={() => setAlert(null)} className="ml-4 hover:opacity-70 transition-opacity">×</button>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-20 items-center">
          {/* Left - Branding */}
          <div className="hidden lg:block space-y-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight">StudentPortal</span>
            </div>

            <div className="space-y-6">
              <h2 className="text-5xl font-bold leading-tight tracking-tight">
                Join a community
                <br />
                <span className="text-gray-500">defined by growth.</span>
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-md">
                Create your account and start your journey towards academic excellence today.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                'Personalized learning roadmaps',
                'Connect with ambitious peers',
                'Track progress effortlessly'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-400 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Register Form */}
          <div className="w-full max-w-[420px] mx-auto">
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-8 shadow-2xl">

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${s < step ? "bg-white text-black" :
                        s === step ? "bg-white text-black ring-2 ring-white/20 ring-offset-2 ring-offset-[#121217]" :
                          "bg-white/10 text-gray-500"
                      }`}>
                      {s < step ? <Check className="w-3 h-3" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${s < step ? "bg-white" : "bg-white/10"
                        }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1 text-white">
                  {step === 1 && "Personal details"}
                  {step === 2 && "Secure your account"}
                  {step === 3 && "Final step"}
                </h2>
                <p className="text-gray-400 text-xs">
                  {step === 1 && "Start by telling us about yourself"}
                  {step === 2 && "Choose a strong password"}
                  {step === 3 && "Select your role to finish up"}
                </p>
              </div>

              <div>
                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.name ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:ring-white/20'
                          }`}
                      />
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@college.edu"
                        className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:ring-white/20'
                          }`}
                      />
                      {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                    </div>

                    <button onClick={nextStep} className="w-full mt-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:ring-white/20'
                            }`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {formData.password && (
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                            <span>Strength</span>
                            <span className={getPasswordStrength().color.replace('bg-', 'text-')}>{getPasswordStrength().label}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${getPasswordStrength().color} transition-all duration-300`} style={{ width: `${getPasswordStrength().score}%` }} />
                          </div>
                        </div>
                      )}

                      {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Confirm Password</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:ring-white/20'
                          }`}
                      />
                      {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button onClick={prevStep} className="flex-1 px-6 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-white rounded-lg font-medium transition-all">
                        Back
                      </button>
                      <button onClick={nextStep} className="flex-1 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all">
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">I am a</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                          className={`p-4 rounded-xl border transition-all text-center ${formData.role === 'student' ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          <GraduationCap className={`w-5 h-5 mx-auto mb-2 ${formData.role === 'student' ? 'text-black' : 'text-gray-400'}`} />
                          <span className="text-xs font-medium">Student</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                          className={`p-4 rounded-xl border transition-all text-center ${formData.role === 'admin' ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          <Shield className={`w-5 h-5 mx-auto mb-2 ${formData.role === 'admin' ? 'text-black' : 'text-gray-400'}`} />
                          <span className="text-xs font-medium">Admin</span>
                        </button>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.acceptTerms ? 'bg-white border-white' : 'border-white/30'
                          }`}>
                          {formData.acceptTerms && <Check className="w-3 h-3 text-black" />}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        I agree to the <a href="#" className="text-white hover:underline">Terms</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                    {errors.acceptTerms && <p className="text-xs text-red-400">{errors.acceptTerms}</p>}

                    <div className="flex gap-3 mt-2">
                      <button onClick={prevStep} className="flex-1 px-6 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-white rounded-lg font-medium transition-all">
                        Back
                      </button>
                      <button onClick={handleSubmit} disabled={loading} className="flex-1 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-500 text-xs">
                  Already have an account?{' '}
                  <a href="/login" className="text-white hover:underline font-medium transition-colors">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}