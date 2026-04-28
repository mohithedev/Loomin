'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, BookOpen, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeVideo } from '../services/gemini';

interface GeminiAnalysisProps {
  videoTitle: string;
  description: string;
  videoId: string;
}

export const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ videoTitle, description, videoId }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await analyzeVideo(videoTitle, description);
        if (result) {
          setAnalysis(result);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [videoId]);

  if (error && !analysis) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4">
      <div className="flex items-center gap-2 text-accent">
        <Sparkles className="w-5 h-5 fill-accent/20" />
        <h3 className="font-bold tracking-tight">Gemini AI Insights</h3>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-secondary text-sm"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing video content...</span>
          </motion.div>
        ) : analysis ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <BookOpen className="w-3 h-3" />
                <span>Summary</span>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" />
                <span>Key Learning Points</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.keyPoints.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-secondary bg-primary/50 p-2 rounded-lg border border-primary">
                    <span className="text-accent font-bold">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-2">
              <span className="text-[10px] font-bold px-2 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
                {analysis.category}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
