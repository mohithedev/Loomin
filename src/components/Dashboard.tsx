'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, TrendingUp, LogOut, Layout as LayoutIcon, CheckCircle, Clock as ClockIcon, Moon, Zap, PlusCircle, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { getRemainingPlaylists } from '../services/plans';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeNav, setActiveNav] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Load user's courses from localStorage
    if (currentUser) {
      const savedCourses = localStorage.getItem(`user_courses_${currentUser.id}`);
      setCourses(savedCourses ? JSON.parse(savedCourses) : []);
    }
  }, []);

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
      <div className="w-64 bg-primary/50 border-r border-primary/30 fixed left-0 top-0 h-screen flex flex-col p-6 space-y-8 pt-20">
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

              {/* Right - Theme, Upgrade, Create */}
              <div className="flex items-center gap-4">
                {/* Theme Button */}
                <button
                  className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-secondary text-xs font-semibold flex items-center gap-1 border border-primary hover:border-accent"
                  title="Switch Theme"
                >
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline capitalize">Dark</span>
                </button>

                {/* Upgrade Button - Only for Free users */}
                {user.plan === 'free' && (
                  <button
                    onClick={() => {
                      const pricingSection = document.getElementById('pricing');
                      if (pricingSection) {
                        window.location.href = '/#pricing';
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-all border border-accent"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </button>
                )}

                {/* Create Button */}
                <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-all border border-accent">
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
      </motion.div>
    </div>
  );
};
