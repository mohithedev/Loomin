'use client';

import React, { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import Image from 'next/image';
import { Loader2, CheckCircle2, Lock, ChevronRight, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
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
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  course,
  progress,
  onVideoComplete,
  onVideoSelect,
  currentVideoId,
  isLoggedIn = false,
  onLoginRequired = () => {},
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0); // Track video watch percentage
  const [showWatchWarning, setShowWatchWarning] = useState(false); // Show warning modal

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

  // Track video progress every 2 seconds (reduced from 1s for better performance)
  useEffect(() => {
    if (!player || loading) return;

    const interval = setInterval(() => {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        setVideoProgress(Math.min(progress, 100));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [player, loading]);

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
          <div className="flex items-center justify-between pt-4 flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <button
                disabled={currentIndex === 0}
                onClick={() => onVideoSelect(course.videos[currentIndex - 1].id)}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold disabled:hover:bg-accent"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>
              <button
                disabled={currentIndex === course.videos.length - 1}
                onClick={() => {
                  // Check if user watched at least 60%
                  if (videoProgress < 60 && currentIndex < course.videos.length - 1) {
                    setShowWatchWarning(true);
                    return;
                  }
                  
                  // For guests, show login modal when clicking next
                  if (!isLoggedIn && !isVideoUnlocked(course.videos[currentIndex + 1].id)) {
                    onLoginRequired();
                    return;
                  }
                  // Mark current video as completed when moving to next
                  if (!progress.completedVideoIds.includes(currentVideoId)) {
                    onVideoComplete(currentVideoId);
                  }
                  setVideoProgress(0); // Reset progress for next video
                  onVideoSelect(course.videos[currentIndex + 1].id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold disabled:hover:bg-accent"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-500"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
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

      {/* Watch Progress Warning Modal */}
      <AnimatePresence>
        {showWatchWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setShowWatchWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-primary border border-primary rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Keep Watching!</h2>
                <p className="text-secondary">
                  You need to watch at least <span className="font-bold text-accent">60%</span> of the video before moving to the next one.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-secondary">Current Progress</p>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-500"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm font-bold text-accent">{Math.round(videoProgress)}%</p>
              </div>

              <button
                onClick={() => setShowWatchWarning(false)}
                className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-all"
              >
                Continue Watching
              </button>
            </motion.div>
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
