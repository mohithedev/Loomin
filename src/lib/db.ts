import { supabase } from './supabase';
import { Course, Video, UserProgress } from '../types';

// ===== COURSES =====

export const createCourse = async (
  userId: string,
  courseData: Partial<Course>
) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([
      {
        user_id: userId,
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        playlist_id: courseData.playlistId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserCourses = async (userId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getCourseById = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data;
};

export const deleteCourse = async (courseId: string) => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
};

// ===== VIDEOS =====

export const createVideos = async (
  courseId: string,
  videos: Partial<Video>[]
) => {
  const videoData = videos.map((video, index) => ({
    course_id: courseId,
    youtube_id: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail,
    duration: video.duration,
    position: index,
  }));

  const { data, error } = await supabase
    .from('videos')
    .insert(videoData)
    .select();

  if (error) throw error;
  return data;
};

export const getCourseVideos = async (courseId: string) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', courseId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data;
};

// ===== USER PROGRESS =====

export const getUserProgress = async (
  userId: string,
  courseId: string
): Promise<UserProgress | null> => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // 404 is expected
  return data || null;
};

export const updateUserProgress = async (
  userId: string,
  courseId: string,
  completedVideoIds: string[],
  lastWatchedVideoId?: string
) => {
  const existingProgress = await getUserProgress(userId, courseId);

  if (existingProgress) {
    // Update existing
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        completed_video_ids: completedVideoIds,
        watch_progress: { lastWatchedVideoId: lastWatchedVideoId || null },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          completed_video_ids: completedVideoIds,
          watch_progress: { lastWatchedVideoId: lastWatchedVideoId || null },
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const markVideoComplete = async (
  userId: string,
  courseId: string,
  videoId: string
) => {
  const progress = await getUserProgress(userId, courseId);
  const completedIds = progress?.completedVideoIds || [];

  if (!completedIds.includes(videoId)) {
    completedIds.push(videoId);
  }

  return updateUserProgress(userId, courseId, completedIds);
};

export const updateVideoProgress = async (
  userId: string,
  courseId: string,
  videoId: string,
  percentage: number
) => {
  const progress = await getUserProgress(userId, courseId);

  return updateUserProgress(userId, courseId, progress?.completedVideoIds || [], videoId);
};

// ===== PROFILES =====

export const createProfile = async (
  userId: string,
  profileData?: { username?: string; fullName?: string }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        username: profileData?.username,
        full_name: profileData?.fullName,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateProfile = async (
  userId: string,
  profileData: { username?: string; fullName?: string; avatarUrl?: string }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: profileData.username,
      full_name: profileData.fullName,
      avatar_url: profileData.avatarUrl,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserPlan = async (userId: string) => {
  const profile = await getProfile(userId);
  return profile?.plan || 'free';
};
