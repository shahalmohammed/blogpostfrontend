import { publicApi } from '@/lib/api';
import type { Paginated, Post } from '@/lib/types';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;              
  const page = Number(sp?.page ?? 1);
  const q = sp?.q ?? '';

  const r = await publicApi<Paginated<Post>>(
    `/posts?page=${page}&limit=6${q ? `&q=${encodeURIComponent(q)}` : ''}`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          {q && (
            <p className="text-gray-600 mt-1">
              Search results for "{q}" ({r.meta.total} found)
            </p>
          )}
        </div>
        <Link 
          href="/posts/create" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          New Post
        </Link>
      </div>

      {/* Search */}
      <form action="/" className="mb-8">
        <div className="flex gap-2">
          <input 
            name="q" 
            defaultValue={q} 
            placeholder="Search posts..." 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            type="submit"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Search
          </button>
        </div>
        {q && (
          <Link 
            href="/" 
            className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear search
          </Link>
        )}
      </form>

      {/* Posts */}
      {r.data.length > 0 ? (
        <>
          <div className="space-y-6 mb-8">
            {r.data.map((p) => {
              const author = typeof p.author === 'string' ? null : p.author;
              const date = new Date(p.createdAt).toLocaleDateString();
              const preview = p.content.replace(/<[^>]*>?/gm, '').slice(0, 150);
              
              return (
                <article 
                  key={p._id} 
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{author?.name ?? 'Unknown'}</span>
                      <span>•</span>
                      <span>{date}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    <Link href={`/posts/${p._id}`}>
                      {p.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {preview}{p.content.length > 150 ? '...' : ''}
                  </p>

                  <Link 
                    href={`/posts/${p._id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read more →
                  </Link>
                </article>
              );
            })}
          </div>

          <Pagination page={r.meta.page} pages={r.meta.pages} />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {q ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {q ? 'Try a different search term' : 'Create your first post to get started'}
          </p>
          {q ? (
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              View all posts
            </Link>
          ) : (
            <Link 
              href="/posts/create" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Post
            </Link>
          )}
        </div>
      )}
    </div>
  );
}