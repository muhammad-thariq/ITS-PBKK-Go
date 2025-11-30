'use client';
import { useEffect, useState, use } from 'react';
import { fetchAPI, ASSET_BASE } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const calculateAvg = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
};

export default function ShowGame({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchAPI(`/games/${id}`).then(res => setGame(res.data)).catch(console.error);
  }, [id]);

  const handleReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
        await fetchAPI(`/games/${id}/reviews`, { 
            method: 'POST', 
            body: JSON.stringify({ rating, body: formData.get('body') }) 
        });
        window.location.reload();
    } catch (err: any) { alert(err.message); }
  };

  if (!game) return <div className="text-white text-center mt-20">Loading...</div>;
  const avg = calculateAvg(game.reviews);

  return (
    <div className="max-w-7xl mx-auto px-8 pb-18">
      <div className="flex flex-row my-9 items-center justify-between px-6">
        <h2 className="text-white text-3xl font-semibold">{game.title}</h2>
        <Link href="/"><button className="bg-white px-10 py-2 rounded-md font-semibold hover:bg-black hover:text-white hover:outline-none hover:ring-2 hover:ring-white hover:ring-offset-2 transition ease-in-out duration-150 w-full md:w-auto text-center">← Back</button></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
        <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
            {game.cover ? <img src={`${ASSET_BASE}/${game.cover}`} className="w-full h-full object-cover" /> : <span className="text-gray-400">No Image</span>}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
             <h3 className="text-lg font-semibold mb-4">Details</h3>
             <p className="mb-2"><strong>Genre:</strong> {game.genre}</p>
             <p className="mb-4"><strong>Description:</strong> {game.description}</p>
             <div className="mb-4">
                <p className="font-semibold">Average Rating: {avg.toFixed(1)}/10</p>
                <div className="h-2 w-full bg-gray-200 rounded-md overflow-hidden mt-1">
                    <div className="h-full bg-black" style={{ width: `${avg * 10}%` }}></div>
                </div>
             </div>
        </div>
      </div>

      <div className="px-6 mt-9">
        <h2 className="text-white text-2xl font-semibold mb-4">Reviews</h2>
        <div className="bg-white rounded-lg p-6 mb-6">
            <form onSubmit={handleReview} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold">Rating: {rating}/10</label>
                    <div className="flex gap-2 mt-2">
                        {[...Array(10)].map((_, i) => (
                            <button type="button" key={i} onClick={() => setRating(i+1)} className={`w-8 h-8 border ${i+1 <= rating ? 'bg-black text-white' : 'bg-white'}`}>{i+1}</button>
                        ))}
                    </div>
                </div>
                <textarea name="body" placeholder="Your review..." className="w-full border p-2 rounded"></textarea>
                <button className="bg-black text-white px-4 py-2 rounded">Submit Review</button>
            </form>
        </div>

        <div className="space-y-4">
            {game.reviews?.map((r: any) => (
                <div key={r.id} className="bg-white p-4 rounded shadow flex justify-between">
                    <div>
                        <p className="font-bold">{r.user?.name || 'User'}</p>
                        <p>{r.body}</p>
                    </div>
                    <span className="font-bold text-lg">{r.rating}/10</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}