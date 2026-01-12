'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Send, Loader2, MoreVertical, Flame, Target,
    MessageSquare, Trash2, Shield
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { connectAPI } from '@/lib/connectApi';
import { authAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const connectionId = params.connectionId;

    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [alert, setAlert] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        fetchPartnerInfo();
        fetchCurrentUser();
        connectAPI.markAsRead(connectionId).catch(() => { });
    }, [connectionId]);

    const fetchCurrentUser = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            const userData = response?.data?.user || response?.user;
            if (userData?._id || userData?.id) {
                setCurrentUserId(userData._id || userData.id);
            }
        } catch (error) {
            console.error('Failed to fetch current user');
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await connectAPI.getMessages(connectionId);
            const data = response?.data || response;
            setMessages(data.messages || []);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to load messages',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPartnerInfo = async () => {
        try {
            const response = await connectAPI.getPartners();
            const data = response?.data || response || [];
            const partnersList = Array.isArray(data) ? data : [];
            const currentPartner = partnersList.find(p => p.connectionId === connectionId);
            if (currentPartner) {
                setPartner(currentPartner);
            }
        } catch (error) {
            console.error('Failed to fetch partner info');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);

        const tempMessage = {
            _id: Date.now().toString(),
            content,
            senderId: { _id: currentUserId || 'temp' },
            type: 'TEXT',
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await connectAPI.sendMessage(connectionId, content);
            const sentMessage = response?.data || response;
            setMessages(prev => prev.map(m => m._id === tempMessage._id ? sentMessage : m));
        } catch (error) {
            setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send message',
            });
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleRemovePartner = async () => {
        if (!confirm('Are you sure you want to remove this partner?')) return;
        try {
            await connectAPI.removePartner(partner.partnerId);
            router.push('/connect/partners');
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to remove partner' });
        }
    };

    return (
        <DashboardLayout>
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col h-[calc(100vh-80px)]">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white dark:bg-[#09090B] border-b border-gray-200 dark:border-[#27272A] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/connect/partners" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#27272A] transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>

                        {partner && (
                            <div className="flex items-center gap-3">
                                <Avatar name={partner.name} size="md" />
                                <div>
                                    <h1 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        {partner.name}
                                        {partner.progressStats?.currentStreak > 0 && (
                                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 flex items-center gap-1">
                                                <Flame className="w-3 h-3" />
                                                {partner.progressStats.currentStreak}
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-xs text-gray-500">{partner.primaryGoal}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#27272A] text-gray-500"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showOptions && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#18181B] rounded-lg shadow-xl border border-gray-200 dark:border-[#27272A] py-1 z-20">
                                    <Link href={`/connect/plan/${connectionId}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#27272A] flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        View Study Plan
                                    </Link>
                                    <button
                                        onClick={handleRemovePartner}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove Partner
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-[#09090B]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <EmptyState
                            icon={MessageSquare}
                            title="Start communicating"
                            description={`Send a message to ${partner?.name || 'your partner'} to start planning your study session.`}
                            className="h-full flex flex-col justify-center items-center"
                        />
                    ) : (
                        messages.map((message, index) => {
                            const messageSenderId = message.senderId?._id || message.senderId;
                            const prevSenderId = messages[index - 1]?.senderId?._id || messages[index - 1]?.senderId;
                            const isOwn = currentUserId && (
                                messageSenderId === currentUserId ||
                                messageSenderId?.toString() === currentUserId?.toString()
                            );

                            // Check if sender changed to decide whether to show avatar/spacing
                            const isSequence = prevSenderId === messageSenderId;

                            return (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isOwn={isOwn || message.isOptimistic}
                                    showAvatar={!isOwn && !isSequence}
                                    isSequence={isSequence}
                                />
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-[#09090B] border-t border-gray-200 dark:border-[#27272A]">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
                        <div className="flex-1 bg-gray-100 dark:bg-[#18181B] rounded-2xl border border-transparent focus-within:border-gray-300 dark:focus-within:border-[#3F3F46] transition-colors p-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none max-h-32 resize-none"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className={cn(
                                "h-11 w-11 p-0 rounded-full flex items-center justify-center transition-all",
                                !newMessage.trim()
                                    ? "bg-gray-100 text-gray-400 dark:bg-[#27272A] dark:text-gray-500"
                                    : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:scale-105"
                            )}
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

function MessageBubble({ message, isOwn, showAvatar, isSequence }) {
    if (message.type === 'SYSTEM') {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-[#27272A] px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-end gap-2 group",
            isOwn ? "flex-row-reverse" : "flex-row",
            isSequence ? "mt-1" : "mt-4" // Add more space between different speakers
        )}>
            {!isOwn && (
                <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                        <Avatar name={message.senderId?.name} size="sm" />
                    )}
                </div>
            )}

            <div className={cn(
                "max-w-[75%] px-4 py-2.5 text-sm",
                isOwn
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-2xl rounded-tr-sm"
                    : "bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] text-gray-900 dark:text-white rounded-2xl rounded-tl-sm",
                isSequence && isOwn && "rounded-tr-2xl", // Round corners if sequence
                isSequence && !isOwn && "rounded-tl-2xl"
            )}>
                <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                <div className={cn(
                    "text-[10px] mt-1 text-right opacity-0 group-hover:opacity-100 transition-opacity",
                    isOwn ? "text-white/70 dark:text-gray-500" : "text-gray-400"
                )}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
