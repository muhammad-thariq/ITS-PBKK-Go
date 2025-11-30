'use client';
import { useState } from 'react';
import { fetchAPI } from '@/utils/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      Cookies.set('token', data.token);
      Cookies.set('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="flex justify-center mt-20">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-lg w-96 space-y-4">
            <h1 className="text-2xl font-bold">Login</h1>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2 rounded"/>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 rounded"/>
            <button className="bg-black text-white w-full p-2 rounded">Login</button>
            
        </form>
    </div>
  );
}