'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBox from '../../components/SearchBox';


interface Parent {
  parentId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
  note: string | null;
}

interface Sibling {
  studentId: number;
  firstName: string;
  lastName: string;
}

interface LessonSchedule {
  lessonScheduleId: number;
  lessonName: string;
  dayOfWeek: number;
  dayName: string;
  lessonTime: string;
  lessonEndTime: string;
  studentId: number;
  studentName: string;
  teacherId: number;
  lessonStatusDescription: string;
  teacherName: string;
  lessonTypeName: string;
  lessonTypeId: number;
  duration: number;
  groupSize: number;
  instrumentId: number;
  instrumentName: string;
  note: string;
  autoRenew: boolean;
  lessonSessions: any[];
}

interface Student {
  studentId: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  isAdult: string;
  isActive: boolean;
  created: string;
  familyId: number;
  parents: Parent[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchfield, setSearchfield] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Restore items per page state
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set([1]));
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null); // Add this state for tracking which menu is open
  const menuRef = React.useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Add click outside handler
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

  const fetchStudentsPage = async (pageNumber: number, authToken: string) => {
    try {
      const response = await fetch(`/api/students?pageSize=50&pageNumber=${pageNumber}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const studentsData = await response.json();
        return studentsData;
      } else {
        console.error('Failed to fetch students:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const getStudentsInfo = async (authToken: string) => {
    try {
      const initialStudents = await fetchStudentsPage(1, authToken);
      setStudents(initialStudents);
      setFetchedPages(new Set([1]));
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreStudents = async (pageNumber: number) => {
    if (fetchedPages.has(pageNumber) || !token || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const newStudents = await fetchStudentsPage(pageNumber, token);
      if (newStudents.length > 0) {
        setStudents(prev => {
          const combined = [...prev, ...newStudents];
          // Remove duplicates based on studentId
          const unique = Array.from(new Map(combined.map(s => [s.studentId, s])).values());
          return unique;
        });
        setFetchedPages(prev => new Set(prev.add(pageNumber)));
      }
    } catch (error) {
      console.error('Error fetching more students:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const authToken = await login();
      if (authToken) {
        await getStudentsInfo(authToken);
      } else {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // When page changes, fetch more data if needed
  useEffect(() => {
    const fetchNextChunkIfNeeded = async () => {
      // Calculate which server page we need based on current page
      const currentServerPage = Math.ceil(currentPage * itemsPerPage / 50);
      const nextServerPage = currentServerPage + 1;

      // If we're in the last 5 pages of current data chunk and haven't fetched next chunk
      if (currentPage % 5 >= 3 && !fetchedPages.has(nextServerPage)) {
        await fetchMoreStudents(nextServerPage);
      }
    };

    fetchNextChunkIfNeeded();
  }, [currentPage, itemsPerPage]);

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchfield(event.target.value);
    setCurrentPage(1);
  };

  const filteredStudents = students.filter(student =>
    `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchfield.toLowerCase())
  );

  // Update pagination calculation
  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  // Calculate total pages based on actual data or next expected chunk
  const calculatedTotalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const nextExpectedChunk = Math.ceil(currentPage / 5) * 5 + 5; // Next 5 pages
  const totalPages = Math.max(calculatedTotalPages, 
    currentPage % 5 >= 3 ? nextExpectedChunk : calculatedTotalPages
  );
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 10;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAllStudents = () => {
    setSelectedStudents(prev => 
      prev.length === filteredStudents.length 
        ? [] 
        : filteredStudents.map(student => student.studentId)
    );
  };

  const getParentInfo = (parents: Parent[]) => {
    if (!parents || parents.length === 0) return { name: '-', phone: '-', email: '-' };
    const parent = parents[0];
    return {
      name: `${parent.firstName} ${parent.lastName}`,
      phone: parent.phoneNumber || '-',
      email: parent.email || '-'
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Students List</h1>
          <div className="flex items-center gap-2 text-base text-gray-500">
            <Link href="/dashboard" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <span>Students</span>
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
            Add Student
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-2 py-4 text-left w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={selectedStudents.length === filteredStudents.length}
                    onChange={toggleAllStudents}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider w-16">#</th>
                <th className="pl-2 pr-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Date of Birth</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Parent Info</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Parent Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {currentStudents.map((student, index) => {
                const parentInfo = getParentInfo(student.parents);
                return (
                  <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={selectedStudents.includes(student.studentId)}
                        onChange={() => toggleStudentSelection(student.studentId)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="pl-2 pr-6 py-4 whitespace-nowrap text-base text-gray-600">{student.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <span className="text-base font-medium text-blue-600">
                              {student.firstname[0]}{student.lastname[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-medium text-gray-900">
                            {student.firstname} {student.lastname}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{student.dateOfBirth}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{student.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{student.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${student.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-base text-gray-600">{student.isActive ? 'Active' : 'Inactive'}</span>
                        {student.isAdult === 'Yes' && (
                          <span className="ml-2 px-2 inline-flex text-sm leading-5 font-medium rounded-full bg-blue-50 text-blue-600">
                            Adult
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{formatDate(student.created)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-900">{parentInfo.name}</div>
                      <div className="text-base text-gray-500">{parentInfo.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{parentInfo.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === student.studentId ? null : student.studentId);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                      {openMenuId === student.studentId && (
                        <div 
                          ref={(el) => { menuRef.current[student.studentId] = el }}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-base ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 rounded-md text-base ${
                      currentPage === pageNumber
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                {currentPage + 3 < totalPages && <span className="px-2 text-gray-400">...</span>}
                {currentPage + 3 < totalPages && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-4 py-2 rounded-md text-base text-gray-600 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-base ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>

            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="ml-4 px-3 py-2 border border-gray-200 rounded-md text-base text-gray-600 bg-white hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}