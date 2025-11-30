'use client';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center group">
                {/* Make sure you have bit.png inside frontend/public/ folder. 
                   If you don't have the image, remove the <img> tag.
                */}
                <img src="/bit.png" alt="logo" className="h-9 mr-1" />
                <p className="ml-0.5 font-bold text-black group-hover:text-gray-700 transition">
                  Game Review
                </p>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
             <Link href="/login" className="text-gray-500 hover:text-black px-3 py-2 rounded-md text-sm font-medium">
                Login
             </Link>
             <Link href="/register" className="text-gray-500 hover:text-black px-3 py-2 rounded-md text-sm font-medium">
                Register
             </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}