"use client"

import React, { useState, useEffect } from 'react';
import SearchBox from './SearchBox';
import Sidebar from './Sidebar';

interface Teacher {
  teacherId: number;
  name: string;
  email: string;
  phoneNumber?: string;
}

export default function App() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchfield, setSearchfield] = useState('');
  const [token, setToken] = useState<string | null>(null);

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

  const getTeachersInfo = async (authToken: string) => {
    try {
      const response = await fetch('/api/wmadashboard/teachers', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const teachersData = await response.json();
        setTeachers(teachersData);
      } else {
        console.error('Failed to fetch teachers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const authToken = await login();
      if (authToken) {
        await getTeachersInfo(authToken);
      }
    };

    initializeData();
  }, []);

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchfield(event.target.value);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchfield.toLowerCase())
  );

  if (!teachers.length) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Teachers</h2>
              <SearchBox searchChange={onSearchChange} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.teacherId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.teacherId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.phoneNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

