'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, Filter, Bookmark, ExternalLink, FileText,
    Link as LinkIcon, File, Trash2, Edit2, Tag, Eye, X, Check
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ConnectNav from '@/components/connect/ConnectNav';
import { connectAPI } from '@/lib/connectApi';
import { cn } from '@/lib/utils';

const RESOURCE_TYPES = [
    { value: 'ALL', label: 'All Types', icon: FileText },
    { value: 'LINK', label: 'Links', icon: LinkIcon },
    { value: 'GOOGLE_DOC', label: 'Google Docs', icon: FileText },
    { value: 'NOTE', label: 'Notes', icon: File },
];

const TOPICS = [
    'DSA', 'WEB_DEV', 'SYSTEM_DESIGN', 'DATABASE',
    'ALGORITHMS', 'INTERVIEW_PREP', 'THEORY', 'PRACTICE', 'OTHER'
];

export default function ResourcesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [alert, setAlert] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [showBookmarked, setShowBookmarked] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        type: 'LINK',
        title: '',
        description: '',
        url: '',
        tags: [],
        topic: 'OTHER',
        notes: ''
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        if (selectedPartner) {
            fetchResources();
        }
    }, [selectedPartner, showBookmarked]);

    useEffect(() => {
        filterResources();
    }, [resources, searchQuery, filterType]);

    const fetchPartners = async () => {
        try {
            const response = await connectAPI.getPartners();
            const data = response?.data || response || [];
            setPartners(data);
            if (data.length > 0) {
                setSelectedPartner(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async () => {
        if (!selectedPartner?.connectionId) return;

        setLoading(true);
        try {
            const response = showBookmarked
                ? await connectAPI.getBookmarkedResources(selectedPartner.connectionId)
                : await connectAPI.getResources(selectedPartner.connectionId);

            const data = response?.data || response || [];
            setResources(data);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            setAlert({ type: 'error', message: 'Failed to load resources' });
        } finally {
            setLoading(false);
        }
    };

    const filterResources = () => {
        let filtered = [...resources];

        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (filterType !== 'ALL') {
            filtered = filtered.filter(r => r.type === filterType);
        }

        setFilteredResources(filtered);
    };

    const handleAddResource = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.type) {
            setAlert({ type: 'error', message: 'Title and type are required' });
            return;
        }

        if ((formData.type === 'LINK' || formData.type === 'GOOGLE_DOC') && !formData.url) {
            setAlert({ type: 'error', message: 'URL is required for links and Google Docs' });
            return;
        }

        try {
            await connectAPI.createResource(selectedPartner.connectionId, formData);
            setAlert({ type: 'success', message: 'Resource added successfully!' });
            setShowAddModal(false);
            resetForm();
            fetchResources();
        } catch (error) {
            setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to add resource' });
        }
    };

    const handleToggleBookmark = async (resourceId) => {
        try {
            await connectAPI.toggleResourceBookmark(selectedPartner.connectionId, resourceId);
            fetchResources();
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to toggle bookmark' });
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            await connectAPI.deleteResource(selectedPartner.connectionId, resourceId);
            setAlert({ type: 'success', message: 'Resource deleted' });
            fetchResources();
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to delete resource' });
        }
    };

    const handleOpenResource = async (resource) => {
        if (resource.url) {
            await connectAPI.incrementResourceView(selectedPartner.connectionId, resource._id);
            window.open(resource.url, '_blank');
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim().toLowerCase()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const resetForm = () => {
        setFormData({
            type: 'LINK',
            title: '',
            description: '',
            url: '',
            tags: [],
            topic: 'OTHER',
            notes: ''
        });
        setTagInput('');
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'LINK': return LinkIcon;
            case 'GOOGLE_DOC': return FileText;
            case 'NOTE': return File;
            default: return FileText;
        }
    };

    if (loading && !resources.length) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-gray-500">Loading resources...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <ConnectNav />

                {alert && (
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Resource Library</h1>
                            <p className="text-gray-500">Share and organize study materials together</p>
                        </div>

                        {partners.length > 0 && (
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedPartner?.connectionId || ''}
                                    onChange={(e) => {
                                        const partner = partners.find(p => p.connectionId === e.target.value);
                                        setSelectedPartner(partner);
                                    }}
                                    className="px-4 py-2 bg-white dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                                >
                                    {partners.map(partner => (
                                        <option key={partner.connectionId} value={partner.connectionId}>
                                            {partner.name}'s Library
                                        </option>
                                    ))}
                                </select>

                                <Button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-white hover:bg-gray-200 text-black"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Resource
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search resources..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#121217] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-white/30"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {RESOURCE_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => setFilterType(type.value)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                        filterType === type.value
                                            ? "bg-white dark:bg-white text-black"
                                            : "bg-white/5 text-gray-500 hover:bg-white/10"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowBookmarked(!showBookmarked)}
                            className={cn(
                                "px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2",
                                showBookmarked
                                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                    : "bg-white/5 text-gray-500 hover:bg-white/10"
                            )}
                        >
                            <Bookmark className="w-4 h-4" />
                            Bookmarked
                        </button>
                    </div>
                </div>

                {/* Resources Grid */}
                {filteredResources.length === 0 ? (
                    <EmptyState
                        title={showBookmarked ? "No bookmarked resources" : "No resources yet"}
                        description={showBookmarked ? "Bookmark resources to find them here" : "Add study materials to share with your partner"}
                        action={() => setShowAddModal(true)}
                        actionLabel="Add Resource"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map(resource => {
                            const Icon = getResourceIcon(resource.type);
                            const isBookmarked = resource.bookmarkedBy?.includes(selectedPartner?.userId);

                            return (
                                <Card key={resource._id} className="p-4 hover:border-gray-300 dark:hover:border-white/20 transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg">
                                                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <Badge variant="default" size="xs">{resource.topic}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleBookmark(resource._id)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-all",
                                                    isBookmarked
                                                        ? "text-yellow-500 hover:bg-yellow-500/10"
                                                        : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                                                )}
                                            >
                                                <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteResource(resource._id)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {resource.title}
                                    </h3>

                                    {resource.description && (
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                            {resource.description}
                                        </p>
                                    )}

                                    {resource.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {resource.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded text-xs"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {resource.tags.length > 3 && (
                                                <span className="text-xs text-gray-400">+{resource.tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {resource.viewCount || 0}
                                            </span>
                                            <span>by {resource.uploadedBy?.name}</span>
                                        </div>

                                        {resource.url && (
                                            <button
                                                onClick={() => handleOpenResource(resource)}
                                                className="text-xs font-medium text-gray-900 dark:text-white hover:underline flex items-center gap-1"
                                            >
                                                Open
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Add Resource Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-[#121217] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#121217]">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Resource</h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddResource} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Resource Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['LINK', 'GOOGLE_DOC', 'NOTE'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, type }))}
                                                className={cn(
                                                    "p-3 rounded-lg border text-sm font-medium transition-all",
                                                    formData.type === type
                                                        ? "border-white bg-white text-black dark:bg-white dark:text-black"
                                                        : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                                                )}
                                            >
                                                {type.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., LeetCode 75 Solutions"
                                        className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-white/30"
                                        required
                                    />
                                </div>

                                {(formData.type === 'LINK' || formData.type === 'GOOGLE_DOC') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.url}
                                            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-white/30"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of this resource..."
                                        className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 min-h-[80px] resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Topic
                                    </label>
                                    <select
                                        value={formData.topic}
                                        onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                                        className="w-full px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/30"
                                    >
                                        {TOPICS.map(topic => (
                                            <option key={topic} value={topic}>{topic.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Add tags..."
                                            className="flex-1 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-white/30"
                                        />
                                        <Button type="button" onClick={addTag} variant="secondary">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-2"
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-white hover:bg-gray-200 text-black">
                                        Add Resource
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
