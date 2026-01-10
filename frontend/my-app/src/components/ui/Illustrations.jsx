'use client';

// Playful 3D-style SVG Illustrations matching the reference design

export function StudentIllustration({ className }) {
    return (
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Background circle */}
            <circle cx="150" cy="150" r="120" fill="#EDE9FE" opacity="0.5" />

            {/* Graduation Cap */}
            <g className="animate-float">
                <polygon points="150,60 220,95 150,130 80,95" fill="#7C3AED" />
                <polygon points="150,130 220,95 220,105 150,140 80,105 80,95" fill="#6D28D9" />
                <rect x="146" y="45" width="8" height="25" fill="#A78BFA" rx="2" />
                <circle cx="150" cy="42" r="8" fill="#F59E0B" />
                <path d="M158 95 Q185 115 180 145" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="180" cy="148" r="6" fill="#F59E0B" />
            </g>

            {/* Student figure - simplified friendly style */}
            <circle cx="150" cy="175" r="30" fill="#FBBF24" /> {/* Head */}
            <ellipse cx="150" cy="240" rx="45" ry="35" fill="#7C3AED" /> {/* Body */}

            {/* Face */}
            <circle cx="140" cy="172" r="4" fill="#1F2937" /> {/* Left eye */}
            <circle cx="160" cy="172" r="4" fill="#1F2937" /> {/* Right eye */}
            <path d="M143 182 Q150 190 157 182" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" /> {/* Smile */}

            {/* Books */}
            <g transform="translate(200, 180)">
                <rect x="0" y="0" width="40" height="12" rx="2" fill="#7C3AED" />
                <rect x="3" y="12" width="34" height="10" rx="2" fill="#A78BFA" />
                <rect x="6" y="22" width="28" height="10" rx="2" fill="#C4B5FD" />
            </g>

            {/* Floating elements */}
            <circle cx="70" cy="120" r="8" fill="#A78BFA" opacity="0.6" />
            <circle cx="230" cy="100" r="6" fill="#F59E0B" opacity="0.6" />
            <rect x="60" y="200" width="15" height="15" rx="3" fill="#10B981" opacity="0.4" transform="rotate(15 67 207)" />

            {/* Stars */}
            <path d="M250 180 L253 188 L262 188 L255 193 L258 201 L250 196 L242 201 L245 193 L238 188 L247 188 Z" fill="#FBBF24" opacity="0.8" />
        </svg>
    );
}

export function RegisterIllustration({ className }) {
    return (
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Background */}
            <circle cx="150" cy="150" r="120" fill="#EDE9FE" opacity="0.4" />

            {/* Clipboard/Form */}
            <rect x="90" y="70" width="120" height="160" rx="12" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
            <rect x="105" y="90" width="90" height="10" rx="5" fill="#7C3AED" opacity="0.3" />
            <rect x="105" y="110" width="70" height="8" rx="4" fill="#E5E7EB" />
            <rect x="105" y="128" width="80" height="8" rx="4" fill="#E5E7EB" />
            <rect x="105" y="146" width="60" height="8" rx="4" fill="#E5E7EB" />

            {/* Checkboxes */}
            <rect x="105" y="170" width="14" height="14" rx="3" fill="#7C3AED" />
            <path d="M108 177 L112 181 L118 173" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="125" y="172" width="50" height="8" rx="4" fill="#E5E7EB" />

            <rect x="105" y="190" width="14" height="14" rx="3" fill="#10B981" />
            <path d="M108 197 L112 201 L118 193" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="125" y="192" width="45" height="8" rx="4" fill="#E5E7EB" />

            {/* Pencil */}
            <g transform="translate(210, 100) rotate(30)">
                <rect x="0" y="0" width="80" height="12" rx="2" fill="#FBBF24" />
                <polygon points="80,0 95,6 80,12" fill="#1F2937" />
                <rect x="0" y="0" width="15" height="12" rx="2" fill="#F59E0B" />
            </g>

            {/* Floating elements */}
            <circle cx="60" cy="100" r="15" fill="#A78BFA" opacity="0.3" />
            <circle cx="250" cy="200" r="12" fill="#10B981" opacity="0.3" />

            {/* Star decorations */}
            <path d="M70 180 L72 186 L78 186 L73 190 L75 196 L70 192 L65 196 L67 190 L62 186 L68 186 Z" fill="#FBBF24" opacity="0.7" />
            <circle cx="240" cy="90" r="6" fill="#7C3AED" opacity="0.4" />
        </svg>
    );
}

export function SuccessIllustration({ className }) {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Background circles */}
            <circle cx="100" cy="100" r="80" fill="#D1FAE5" opacity="0.5" />
            <circle cx="100" cy="100" r="60" fill="#A7F3D0" opacity="0.5" />

            {/* Main circle */}
            <circle cx="100" cy="100" r="45" fill="#10B981" />

            {/* Checkmark */}
            <path
                d="M75 100 L92 117 L125 84"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Confetti/celebration elements */}
            <circle cx="45" cy="55" r="6" fill="#7C3AED" />
            <circle cx="155" cy="45" r="5" fill="#F59E0B" />
            <circle cx="35" cy="130" r="4" fill="#3B82F6" />
            <circle cx="165" cy="120" r="6" fill="#EC4899" />

            <rect x="55" y="35" width="10" height="10" rx="2" fill="#FBBF24" transform="rotate(20 60 40)" />
            <rect x="145" y="150" width="8" height="8" rx="2" fill="#7C3AED" transform="rotate(-15 149 154)" />
        </svg>
    );
}

export function ErrorIllustration({ className }) {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Background circles */}
            <circle cx="100" cy="100" r="80" fill="#FEE2E2" opacity="0.5" />
            <circle cx="100" cy="100" r="60" fill="#FECACA" opacity="0.5" />

            {/* Main circle */}
            <circle cx="100" cy="100" r="45" fill="#EF4444" />

            {/* X Mark */}
            <path d="M80 80 L120 120" stroke="white" strokeWidth="8" strokeLinecap="round" />
            <path d="M120 80 L80 120" stroke="white" strokeWidth="8" strokeLinecap="round" />
        </svg>
    );
}

export function WelcomeIllustration({ className }) {
    return (
        <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Student with laptop - 3D style */}

            {/* Laptop */}
            <rect x="120" y="140" width="160" height="90" rx="8" fill="#1F2937" />
            <rect x="128" y="148" width="144" height="74" rx="4" fill="#3B82F6" />
            <rect x="135" y="155" width="60" height="8" rx="4" fill="white" opacity="0.8" />
            <rect x="135" y="168" width="90" height="6" rx="3" fill="white" opacity="0.4" />
            <rect x="135" y="180" width="70" height="6" rx="3" fill="white" opacity="0.3" />
            <path d="M100 230 L120 230 L120 235 L280 235 L280 230 L300 230 L295 245 L105 245 Z" fill="#374151" />

            {/* Student character */}
            <g transform="translate(300, 80)">
                {/* Head */}
                <circle cx="40" cy="50" r="35" fill="#FBBF24" />
                {/* Cap */}
                <ellipse cx="40" cy="30" rx="30" ry="12" fill="#7C3AED" />
                <rect x="10" y="30" width="60" height="10" fill="#7C3AED" />
                {/* Face */}
                <circle cx="30" cy="48" r="4" fill="#1F2937" />
                <circle cx="50" cy="48" r="4" fill="#1F2937" />
                <path d="M32 60 Q40 70 48 60" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Body hint */}
                <ellipse cx="40" cy="110" rx="30" ry="25" fill="#A78BFA" />
            </g>

            {/* Backpack floating */}
            <g transform="translate(50, 100)" className="animate-float">
                <rect x="0" y="0" width="40" height="50" rx="8" fill="#7C3AED" />
                <rect x="5" y="5" width="30" height="20" rx="4" fill="#8B5CF6" />
                <rect x="8" y="55" width="10" height="15" rx="3" fill="#6D28D9" />
                <rect x="22" y="55" width="10" height="15" rx="3" fill="#6D28D9" />
            </g>

            {/* Floating elements */}
            <circle cx="320" cy="200" r="8" fill="#F59E0B" opacity="0.6" />
            <circle cx="80" cy="60" r="6" fill="#10B981" opacity="0.5" />

            {/* Graduation cap floating */}
            <g transform="translate(20, 140)" className="animate-float" style={{ animationDelay: '1s' }}>
                <polygon points="30,0 50,12 30,24 10,12" fill="#1F2937" />
                <polygon points="30,24 50,12 50,16 30,28 10,16 10,12" fill="#374151" />
                <circle cx="30" cy="0" r="5" fill="#F59E0B" />
            </g>
        </svg>
    );
}
