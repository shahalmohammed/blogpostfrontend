'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';

export default function PostActions({
    postId,
    authorId
}: {
    postId: string;
    authorId: string;
}) {
    const { user } = useAuth();
    const router = useRouter();

    const canManage =
        !!user &&
        (user.role === 'admin' ||
            String(user._id || user.id) === String(authorId));

    if (!canManage) return null;

    const remove = async () => {
        const result = await Swal.fire({
            title: 'Delete Post?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await api(`/posts/${postId}`, { method: 'DELETE' });

                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Post has been deleted successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                if (user?.role === 'admin') router.push('/admin/posts');
                else router.push('/dashboard');
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete the post.',
                    icon: 'error'
                });
            }
        }
    };

    return (
        <div className="flex items-center gap-3">
            <Link
                href={`/posts/${postId}/edit`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
                Edit
            </Link>
            <button
                onClick={remove}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Delete
            </button>
        </div>
    );
}