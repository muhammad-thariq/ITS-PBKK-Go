'use client';
import { useState } from 'react';
import { fetchAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      // Backend doesn't return token on register, so we send them to login
      alert("Registration successful! Please login.");
      router.push('/login');
    } catch (err: any) { 
      alert(err.message); 
    }
  };

  return (
    <div className="flex justify-center mt-28">
        {/* White box with Black text (text-gray-900) */}
        <form onSubmit={handleRegister} className="bg-white text-gray-900 p-8 rounded-md shadow-lg w-96 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            
            <div>
                <input 
                  placeholder="Name" 
                  value={name} 
                  onChange={e=>setName(e.target.value)} 
                  required
                  className="w-full border border-gray-200 p-3 rounded bg-gray-50 focus:bg-white focus:border-black outline-none"
                />
            </div>

            <div>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  required
                  className="w-full border border-gray-200 p-3 rounded bg-gray-50 focus:bg-white focus:border-black outline-none"
                />
            </div>

            <div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  required
                  minLength={6}
                  className="w-full border border-gray-200 p-3 rounded bg-gray-50 focus:bg-white focus:border-black outline-none"
                />
            </div>

            <button className="bg-black text-white w-full p-3 rounded font-semibold hover:opacity-90 transition">
              Create Account
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Already have an account? <Link href="/login" className="text-black font-semibold hover:underline">Login</Link>
            </div>
        </form>
    </div>
  );
}