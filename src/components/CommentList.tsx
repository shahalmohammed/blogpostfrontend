'use client';

import { useEffect, useState } from 'react';
import { api, publicApi } from '@/lib/api';
import type { Comment, Paginated } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import Swal from 'sweetalert2';

export default function CommentList({ postId }: { postId: string }) {
    const [items, setItems] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { user } = useAuth();

    async function load(p = 1) {
        setLoading(true);
        try {
            const r = await publicApi<Paginated<Comment>>(`/posts/${postId}/comments?page=${p}&limit=10`);
            setItems(r.data);
            setPage(r.meta.page);
            setPages(r.meta.pages);
        } catch (error) {
            // Error notification for loading
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load comments. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3b82f6',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(1); }, [postId]); // eslint-disable-line

    const remove = async (id: string) => {
        const result = await Swal.fire({
            title: 'Delete Comment?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-xl px-6 py-3 font-semibold',
                cancelButton: 'rounded-xl px-6 py-3 font-semibold'
            }
        });

        if (!result.isConfirmed) return;
        
        setDeletingId(id);
        try {
            await api(`/comments/${id}`, { method: 'DELETE' });
            await load(page);
            
            // Success notification
            Swal.fire({
                title: 'Deleted!',
                text: 'Comment has been deleted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-2xl'
                }
            });
        } catch (error) {
            // Error notification
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete comment. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
            });
        } finally {
            setDeletingId(null);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'from-purple-500 to-pink-500',
            'from-blue-500 to-indigo-500',
            'from-green-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-cyan-500 to-blue-500',
            'from-rose-500 to-pink-500',
            'from-emerald-500 to-green-500',
            'from-violet-500 to-purple-500'
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    return (
        <div className="mt-12">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Comments
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold rounded-full">
                            {items.length} {items.length === 1 ? 'comment' : 'comments'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-600 font-medium">Loading comments...</span>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h4>
                        <p className="text-gray-500 text-center max-w-md">Be the first to share your thoughts on this post!</p>
                    </div>
                ) : (
                    items.map((c, index) => {
                        const a = typeof c.author === 'string' ? { name: 'Unknown', _id: '' } : c.author;
                        const canDelete = !!user && (user.role === 'admin' || user._id === (a as any)._id || user.id === (a as any)._id);
                        const isDeleting = deletingId === c._id;
                        
                        return (
                            <div 
                                key={c._id} 
                                className="group bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-200"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Avatar */}
                                    <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(a.name)} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                        <span className="text-white font-bold text-sm">
                                            {getInitials(a.name)}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                                    {a.name}
                                                </h5>
                                            </div>

                                            {/* Admin Badge */}
                                            {user && user.role === 'admin' && user._id === (a as any)._id && (
                                                <div className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 text-xs font-semibold rounded-lg flex items-center space-x-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Admin</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Comment Content */}
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {c.content}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {canDelete && (
                                            <div 
                                            className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => remove(c._id)}
                                                    disabled={isDeleting}
                                                    className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                                                >
                                                    {isDeleting ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                            <span>Deleting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                           
                                                            <span>Delete</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Enhanced Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-center mt-12 pt-8 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        <button
                            disabled={page <= 1}
                            onClick={() => load(page - 1)}
                            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Previous</span>
                        </button>

                        <div className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                            <span className="text-sm font-semibold text-gray-700">
                                Page {page} of {pages}
                            </span>
                        </div>

                        <button
                            disabled={page >= pages}
                            onClick={() => load(page + 1)}
                            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                            <span>Next</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}