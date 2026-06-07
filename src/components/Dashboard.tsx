'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Clock, TrendingUp, LogOut, Layout as LayoutIcon, CheckCircle, Clock as ClockIcon, Zap, PlusCircle, Menu, X, Moon, Sun, Star, Youtube, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../types';
import Link from 'next/link';
import { getRemainingPlaylists } from '../services/plans';
import { extractPlaylistId, fetchPlaylistData } from '../services/youtube';
import { createCourse, createVideos, getUserCourses } from '../lib/db';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeNav, setActiveNav] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextTheme: Record<ThemeMode, ThemeMode> = {
    light: 'dark',
    dark: 'midnight',
    midnight: 'light',
  };

  useEffect(() => {
    const loadUserAndCourses = async () => {
      try {
        // Try Supabase first
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching supabase user in Dashboard:', error);
        }

        if (supabaseUser) {
          // Fetch profile from DB
          try {
            const profile = await (async () => {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();
              return data;
            })();

            const current = {
              id: supabaseUser.id,
              email: supabaseUser.email,
              name: profile?.full_name || profile?.username || supabaseUser.email?.split('@')[0] || '',
              plan: profile?.plan || 'free',
            };

            setUser(current);

            // Load courses from Supabase
            try {
              const userCourses = await getUserCourses(supabaseUser.id);
              setCourses(userCourses || []);
            } catch (err) {
              console.error('Failed to load user courses from DB:', err);
              // fallback to localStorage
              const savedCourses = localStorage.getItem(`user_courses_${supabaseUser.id}`);
              setCourses(savedCourses ? JSON.parse(savedCourses) : []);
            }
            return;
          } catch (err) {
            console.error('Error loading profile/courses:', err);
          }
        }

        // Fallback to local auth (existing localStorage-based system)
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const savedCourses = localStorage.getItem(`user_courses_${currentUser.id}`);
          setCourses(savedCourses ? JSON.parse(savedCourses) : []);
        }
      } catch (err) {
        console.error('Unexpected error loading Dashboard user:', err);
      }
    };

    loadUserAndCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate URL
      const playlistId = extractPlaylistId(url);
      if (!playlistId) {
        setError('Invalid YouTube playlist URL. Please make sure it contains "list=...".');
        setLoading(false);
        return;
      }

      // Fetch playlist data
      const courseData = await fetchPlaylistData(playlistId);
      
      // Get Supabase user
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser && courseData) {
        // First, ensure profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        // If no profile exists, create one
        if (!existingProfile) {
          await supabase
            .from('profiles')
            .insert([
              {
                id: supabaseUser.id,
                username: supabaseUser.email?.split('@')[0],
                full_name: supabaseUser.user_metadata?.full_name || '',
                email: supabaseUser.email || null,
              },
            ]);
        }

        // Now save course to Supabase
        const newCourse = await createCourse(supabaseUser.id, {
          title: courseData.title,
          description: courseData.description,
          thumbnail: courseData.thumbnail,
          playlistId: courseData.playlistId,
        });

        // Save videos to Supabase
        if (newCourse && courseData.videos) {
          await createVideos(newCourse.id, courseData.videos);
        }

        // Also save to localStorage
        const newLocalCourse = {
          id: newCourse.id,
          ...courseData,
          progress: {
            courseId: newCourse.id,
            completedVideoIds: [],
            lastWatchedVideoId: courseData.videos?.[0]?.id || '',
            lastUpdated: Date.now(),
          },
        };

        const userCoursesKey = `user_courses_${user.id}`;
        const existingCourses = localStorage.getItem(userCoursesKey);
        const allCourses = existingCourses ? JSON.parse(existingCourses) : [];
        allCourses.push(newLocalCourse);
        localStorage.setItem(userCoursesKey, JSON.stringify(allCourses));

        // Update state
        setCourses(allCourses);

        // Close modal and reset form
        setShowCreateModal(false);
        setUrl('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const stats = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: 'Total Courses',
      value: courses.length,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: <Play className="w-6 h-6" />,
      label: 'Videos Watched',
      value: courses.reduce((sum, course) => sum + (course.progress?.completedVideoIds?.length || 0), 0),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Average Progress',
      value: courses.length > 0 
        ? Math.round(courses.reduce((sum, course) => {
            const completed = course.progress?.completedVideoIds?.length || 0;
            const total = course.videos?.length || 1;
            return sum + (completed / total * 100);
          }, 0) / courses.length)
        : 0,
      suffix: '%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar */}
      <div className="w-64 bg-primary/50 border-r border-primary/30 fixed left-0 top-0 h-screen flex flex-col p-6 space-y-8 pt-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity mb-4">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Loomin</span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveNav('all')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
              activeNav === 'all'
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-secondary hover:text-primary hover:bg-secondary/20'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>My Courses</span>
          </button>

          <button
            onClick={() => setActiveNav('in-progress')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
              activeNav === 'in-progress'
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-secondary hover:text-primary hover:bg-secondary/20'
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            <span>In Progress</span>
          </button>

          <button
            onClick={() => setActiveNav('completed')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
              activeNav === 'completed'
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-secondary hover:text-primary hover:bg-secondary/20'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Completed</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="space-y-3 border-t border-primary/30 pt-4">
          {/* User Profile Button */}
          <button
            onClick={() => {
              // TODO: Navigate to profile page
              // router.push('/profile');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:text-primary hover:bg-secondary/20 transition-colors text-sm font-medium"
          >
            {user?.image && <img src={user.image} alt={user.name} className="w-5 h-5 rounded-full" />}
            {!user?.image && <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-xs">{user?.name?.charAt(0)}</div>}
            <span>{user?.name}</span>
          </button>

          {/* Theme Button */}
          <button
            onClick={() => setTheme(nextTheme[theme])}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:text-primary hover:bg-secondary/20 transition-colors text-sm font-medium"
            title="Switch Theme"
          >
            {theme === 'dark' && <Moon className="w-4 h-4" />}
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'midnight' && <Star className="w-4 h-4" />}
            <span className="capitalize">{theme}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-secondary hover:text-primary transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-primary via-primary to-secondary/50"
      >
        {/* Header */}
        <div className="bg-primary/80 backdrop-blur-md border-b border-primary sticky top-0 z-40">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Left - Logo */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
                  {user.plan === 'pro' && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-accent">Pro</span>
                    </div>
                  )}
                </div>
                <p className="text-secondary text-sm mt-1">
                  Manage your learning journey
                  {user.plan === 'free' && (
                    <span> • {getRemainingPlaylists(user, courses.length)} playlist{getRemainingPlaylists(user, courses.length) !== 1 ? 's' : ''} remaining</span>
                  )}
                </p>
              </div>

              {/* Right - Create & Upgrade Buttons */}
              <div className="flex items-center gap-4">
                {/* Upgrade Button - Only for Free users */}
                {user.plan === 'free' && (
                  <button
                    onClick={() => {
                      window.location.href = '/#pricing';
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-primary rounded-lg font-semibold transition-all border border-primary hover:border-accent"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade
                  </button>
                )}

                {/* Create Button */}
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-all border border-accent"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-8 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bgColor} border border-primary rounded-2xl p-6 backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-secondary text-sm font-medium mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-primary">
                      {stat.value}{stat.suffix || ''}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 bg-primary rounded-lg`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-6">Your Courses</h2>
          
          {courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-secondary/30 border border-primary rounded-2xl"
            >
              <BookOpen className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-secondary text-lg mb-4">No courses yet</p>
              <p className="text-secondary/70 text-sm max-w-md mx-auto">
                Go back to create your first course from a YouTube playlist!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => {
                const completed = course.progress?.completedVideoIds?.length || 0;
                const total = course.videos?.length || 0;
                const progress = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-secondary/50 border border-primary rounded-2xl overflow-hidden hover:border-accent hover:shadow-lg hover:shadow-accent/20 transition-all"
                  >
                    {course.image && (
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg line-clamp-2 text-primary mb-2">{course.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <Play className="w-4 h-4" />
                          <span>{total} videos</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-secondary">Progress</span>
                          <span className="font-bold text-accent">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-primary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-secondary">
                        <Clock className="w-4 h-4" />
                        <span>{completed} of {total} completed</span>
                      </div>

                      <button className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-semibold text-sm">
                        Continue Learning
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        </div>

        {/* Create Course Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-primary border border-primary rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
                  <p className="text-secondary">Paste a YouTube playlist link to create a structured course</p>
                </div>

                <form onSubmit={handleCreateCourse} className="space-y-4">
                  {/* URL Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary">Playlist URL</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-secondary">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube playlist link here..."
                        className="w-full pl-12 pr-4 py-3 bg-secondary border border-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-500">{error}</p>
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setUrl('');
                        setError(null);
                      }}
                      className="flex-1 px-6 py-3 bg-secondary/30 hover:bg-secondary/50 text-primary rounded-lg font-semibold transition-all border border-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !url.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>Create Course</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
