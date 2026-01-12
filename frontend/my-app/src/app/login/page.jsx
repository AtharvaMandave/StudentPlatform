'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 40; // Subtle

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
      [name]: type === 'checkbox' ? checked : value
    }));
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
      // setAlert({ type: 'success', message: 'Welcome back! Redirecting...' });
      router.push('/dashboard');
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Unable to sign in. Please try again.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-hidden relative font-sans">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {alert && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-xl ${alert.type === 'success'
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium text-sm">{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-20 items-center">

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
                Your academic journey,
                <br />
                <span className="text-gray-500">amplified.</span>
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-md">
                Access your roadmaps, track your progress, and collaborate with peers—all in one place.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                'Structured roadmaps (DSA, Exams)',
                'Collaborative study plans',
                'Performance analytics'
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

          {/* Right - Login Form */}
          <div className="w-full max-w-[400px] mx-auto">
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-8 shadow-2xl">

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2 text-white">Sign in</h2>
                <p className="text-gray-400 text-sm">Welcome back to StudentPortal</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@university.edu"
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.email
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-white/10 focus:ring-white/20 focus:border-white/30'
                        }`}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.password
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-white/10 focus:ring-white/20 focus:border-white/30'
                        }`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-white focus:ring-0 checked:bg-white cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-4 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-gray-500 text-xs">
                  Don't have an account?{' '}
                  <a href="/register" className="text-white hover:underline font-medium transition-colors">
                    Create account
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}