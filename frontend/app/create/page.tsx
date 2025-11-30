'use client';
import { useState } from 'react';
import { fetchAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateGame() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else { setPreview(null); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await fetchAPI('/games', { method: 'POST', body: formData });
      router.push('/');
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-8">
      <div className="flex flex-col md:flex-row my-9 items-center justify-between px-6">
        <h2 className="text-white text-3xl font-semibold">Create Game</h2>
        <Link href="/"><button className="bg-white px-6 py-2 rounded-md font-semibold">← Back</button></Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
            {preview ? <img src={preview} className="w-full h-full object-cover" /> : <span className="text-gray-400">No Image</span>}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" placeholder="Title" required className="w-full border border-black p-2 rounded" />
                <div className="grid grid-cols-2 gap-4">
                    <input name="genre" placeholder="Genre" className="w-full border border-black p-2 rounded" />
                    <input name="release_year" type="number" placeholder="Year" className="w-full border border-black p-2 rounded" />
                </div>
                <textarea name="description" placeholder="Description" rows={4} className="w-full border border-black p-2 rounded"></textarea>
                <input onChange={handleFileChange} name="cover" type="file" accept="image/*" className="w-full border border-black p-2 rounded" />
                <button type="submit" className="bg-black text-white px-6 py-2 rounded font-semibold w-full">Create Game</button>
            </form>
        </div>
      </div>
    </div>
  );
}