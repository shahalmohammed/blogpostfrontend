import { publicApi } from '@/lib/api';
import type { Post } from '@/lib/types';
import CommentsSection from './CommentsSection';
import PostActions from '@/components/PostActions';

export default async function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await publicApi<{ success: boolean; data: Post }>(`/posts/${id}`);
  const post = r.data;
  const author = typeof post.author === 'string' ? null : post.author;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>
            
            {/* Author Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {author?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {author?.name ?? 'Unknown Author'}
                </div>
                <div className="text-sm text-gray-600">
                  Published on {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Post Actions */}
          <div className="flex-shrink-0">
            <PostActions postId={post._id} authorId={author?._id || ''} />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          {/* Reading Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Content */}
            <article className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <CommentsSection postId={post._id} />
      </div>
    </div>
  );
}