'use client';

import { useState } from 'react';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';

export default function CommentsSection({ postId }: { postId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <CommentForm postId={postId} onAdded={() => setRefreshKey(k => k + 1)} />
      <CommentList key={refreshKey} postId={postId} />
    </>
  );
}
