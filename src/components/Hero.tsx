'use client';

import React, { useState } from 'react';
import { Play, Search, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractPlaylistId, fetchPlaylistData } from '../services/youtube';
import { Course } from '../types';

export const Hero: React.FC<{ onCoursePreview: (course: Partial<Course>) => void }> = ({ onCoursePreview }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      setError('Invalid YouTube playlist URL. Please make sure it contains "list=...".');
      return;
    }

    setLoading(true);
    try {
      const courseData = await fetchPlaylistData(playlistId);
      onCoursePreview(courseData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch playlist. Check your API key and URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 blur-[120px] -z-10 rounded-full" />
      
      <div className="text-center space-y-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
            Learn from YouTube, <br />
            <span className="text-accent">Without the Noise.</span>
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Transform any YouTube playlist into a structured, distraction-free course. 
            Track your progress and stay focused on what matters.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleCreate}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative flex items-center">
            <div className="absolute left-4 text-secondary">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube playlist link here..."
              className="w-full pl-12 pr-36 py-4 bg-secondary border border-primary rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-lg"
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="absolute right-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2 justify-center"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 pt-8 text-secondary text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span>Sequential Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span>Progress Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span>No Recommendations</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
