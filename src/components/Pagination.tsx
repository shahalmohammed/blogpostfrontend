'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ page, pages }: { page: number; pages: number }) {
  const router = useRouter();
  const params = useSearchParams();

  const go = (p: number) => {
    const q = new URLSearchParams(params.toString());
    q.set('page', String(p));
    router.push(`/?${q.toString()}`);
  };

  if (pages <= 1) return null;

  return (
    <div className="flex gap-2 items-center justify-center my-6">
      <button onClick={() => go(Math.max(1, page - 1))} className="px-3 py-1 border rounded">Prev</button>
      <span>Page {page} / {pages}</span>
      <button onClick={() => go(Math.min(pages, page + 1))} className="px-3 py-1 border rounded">Next</button>
    </div>
  );
}
