import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  const [isTeachersOpen, setIsTeachersOpen] = useState(false);

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="p-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-2xl font-bold text-gray-800">WMA Dashboard</h1>
        </Link>
      </div>
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {/* Teachers Section with Dropdown */}
          <div>
            <button
              onClick={() => setIsTeachersOpen(!isTeachersOpen)}
              className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 group transition-colors ${
                pathname.startsWith('/dashboard/teachers')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="flex-1 text-left">Teachers</span>
              <svg
                className={`w-4 h-4 transition-transform ${isTeachersOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Teachers Submenu */}
            <div className={`pl-11 mt-1 space-y-1 ${isTeachersOpen ? 'block' : 'hidden'}`}>
              <Link
                href="/dashboard/teachers"
                className={`block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 ${
                  pathname === '/dashboard/teachers'
                    ? 'text-blue-700'
                    : 'text-gray-600'
                }`}
              >
                Teachers Info
              </Link>
              <Link
                href="/dashboard/teachers/availability"
                className={`block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 ${
                  pathname === '/dashboard/teachers/availability'
                    ? 'text-blue-700'
                    : 'text-gray-600'
                }`}
              >
                Teachers Availability
              </Link>
            </div>
          </div>

          <Link 
            href="/dashboard/students"
            className={`flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 group transition-colors ${
              pathname === '/dashboard/students' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-500'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Students
          </Link>
          <Link 
            href="/dashboard/lessons"
            className={`flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 group transition-colors ${
              pathname === '/dashboard/lessons' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-500'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Lessons
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 