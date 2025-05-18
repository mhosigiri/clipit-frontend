import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface Clip {
  id: number;
  path: string;
  start_time: number;
  end_time: number;
  duration: number;
  score: number;
}

export interface AnalyzeResponse {
  clips: Clip[];
  memory_id: string;
}

export interface FeedbackRequest {
  memory_id: string;
  is_accurate: boolean;
  feedback_text?: string;
}

export interface StatsResponse {
  total_extractions: number;
  feedback_received: number;
  accurate_percentage: number;
  inaccurate_percentage: number;
}

export const analyzeVideo = async (videoFile: File, prompt: string, clipCount: number = 3) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('prompt', prompt);
  formData.append('clip_count', clipCount.toString());

  return axios.post<AnalyzeResponse>(`${API_URL}/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getClipUrl = (clipPath: string) => {
  return `${API_URL}${clipPath}`;
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