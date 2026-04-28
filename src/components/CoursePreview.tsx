'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Clock, List, ArrowRight, Lock, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '../types';

interface CoursePreviewProps {
  course: Partial<Course>;
  onStart: () => void;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({ course, onStart }) => {
  const [sortOrder, setSortOrder] = useState<'old-to-new' | 'new-to-old'>('old-to-new');
  
  if (!course) return null;

  // Sort videos based on sortOrder
  const sortedVideos = course.videos ? [...course.videos].sort((a, b) => {
    const posA = a.position || 0;
    const posB = b.position || 0;
    return sortOrder === 'old-to-new' ? posA - posB : posB - posA;
  }) : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto mt-12 bg-secondary/50 border border-primary rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm"
    >
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 aspect-video md:aspect-auto relative">
          <Image
            src={course.thumbnail || ''}
            alt={course.title || ''}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
            <p className="text-secondary line-clamp-2">{course.description}</p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-secondary">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-accent" />
              <span>{course.videos?.length} Videos</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>
                {course.videos?.length 
                  ? (() => {
                      const totalSeconds = course.videos.reduce((acc, video) => {
                        const parts = video.duration.split(':').map(Number);
                        if (parts.length === 3) {
                          return acc + parts[0] * 3600 + parts[1] * 60 + parts[2];
                        }
                        if (parts.length === 2) {
                          return acc + parts[0] * 60 + parts[1];
                        }
                        return acc;
                      }, 0);
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                    })()
                  : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent">Course Structure</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder('old-to-new')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    sortOrder === 'old-to-new'
                      ? 'bg-accent/20 border border-accent text-accent'
                      : 'bg-secondary/50 border border-primary text-secondary hover:text-primary'
                  }`}
                >
                  <ArrowUp className="w-3 h-3" />
                  Old → New
                </button>
                <button
                  onClick={() => setSortOrder('new-to-old')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    sortOrder === 'new-to-old'
                      ? 'bg-accent/20 border border-accent text-accent'
                      : 'bg-secondary/50 border border-primary text-secondary hover:text-primary'
                  }`}
                >
                  <ArrowDown className="w-3 h-3" />
                  New → Old
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {sortedVideos.map((video, idx) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 bg-primary/50 border border-primary rounded-xl hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-secondary w-4">{idx + 1}</span>
                    <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {video.title}
                    </span>
                  </div>
                  {idx === 0 ? (
                    <Play className="w-4 h-4 text-accent fill-accent" />
                  ) : (
                    <Lock className="w-4 h-4 text-secondary opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-primary">
            <div className="text-xs text-secondary">
              Sign in to save your progress and unlock all videos.
            </div>
            <button
              onClick={onStart}
              className="px-8 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl transition-all font-bold flex items-center gap-2 group shadow-lg shadow-accent/20 border border-accent"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
