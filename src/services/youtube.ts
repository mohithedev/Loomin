import axios from 'axios';
import { Video, Course } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const extractPlaylistId = (url: string): string | null => {
  const regExp = /[&?]list=([^#&?]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

export const fetchPlaylistData = async (playlistId: string): Promise<Partial<Course>> => {
  if (!API_KEY) {
    throw new Error('YouTube API Key is missing. Please add NEXT_PUBLIC_YOUTUBE_API_KEY to your secrets.');
  }

  try {
    // Fetch Playlist Details
    const playlistResponse = await axios.get(`${BASE_URL}/playlists`, {
      params: {
        part: 'snippet,contentDetails',
        id: playlistId,
        key: API_KEY,
      },
    });

    if (!playlistResponse.data.items?.length) {
      throw new Error('Playlist not found');
    }

    const playlist = playlistResponse.data.items[0];
    
    // Fetch ALL Playlist Items (paginate through all results)
    const videos: Video[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = 100; // Safety limit to prevent infinite loops
    
    do {
      const itemsResponse: any = await axios.get(`${BASE_URL}/playlistItems`, {
        params: {
          part: 'snippet,contentDetails',
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken,
          key: API_KEY,
        },
      });

      const pageVideos = itemsResponse.data.items.map((item: any) => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        position: item.snippet.position,
        description: item.snippet.description,
        duration: '0:00',
      }));
      
      videos.push(...pageVideos);
      nextPageToken = itemsResponse.data.nextPageToken;
      pageCount++;
    } while (nextPageToken && pageCount < maxPages);

    // Fetch Video Durations (in batches of 50 since API limit)
    const videoIds = videos.map(v => v.id);
    const durationMap = new Map();
    
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50).join(',');
      const videosResponse = await axios.get(`${BASE_URL}/videos`, {
        params: {
          part: 'contentDetails',
          id: batch,
          key: API_KEY,
        },
      });

      videosResponse.data.items.forEach((item: any) => {
        durationMap.set(item.id, parseISO8601Duration(item.contentDetails.duration));
      });
    }

    videos.forEach(v => {
      v.duration = durationMap.get(v.id) || '0:00';
    });

    return {
      playlistId,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails?.high?.url || playlist.snippet.thumbnails?.default?.url,
      videos,
    };
  } catch (error: any) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
};

function parseISO8601Duration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
