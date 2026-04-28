'use client';

import React, { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import Image from 'next/image';
import { Loader2, Play, CheckCircle2, Lock, ChevronRight, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Course, UserProgress } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GeminiAnalysis } from './GeminiAnalysis';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VideoPlayerProps {
  course: Course;
  progress: UserProgress;
  onVideoComplete: (videoId: string) => void;
  onVideoSelect: (videoId: string) => void;
  currentVideoId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  course,
  progress,
  onVideoComplete,
  onVideoSelect,
  currentVideoId,
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  const currentVideo = course.videos.find(v => v.id === currentVideoId) || course.videos[0];
  const currentIndex = course.videos.findIndex(v => v.id === currentVideoId);

  const isVideoUnlocked = (videoId: string) => {
    const index = course.videos.findIndex(v => v.id === videoId);
    if (index === 0) return true;
    const prevVideo = course.videos[index - 1];
    return progress.completedVideoIds.includes(prevVideo.id);
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setLoading(false);
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 0) {
      onVideoComplete(currentVideoId);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      controls: 1,
      fs: 1,
      iv_load_policy: 3,
      disablekb: 0,
    },
  };

  return (
    <div className={cn(
      "flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto transition-all duration-500",
      focusMode && "lg:flex-col items-center"
    )}>
      {/* Main Player Area */}
      <div className={cn(
        "flex-1 space-y-6 transition-all duration-500",
        focusMode ? "w-full max-w-5xl" : "w-full"
      )}>
        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-primary group">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-secondary/50 z-10 backdrop-blur-sm"
              >
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <YouTube
            videoId={currentVideoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
          />

          <button
            onClick={() => setFocusMode(!focusMode)}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
            title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {focusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{currentVideo.title}</h1>
          </div>

          {/* Bottom Navigation - Previous/Next Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => onVideoSelect(course.videos[currentIndex - 1].id)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold disabled:hover:bg-accent"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            <button
              disabled={currentIndex === course.videos.length - 1 || !isVideoUnlocked(course.videos[currentIndex + 1].id)}
              onClick={() => onVideoSelect(course.videos[currentIndex + 1].id)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold disabled:hover:bg-accent"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <GeminiAnalysis 
            videoTitle={currentVideo.title} 
            description={currentVideo.description} 
            videoId={currentVideoId}
          />
        </div>
      </div>

      {/* Sidebar Playlist */}
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-96 space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <List className="w-5 h-5 text-accent" />
                <span>Course Content</span>
              </h2>
              <span className="text-xs font-bold text-secondary bg-secondary px-2 py-1 rounded-md">
                {progress.completedVideoIds.length} / {course.videos.length} Done
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {course.videos.map((video, idx) => {
                const unlocked = isVideoUnlocked(video.id);
                const active = video.id === currentVideoId;
                const completed = progress.completedVideoIds.includes(video.id);

                return (
                  <button
                    key={video.id}
                    disabled={!unlocked}
                    onClick={() => onVideoSelect(video.id)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group",
                      active 
                        ? "bg-accent/10 border-accent shadow-lg shadow-accent/5" 
                        : "bg-secondary/30 border-primary hover:bg-secondary/50",
                      !unlocked && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    <div className="relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border border-primary">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {completed && (
                        <div className="absolute inset-0 bg-accent/40 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-white fill-accent" />
                        </div>
                      )}
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white/70" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-[10px] font-bold text-white px-1 rounded">
                        {video.duration}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                          Video {idx + 1}
                        </span>
                        {active && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                        )}
                      </div>
                      <h3 className={cn(
                        "text-sm font-semibold truncate group-hover:text-accent transition-colors",
                        active ? "text-accent" : "text-primary"
                      )}>
                        {video.title}
                      </h3>
                      {!unlocked && (
                        <p className="text-[10px] font-medium text-secondary flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Complete previous video to unlock
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function List({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}
