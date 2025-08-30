'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Swal from 'sweetalert2';

export default function ProfilePage() {
    const { user, refreshMe } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        setName(user?.name || '');
        setEmail(user?.email || '');
    }, [user]);

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

    const update = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            Swal.fire({
                title: 'Validation Error!',
                text: 'Name and email are required.',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
            });
            return;
        }

        setIsUpdating(true);
        try {
            await api('/auth/me', {
                method: 'PUT',
                body: JSON.stringify({ name: name.trim(), email: email.trim() })
            });
            await refreshMe();

            Swal.fire({
                title: 'Success!',
                text: 'Profile updated successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                    popup: 'rounded-2xl'
                }
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update profile. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formEl = e.currentTarget;

        const form = new FormData(formEl);
        const currentPassword = (form.get('current') as string)?.trim();
        const newPassword = (form.get('next') as string)?.trim();
        const confirmPassword = (form.get('confirm') as string)?.trim();

        const fail = (title: string, text: string) =>
            Swal.fire({
                title,
                text,
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
            });

        if (!currentPassword || !newPassword || !confirmPassword) {
            await fail('Validation Error!', 'All password fields are required.');
            return;
        }
        if (newPassword !== confirmPassword) {
            await fail('Password Mismatch!', 'New password and confirm password do not match.');
            return;
        }
        if (newPassword.length < 6) {
            await fail('Weak Password!', 'Password must be at least 6 characters long.');
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await api('/auth/me/password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            // if (res?.success === false) {
            //     throw new Error(res?.message || 'Failed to change password.');
            // }

            await Swal.fire({
                title: 'Success!',
                text: 'Password changed successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'rounded-2xl' }
            });

            formEl.reset();
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        } catch (err: unknown) {
            console.error('Password change error:', err);

            let message = 'Failed to change password. Please check your current password.';
            if (typeof err === 'object' && err && 'message' in err && typeof (err as any).message === 'string') {
                message = (err as any).message;
            }

            await Swal.fire({
                title: 'Error!',
                text: message,
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-xl px-6 py-3 font-semibold'
                }
            });
        } finally {
            setIsChangingPassword(false);
        }
    };


    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please login to access your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-gray-600 text-lg">Manage your account information and security</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Profile Information Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                        </div>

                        <form onSubmit={update} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                    />
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* User Info Display */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Account Status:</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-green-600 font-semibold">Active</span>
                                </div>
                            </div>
                            {user.role === 'admin' && (
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-500">Role:</span>
                                    <div className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 text-xs font-semibold rounded-lg">
                                        Administrator
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Security</h2>
                        </div>

                        <form onSubmit={changePassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="current"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="Enter current password"
                                    />
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="next"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="Enter new password"
                                    />
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="confirm"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                                        placeholder="Confirm new password"
                                    />
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Changing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Change Password</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}