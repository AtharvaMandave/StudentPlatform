'use client';
import Link from "next/link";
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, BookOpen, Users, TrendingUp, GraduationCap,
  CheckCircle2, Sparkles, Star, Clock, Award, Globe,
  BarChart3, MessageCircle, FileText, Brain, HelpCircle,
  PenTool, Moon, Zap, Handshake
} from 'lucide-react';

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 60; // Reduced for cleaner look

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, // Slower movement
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.2 + 0.5
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

  const features = [
    {
      icon: Brain,
      title: "Roadmap-Driven Learning",
      description: "Structured roadmaps for real outcomes. Follow clear paths for Placements, DSA, Higher Education, and Competitive Exams.",
      color: "255, 255, 255" // White
    },
    {
      icon: Handshake,
      title: "Student Connect",
      description: "Don’t study alone. Find students with the same goal, create shared plans, and stay accountable without pressure.",
      color: "255, 255, 255"
    },
    {
      icon: BookOpen,
      title: "Notes & Study Material Hub",
      description: "Access curated handwritten notes, subject-wise organization, and community-contributed resources.",
      color: "255, 255, 255"
    },
    {
      icon: HelpCircle,
      title: "Public Doubt Solving",
      description: "Ask once, learn together. Get answers from peers, view similar questions, and build knowledge.",
      color: "255, 255, 255"
    },
    {
      icon: PenTool,
      title: "Blogs & Experience Sharing",
      description: "Read interview experiences, document learning journeys, and get guidance from seniors.",
      color: "255, 255, 255"
    },
    {
      icon: BarChart3,
      title: "Progress Dashboard",
      description: "See your growth clearly with roadmap completion, coding streaks, and skills overview.",
      color: "255, 255, 255"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-gray-100 overflow-hidden relative font-sans">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <StudentPortalLogo />
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  Sign in
                </button>
              </Link>
              <button className="px-5 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-8 text-white">
            Career clarity,
            <br />
            <span className="text-gray-500">simplified.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            A modern platform built for students who want direction, discipline, and growth — not confusion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="group px-8 py-3.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2">
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="px-8 py-3.5 border border-white/10 rounded-lg font-medium hover:bg-white/5 text-gray-300 transition-all">
              Find Your Study Partner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto pt-8 border-t border-white/5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-400">Connect with students who share the same goal</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-400">Follow structured roadmaps (DSA, Exams)</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-400">Access quality handwritten notes & resources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Impact Stats */}
      <section className="relative z-10 py-20 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "50K+", label: "Students" },
              { num: "15+", label: "Universities" },
              { num: "98%", label: "Satisfaction" },
              { num: "24/7", label: "Community Support" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">{stat.num}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need To Succeed</h2>
            <p className="text-gray-400 text-lg">Powerful features built for modern college students</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl border border-white/10 bg-[#121217] hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 text-white">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to take control of your academic journey?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Join thousands of students who stopped guessing and started progressing — together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group px-8 py-3.5 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2">
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="px-8 py-3.5 border border-white/10 rounded-lg font-medium hover:bg-white/5 text-gray-300 transition-all">
              Find Your Study Partner
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 bg-[#09090B]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-start gap-2">
            <StudentPortalLogo />
            <p className="text-sm text-gray-500 max-w-md mt-2">
              A goal-driven platform where students learn smarter, connect meaningfully, and grow consistently.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StudentPortalLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-black" />
      </div>
      <span className="text-lg font-bold text-white tracking-tight">
        StudentPortal
      </span>
    </div>
  );
}
