'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Paginated, User } from '@/lib/types';
import Swal from 'sweetalert2';

export default function UsersAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({ page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'role'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    async function load(p = 1) {
        setLoading(true);
        try {
            const r = await api<Paginated<User>>(`/users?page=${p}&limit=10`);
            setUsers(r.data);
            setMeta({ page: r.meta.page, pages: r.meta.pages });
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const setRole = async (id: string, currentRole: string, name: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        const result = await Swal.fire({
            title: `Change User Role?`,
            text: `Are you sure you want to make ${name} ${newRole === 'admin' ? 'an admin' : 'a regular user'}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, make ${newRole}`,
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await api(`/users/${id}`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
                await load(meta.page);

                await Swal.fire({
                    title: 'Updated!',
                    text: `${name} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update user role.',
                    icon: 'error'
                });
            }
        }
    };

    const remove = async (id: string, name: string) => {
        const result = await Swal.fire({
            title: 'Delete User?',
            text: `Are you sure you want to delete ${name}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete user!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await api(`/users/${id}`, { method: 'DELETE' });
                await load(meta.page);

                await Swal.fire({
                    title: 'Deleted!',
                    text: `${name} has been deleted.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete user.',
                    icon: 'error'
                });
            }
        }
    };

    // Filter and sort users
    const filteredAndSortedUsers = users
        .filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = a[sortBy].toLowerCase();
            const bValue = b[sortBy].toLowerCase();

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    const handleSort = (column: 'name' | 'email' | 'role') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
                <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>

            {/* Search and Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {users.length} users total
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {users.filter(u => u.role === 'admin').length} admins
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                                    >
                                        Name
                                        <svg className={`w-4 h-4 ml-1 ${sortBy === 'name' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortBy === 'name' && sortOrder === 'desc' ? "M19 14l-7-7m0 0l-7 7m7-7v18" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
                                        </svg>
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort('email')}
                                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                                    >
                                        Email
                                        <svg className={`w-4 h-4 ml-1 ${sortBy === 'email' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortBy === 'email' && sortOrder === 'desc' ? "M19 14l-7-7m0 0l-7 7m7-7v18" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
                                        </svg>
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleSort('role')}
                                        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mx-auto"
                                    >
                                        Role
                                        <svg className={`w-4 h-4 ml-1 ${sortBy === 'role' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortBy === 'role' && sortOrder === 'desc' ? "M19 14l-7-7m0 0l-7 7m7-7v18" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
                                        </svg>
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedUsers.map(user => {
                                const id = String(user.id || user._id);
                                return (
                                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-white font-medium text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => setRole(id, user.role, user.name)}
                                                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                    </svg>
                                                    Make {user.role === 'admin' ? 'User' : 'Admin'}
                                                </button>
                                                <button
                                                    onClick={() => remove(id, user.name)}
                                                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredAndSortedUsers.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination - only show if more than 1 page */}
            {meta.pages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                    <button
                        onClick={() => load(Math.max(1, meta.page - 1))}
                        disabled={meta.page <= 1}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>

                    <span className="text-sm text-gray-700">
                        Page {meta.page} of {meta.pages}
                    </span>

                    <button
                        onClick={() => load(Math.min(meta.pages, meta.page + 1))}
                        disabled={meta.page >= meta.pages}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}