import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface FeedbackRequest {
  video_id: string;
  prompt: string;
  satisfied: boolean;
  feedback_text?: string;
}

export interface StatsResponse {
  total_clips: number;
  feedback_count: number;
  positive_feedback: number;
  satisfaction_rate: number;
}

export const analyzeVideo = async (videoFile: File, prompt: string) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('prompt', prompt);

  const response = await axios.post(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });

  // Create a URL for the blob
  const videoUrl = URL.createObjectURL(response.data);
  
  // Extract video_id from the filename in the Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  let video_id = 'unknown';
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      const filename = filenameMatch[1];
      // Extract video_id from filename format: {video_id}_snippet.mp4
      video_id = filename.split('_')[0];
    }
  }

  return {
    videoUrl,
    video_id
  };
};

export const submitFeedback = async (feedback: FeedbackRequest) => {
  return axios.post(`${API_URL}/feedback`, feedback, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getStats = async () => {
  return axios.get<StatsResponse>(`${API_URL}/stats`);
};

export const checkHealth = async () => {
  return axios.get(`${API_URL}/health`);
};