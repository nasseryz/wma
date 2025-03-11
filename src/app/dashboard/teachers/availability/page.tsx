'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBox from '../../../components/SearchBox';

interface TeacherAvailability {
  teachersAvailabilityId: number;
  teacherId: number;
  teacherName: string;
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  dayOfWeek: number;
  dayName: string;
}

export default function TeachersAvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>([]);
  const [searchfield, setSearchfield] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = React.useRef<{ [key: number]: HTMLDivElement | null }>({});

  const login = async () => {
    try {
      const response = await fetch('/api/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'api',
          password: 'api@vo7umemeteR'
        })
      });

      if (response.ok) {
        const userData = await response.json();
        setToken(userData.token);
        return userData.token;
      } else {
        console.error('Login failed:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const getTeachersAvailability = async (authToken: string) => {
    try {
      const response = await fetch('/api/teachers/teacher-availabilities-all', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const availabilityData = await response.json();
        console.log('Teachers Availability Response:', JSON.stringify(availabilityData, null, 2));
        setAvailabilities(availabilityData);
      } else {
        console.error('Failed to fetch teachers availability:', response.status);
      }
    } catch (error) {
      console.error('Error fetching teachers availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const authToken = await login();
      if (authToken) {
        await getTeachersAvailability(authToken);
      } else {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openMenuId && menuRef.current[openMenuId] && !menuRef.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchfield(event.target.value);
  };

  const filteredAvailabilities = availabilities.filter(availability => {
    const searchTerm = searchfield.toLowerCase();
    return availability?.teacherName?.toLowerCase().includes(searchTerm) || false;
  });

  const toggleTeacherSelection = (teacherId: number) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const toggleAllTeachers = () => {
    setSelectedTeachers(prev => 
      prev.length === filteredAvailabilities.length 
        ? [] 
        : filteredAvailabilities.map(availability => availability.teacherId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Teacher Availability</h1>
          <div className="flex items-center gap-2 text-base text-gray-500">
            <Link href="/dashboard" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <Link href="/dashboard/teachers" className="hover:text-purple-600">Teachers</Link>
            <span>/</span>
            <span>Availability</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-72">
            <SearchBox searchChange={onSearchChange} />
          </div>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Availability
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider w-16">#</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Teacher ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Day</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredAvailabilities.map((availability, index) => (
                <tr key={availability.teachersAvailabilityId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{availability.teacherId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-medium text-gray-900">{availability.teacherName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{availability.dayName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">
                    {availability.fromTime} - {availability.toTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">
                    {availability.fromDate} - {availability.toDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === availability.teachersAvailabilityId ? null : availability.teachersAvailabilityId);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                    {openMenuId === availability.teachersAvailabilityId && (
                      <div 
                        ref={(el) => { menuRef.current[availability.teachersAvailabilityId] = el }}
                        className="absolute right-6 top-0 w-32 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10 transform -translate-y-1/4"
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center group first:rounded-t-lg"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit action
                              setOpenMenuId(null);
                            }}
                          >
                            <svg className="mr-2 h-4 w-4 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center group last:rounded-b-lg"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete action
                              setOpenMenuId(null);
                            }}
                          >
                            <svg className="mr-2 h-4 w-4 text-red-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 