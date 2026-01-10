'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Send, Loader2, MoreVertical, Flame, Target,
    MessageSquare, Trash2, Flag
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

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

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        fetchPartnerInfo();
        // Mark as read when opening chat
        connectAPI.markAsRead(connectionId).catch(() => { });
    }, [connectionId]);

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

        // Optimistic update
        const tempMessage = {
            _id: Date.now().toString(),
            content,
            senderId: { _id: 'me' },
            type: 'TEXT',
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const { data } = await connectAPI.sendMessage(connectionId, content);
            // Replace optimistic with real message
            setMessages(prev => prev.map(m =>
                m._id === tempMessage._id ? data : m
            ));
        } catch (error) {
            // Remove optimistic message on error
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
        if (!partner || !confirm('Are you sure you want to remove this partner?')) return;

        try {
            await connectAPI.removePartner(partner.partnerId);
            router.push('/connect/partners');
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to remove partner',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/connect/partners" className="p-2 rounded-lg hover:bg-gray-100">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>

                        {partner && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                    {partner.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h1 className="font-semibold text-gray-800">{partner.name}</h1>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {partner.primaryGoal}
                                        {partner.progressStats?.currentStreak > 0 && (
                                            <span className="flex items-center gap-0.5 text-orange-500">
                                                <Flame className="w-3 h-3" />
                                                {partner.progressStats.currentStreak}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {showOptions && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowOptions(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                    <button
                                        onClick={() => {
                                            setShowOptions(false);
                                            // View progress
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Target className="w-4 h-4" />
                                        View Progress
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowOptions(false);
                                            handleRemovePartner();
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove Partner
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-violet-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Start the conversation</h3>
                        <p className="text-gray-500 text-sm">
                            Say hi to your study partner!
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwn={message.senderId?._id === 'me' || message.senderId?.toString() === 'me'}
                                showAvatar={
                                    index === 0 ||
                                    messages[index - 1]?.senderId?._id !== message.senderId?._id
                                }
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                        maxLength={1000}
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="h-12 w-12 p-0 flex items-center justify-center"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

function MessageBubble({ message, isOwn, showAvatar }) {
    const isSystem = message.type === 'SYSTEM';

    if (isSystem) {
        return (
            <div className="text-center py-2">
                <p className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1 inline-block">
                    {message.content}
                </p>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-end gap-2",
            isOwn ? "flex-row-reverse" : "flex-row"
        )}>
            {showAvatar && !isOwn ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {message.senderId?.name?.charAt(0) || 'U'}
                </div>
            ) : (
                <div className="w-8 flex-shrink-0" />
            )}

            <div className={cn(
                "max-w-[70%] px-4 py-2 rounded-2xl",
                isOwn
                    ? "bg-violet-500 text-white rounded-br-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
            )}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p className={cn(
                    "text-xs mt-1",
                    isOwn ? "text-violet-200" : "text-gray-400"
                )}>
                    {formatTime(message.createdAt)}
                </p>
            </div>
        </div>
    );
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
