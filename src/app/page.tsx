// Loomin: YouTube to Course Platform
'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Hero } from '../components/Hero';
import { CoursePreview } from '../components/CoursePreview';
import { VideoPlayer } from '../components/VideoPlayer';
import { LoginModal } from '../components/LoginModal';
import { Dashboard } from '../components/Dashboard';
import { UpgradeModal } from '../components/UpgradeModal';
import { Course, UserProgress } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { isLoggedIn, getCurrentUser, logout } from '../services/auth';
import { canCreatePlaylist } from '../services/plans';

export default function Home() {
  const [coursePreview, setCoursePreview] = useState<Partial<Course> | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    setUserLoggedIn(loggedIn);
    setShowDashboard(loggedIn);
  }, []);

  const handleLoginSuccess = () => {
    setUserLoggedIn(true);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    logout();
    setUserLoggedIn(false);
    setShowDashboard(false);
    setActiveCourse(null);
    setCoursePreview(null);
  };

  const handleBackToDashboard = () => {
    setActiveCourse(null);
    setCoursePreview(null);
    setShowDashboard(true);
  };

  const handleCoursePreview = (course: Partial<Course>) => {
    setCoursePreview(course);
    // Scroll to preview
    setTimeout(() => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }, 100);
  };

  const handleStartCourse = () => {
    if (!coursePreview || !coursePreview.videos) return;
    
    // Check plan limits if user is logged in
    if (userLoggedIn) {
      const user = getCurrentUser();
      if (user) {
        const userCoursesKey = `user_courses_${user.id}`;
        const existingCourses = localStorage.getItem(userCoursesKey);
        const currentCourseCount = existingCourses ? JSON.parse(existingCourses).length : 0;
        
        // Check if user can create another course
        if (!canCreatePlaylist(user, currentCourseCount)) {
          setShowUpgradeModal(true);
          return;
        }
      }
    }
    
    const newCourse: Course = {
      ...coursePreview as Course,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublic: true,
    };

    const initialProgress: UserProgress = {
      courseId: newCourse.id,
      completedVideoIds: [],
      lastWatchedVideoId: newCourse.videos[0].id,
      lastUpdated: Date.now(),
    };

    // Save course to user's profile if logged in
    if (userLoggedIn) {
      const user = getCurrentUser();
      if (user) {
        const userCoursesKey = `user_courses_${user.id}`;
        const existingCourses = localStorage.getItem(userCoursesKey);
        const courses = existingCourses ? JSON.parse(existingCourses) : [];
        courses.push({
          ...newCourse,
          progress: initialProgress,
        });
        localStorage.setItem(userCoursesKey, JSON.stringify(courses));
      }
    }

    setActiveCourse(newCourse);
    setProgress(initialProgress);
    setCurrentVideoId(newCourse.videos[0].id);
    setCoursePreview(null);
    setShowDashboard(false);
  };

  const handleVideoComplete = (videoId: string) => {
    if (!progress || !activeCourse) return;

    const isAlreadyCompleted = progress.completedVideoIds.includes(videoId);
    const newCompletedIds = isAlreadyCompleted 
      ? progress.completedVideoIds 
      : [...progress.completedVideoIds, videoId];

    const newProgress = {
      ...progress,
      completedVideoIds: newCompletedIds,
      lastUpdated: Date.now(),
    };

    setProgress(newProgress);

    // Auto-unlock next video
    const currentIndex = activeCourse.videos.findIndex(v => v.id === videoId);
    if (currentIndex < activeCourse.videos.length - 1) {
      const nextVideoId = activeCourse.videos[currentIndex + 1].id;
      setCurrentVideoId(nextVideoId);
    }
  };

  return (
    <Layout onLogin={() => setIsLoginModalOpen(true)} onLogout={handleLogout} isLoggedIn={userLoggedIn}>
      <AnimatePresence mode="wait">
        {showDashboard && userLoggedIn && !activeCourse ? (
          <Dashboard key="dashboard" onLogout={handleLogout} />
        ) : !activeCourse ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <Hero onCoursePreview={handleCoursePreview} />
            {coursePreview && (
              <CoursePreview 
                course={coursePreview} 
                onStart={handleStartCourse} 
              />
            )}
            
            {/* Features Section */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Everything YouTube is missing</h2>
                <p className="text-lg text-secondary max-w-2xl mx-auto">Get the structured learning experience you need</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: '🔓',
                    title: 'Sequential Unlocking',
                    desc: 'Each lesson unlocks only after you complete the previous. Real discipline, real progress.'
                  },
                  {
                    icon: '📊',
                    title: 'Progress Tracking',
                    desc: 'Know exactly where you stand across all courses. Resume right where you left off.'
                  },
                  {
                    icon: '⚡',
                    title: 'Focus Mode',
                    desc: 'Zero distractions. No comments, no recommendations. Just you and the content.'
                  },
                  {
                    icon: '⚙️',
                    title: 'Instant Import',
                    desc: 'Paste any playlist URL. Your structured course is ready in seconds.'
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 bg-secondary/30 border border-primary rounded-2xl hover:border-accent hover:bg-secondary/50 transition-all group"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-secondary text-sm">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Simple, transparent pricing</h2>
                <p className="text-lg text-secondary max-w-2xl mx-auto">Start free. Upgrade when you're ready to focus deeper.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    name: 'STARTER',
                    price: 0,
                    features: ['Up to 2 playlists', 'Sequential video unlocking', 'Basic progress tracking', 'Focus mode'],
                    cta: 'Get Started Free'
                  },
                  {
                    name: 'FOCUS PRO',
                    price: 5,
                    popular: true,
                    features: ['Unlimited playlists', 'Advanced progress tracking', 'Notes per video', 'Bookmark timestamps', 'AI summaries', 'Priority access to new features'],
                    cta: 'Upgrade to Pro'
                  }
                ].map((plan, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className={`relative p-8 rounded-2xl border transition-all ${
                      plan.popular 
                        ? 'bg-accent/10 border-accent shadow-xl shadow-accent/20' 
                        : 'bg-secondary/30 border-primary hover:border-accent'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          {plan.price > 0 && <span className="text-secondary text-sm">/month</span>}
                          {plan.price === 0 && <span className="text-secondary text-sm">Forever free</span>}
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full py-2 font-semibold rounded-lg transition-all ${
                        plan.popular
                          ? 'bg-accent hover:bg-accent-hover text-white'
                          : 'bg-secondary/50 hover:bg-secondary text-primary border border-primary'
                      }`}>
                        {plan.cta}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center mb-16">Full comparison</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-primary">
                      <th className="text-left py-4 px-4 font-bold">FEATURE</th>
                      <th className="text-center py-4 px-4 font-bold">FREE</th>
                      <th className="text-center py-4 px-4 font-bold">PRO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Playlists', free: '2', pro: 'Unlimited' },
                      { feature: 'Sequential unlocking', free: '✓', pro: '✓' },
                      { feature: 'Progress tracking', free: 'Basic', pro: 'Advanced' },
                      { feature: 'Focus mode', free: '✓', pro: '✓' },
                      { feature: 'Resume last video', free: '✓', pro: '✓' },
                      { feature: 'Notes per video', free: '–', pro: '✓' },
                      { feature: 'Bookmark timestamps', free: '–', pro: '✓' },
                      { feature: 'AI summaries', free: '–', pro: 'Coming soon' },
                      { feature: 'Priority features', free: '–', pro: '✓' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-primary/30 hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-4 font-semibold">{row.feature}</td>
                        <td className="text-center py-4 px-4 text-secondary">{row.free}</td>
                        <td className="text-center py-4 px-4 text-accent font-semibold">{row.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="course-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveCourse(null)}
                className="text-sm font-bold text-secondary hover:text-accent transition-colors flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <div className="text-sm font-bold text-accent">
                {activeCourse.title}
              </div>
            </div>

            {currentVideoId && progress && (
              <VideoPlayer
                course={activeCourse}
                progress={progress}
                currentVideoId={currentVideoId}
                onVideoComplete={handleVideoComplete}
                onVideoSelect={setCurrentVideoId}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          // In production, this would handle the Stripe upgrade
        }}
        reason="playlist_limit_reached"
      />
    </Layout>
  );
}
