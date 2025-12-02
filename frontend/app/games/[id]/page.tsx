'use client';

import React, { useEffect, useState, use } from 'react';
import { fetchAPI, ASSET_BASE } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

const calculateAvg = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) return 0;
  return reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
};

export default function ShowGame({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [game, setGame] = useState<any>(null);
  const [rating, setRating] = useState(0);

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [isEditingGame, setIsEditingGame] = useState(false);
  const [editGameForm, setEditGameForm] = useState<{
    title: string;
    genre: string;
    release_year: string;
    description: string;
    coverFile: File | null;
  }>({
    title: '',
    genre: '',
    release_year: '',
    description: '',
    coverFile: null,
  });

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingReviewBody, setEditingReviewBody] = useState('');
  const [editingReviewRating, setEditingReviewRating] = useState(0);

  // Load game
  useEffect(() => {
    fetchAPI(`/games/${id}`)
      .then((res) => setGame(res.data))
      .catch(console.error);
  }, [id]);

  // Load current user from cookie
  useEffect(() => {
    const userStr = Cookies.get('user');
    if (!userStr) return;

    try {
      const parsed = JSON.parse(userStr);

      // basic sanity check – must be an object with id
      if (parsed && typeof parsed === 'object' && 'id' in parsed) {
        setCurrentUser(parsed);
      } else {
        // old or invalid cookie, drop it
        Cookies.remove('user');
      }
    } catch {
      // cookie was not valid JSON (old version) – remove it and treat as logged out
      Cookies.remove('user');
    }
  }, []);


  // Sync edit form with game data
  useEffect(() => {
    if (game) {
      setEditGameForm({
        title: game.title || '',
        genre: game.genre || '',
        release_year: game.release_year ? String(game.release_year) : '',
        description: game.description || '',
        coverFile: null,
      });
    }
  }, [game]);

  const handleReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await fetchAPI(`/games/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, body: formData.get('body') }),
      });
      // Simple way: reload the page data
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGameFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditGameForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGameCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditGameForm((prev) => ({ ...prev, coverFile: e.target.files![0] }));
    } else {
      setEditGameForm((prev) => ({ ...prev, coverFile: null }));
    }
  };

  const handleUpdateGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!game) return;

    const formData = new FormData();
    formData.append('title', editGameForm.title);
    formData.append('genre', editGameForm.genre);
    formData.append('release_year', editGameForm.release_year);
    formData.append('description', editGameForm.description);
    if (editGameForm.coverFile) {
      formData.append('cover', editGameForm.coverFile);
    }

    try {
      const res = await fetchAPI(`/games/${game.id}`, {
        method: 'PUT',
        body: formData,
      });
      setGame(res.data);
      setIsEditingGame(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update game');
    }
  };

  const handleDeleteGame = async () => {
    if (!game) return;
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      await fetchAPI(`/games/${game.id}`, { method: 'DELETE' });
      alert('Game deleted');
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete game');
    }
  };

  const startEditReview = (review: any) => {
    setEditingReviewId(review.id);
    setEditingReviewBody(review.body || '');
    setEditingReviewRating(review.rating);
  };

  const handleUpdateReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!game || editingReviewId == null) return;

    try {
      const res = await fetchAPI(`/reviews/${editingReviewId}`, {
        method: 'PUT',
        body: JSON.stringify({
          rating: editingReviewRating,
          body: editingReviewBody,
        }),
      });
      const updatedReview = res.data;

      setGame((prev: any) => ({
        ...prev,
        reviews: prev.reviews.map((r: any) =>
          r.id === updatedReview.id ? updatedReview : r,
        ),
      }));
      setEditingReviewId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Delete this review?')) return;

    try {
      await fetchAPI(`/reviews/${reviewId}`, { method: 'DELETE' });
      setGame((prev: any) => ({
        ...prev,
        reviews: prev.reviews.filter((r: any) => r.id !== reviewId),
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  if (!game) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  const avg = calculateAvg(game.reviews || []);
  const isGameOwner =
    currentUser && currentUser.id === game.uploaded_by_id;

  return (
    <div className="max-w-7xl mx-auto px-8 pb-18">
      {/* Header */}
      <div className="flex flex-col md:flex-row my-9 items-start md:items-center justify-between px-6 gap-4">
        <h2 className="text-white text-3xl font-semibold">{game.title}</h2>
        <div className="flex flex-wrap gap-3">
          {isGameOwner && (
            <>
              <button
                type="button"
                onClick={() => setIsEditingGame((prev) => !prev)}
                className="bg-white px-6 py-2 rounded-md font-semibold hover:bg-black hover:text-white hover:outline-none hover:ring-2 hover:ring-white hover:ring-offset-2 transition"
              >
                {isEditingGame ? 'Cancel Edit' : 'Edit Game'}
              </button>
              <button
                type="button"
                onClick={handleDeleteGame}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition"
              >
                Delete Game
              </button>
            </>
          )}
          <Link href="/">
            <button className="bg-white px-6 py-2 rounded-md font-semibold hover:bg-black hover:text-white hover:outline-none hover:ring-2 hover:ring-white hover:ring-offset-2 transition">
              ← Back
            </button>
          </Link>
        </div>
      </div>

      {/* Game details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
        <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {game.cover ? (
            <img
              src={`${ASSET_BASE}/${game.cover}`}
              className="w-full h-full object-cover"
              alt={game.title}
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          {isEditingGame ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Edit Game</h3>
              <form onSubmit={handleUpdateGame} className="space-y-4">
                <input
                  name="title"
                  value={editGameForm.title}
                  onChange={handleGameFieldChange}
                  required
                  placeholder="Title"
                  className="w-full border border-black p-2 rounded"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="genre"
                    value={editGameForm.genre}
                    onChange={handleGameFieldChange}
                    placeholder="Genre"
                    className="w-full border border-black p-2 rounded"
                  />
                  <input
                    name="release_year"
                    type="number"
                    value={editGameForm.release_year}
                    onChange={handleGameFieldChange}
                    placeholder="Year"
                    className="w-full border border-black p-2 rounded"
                  />
                </div>

                <textarea
                  name="description"
                  value={editGameForm.description}
                  onChange={handleGameFieldChange}
                  rows={4}
                  placeholder="Description"
                  className="w-full border border-black p-2 rounded"
                />

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Change Cover (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGameCoverChange}
                    className="w-full border border-black p-2 rounded"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded font-semibold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingGame(false)}
                    className="border border-black px-4 py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <p className="mb-2">
                <strong>Genre:</strong> {game.genre || '—'}
              </p>
              <p className="mb-2">
                <strong>Release Year:</strong>{' '}
                {game.release_year ?? '—'}
              </p>
              <p className="mb-2">
                <strong>Uploaded by:</strong>{' '}
                {game.uploaded_by?.name || 'Unknown'}
              </p>
              <p className="mb-4">
                <strong>Description:</strong>{' '}
                {game.description || '—'}
              </p>
              <p className="mb-2">
                <strong>Uploaded by:</strong> {game.uploaded_by?.name || 'Unknown'}
              </p>
            </>
          )}

          <div className="mt-4">
            <p className="font-semibold">
              Average Rating: {avg.toFixed(1)}/10
            </p>
            <div className="h-2 w-full bg-gray-200 rounded-md overflow-hidden mt-1">
              <div
                className="h-full bg-black"
                style={{ width: `${avg * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="px-6 mt-9">
        <h2 className="text-white text-2xl font-semibold mb-4">
          Reviews
        </h2>

        {/* New review form */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <form onSubmit={handleReview} className="space-y-4">
            <div>
              <label className="block text-sm font-bold">
                Rating: {rating}/10
              </label>
              <div className="flex gap-2 mt-2">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className={`w-8 h-8 border ${
                      i + 1 <= rating
                        ? 'bg-black text-white'
                        : 'bg-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              name="body"
              placeholder="Your review..."
              className="w-full border p-2 rounded"
            ></textarea>
            <button className="bg-black text-white px-4 py-2 rounded">
              Submit Review
            </button>
          </form>
        </div>

        {/* Existing reviews */}
        <div className="space-y-4">
          {game.reviews?.length ? (
            game.reviews.map((r: any) => {
              const isOwner =
                currentUser && currentUser.id === r.user_id;
              const isEditing = editingReviewId === r.id;

              return (
                <div
                  key={r.id}
                  className="bg-white p-4 rounded shadow"
                >
                  {isEditing ? (
                    <form
                      onSubmit={handleUpdateReview}
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-bold">
                          {r.user?.name || 'User'}
                        </p>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={editingReviewRating}
                          onChange={(e) =>
                            setEditingReviewRating(
                              Number(e.target.value),
                            )
                          }
                          className="w-20 border rounded px-2 py-1 text-right"
                        />
                      </div>
                      <textarea
                        value={editingReviewBody}
                        onChange={(e) =>
                          setEditingReviewBody(e.target.value)
                        }
                        className="w-full border rounded p-2"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="border border-black px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-black text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">
                          {r.user?.name || 'User'}
                        </p>
                        <p>{r.body}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-lg">
                          {r.rating}/10
                        </span>
                        {isOwner && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditReview(r)}
                              className="px-3 py-1 border border-black rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(r.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-300">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
