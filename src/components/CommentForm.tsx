'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function CommentForm({ postId, onAdded }: { postId: string; onAdded?: () => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await api(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
    setContent('');
    onAdded?.();
  };

  return (
    <form onSubmit={submit} className="mt-4 flex gap-2">
      <input className="border rounded px-3 py-2 flex-1" value={content} onChange={e=>setContent(e.target.value)} placeholder="Add a comment..." />
      <button className="border rounded px-4">Post</button>
    </form>
  );
}
