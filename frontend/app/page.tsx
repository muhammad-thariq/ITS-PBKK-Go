'use client';
import { useEffect, useState } from 'react';
import { fetchAPI, ASSET_BASE } from '@/utils/api';
import Link from 'next/link';

export default function Home() {
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    fetchAPI('/games').then(res => setGames(res.data || [])).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row my-9 items-start md:items-center justify-between px-6">
        <h2 className="text-white text-3xl font-semibold mb-4 md:mb-0">List of Games</h2>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Link href="/create" className="w-full md:w-auto">
            <button className="bg-white px-10 py-2 rounded-md font-semibold hover:bg-black hover:text-white hover:outline-none hover:ring-2 hover:ring-white hover:ring-offset-2 transition ease-in-out duration-150 w-full md:w-auto text-center">
              + Add Game
            </button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-3 grid-cols-1 mt-4 gap-6 px-6 pb-12">  
        {games.map((game) => (
          <div key={game.id}>
             {/* Cover Image */}
             <div className="rounded-md w-[390px] h-[390px] overflow-hidden">
                <img 
                  src={game.cover ? `${ASSET_BASE}/${game.cover}` : ''} 
                  className="w-full h-full object-cover" 
                  alt={game.title} 
                />
             </div>

            <div className="my-2">
              <p className="text-xl text-white font-semibold">
                {game.title}
              </p>
              <p className="text-gray-400">
                {game.genre ? `${game.genre} • ` : ''}{game.release_year ?? '—'}
              </p>
              <Link href={`/games/${game.id}`}>
                <button className="bg-white px-10 py-2 w-full rounded-md font-semibold my-4 hover:bg-black hover:text-white hover:outline-none hover:ring-2 hover:ring-white hover:ring-offset-2 transition">
                  + Add Reviews
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}