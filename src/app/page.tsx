"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { analyzeVideo, checkHealth } from "./api/client";
import FeedbackForm from "./components/FeedbackForm";
import StatsDisplay from "./components/StatsDisplay";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected'|'disconnected'|'checking'>('checking');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await checkHealth();
        setBackendStatus('connected');
      } catch (err) {
        console.error("Backend health check failed:", err);
        setBackendStatus('disconnected');
      }
    };
    
    checkBackendStatus();
    // Poll the backend status every 10 seconds
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type.startsWith("video/")) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a video file");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile?.type.startsWith("video/")) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a video file");
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file");
      return;
    }
    
    if (backendStatus !== 'connected') {
      setError("Server is not connected. Please start the backend server.");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setVideoId(null);
    setShowFeedback(false);

    try {
      const response = await analyzeVideo(file, prompt);
      setVideoUrl(response.videoUrl);
      setVideoId(response.video_id);
      setShowFeedback(true);
    } catch (err: any) {
      console.error("Video processing error:", err);
      if (err.message?.includes("Network Error")) {
        setError("Could not connect to the server. Please ensure the backend is running.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to process video");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmitted = () => {
    // Reset the form after feedback
    setShowFeedback(false);
  }

  return (
    <main className="min-h-screen">
      <div className="app-container">
        <h1 className="text-3xl font-bold mb-2 text-center text-green-800">ClipIt</h1>
        
        <div className={`text-sm text-center mb-6 ${
          backendStatus === 'connected' ? 'text-green-600' : 
          backendStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {backendStatus === 'connected' ? 'Server connected - Powered by Gemini AI' : 
           backendStatus === 'disconnected' ? 'Server disconnected - please run start.sh' : 
           'Checking server status...'}
        </div>
        
        {/* Stats Display */}
        <StatsDisplay />

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-green-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-green-200 rounded-lg p-8 text-center hover:border-green-500 transition-colors bg-green-50"
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer block">
                {file ? (
                  <div className="text-green-700 font-medium">Selected: {file.name}</div>
                ) : (
                  <div className="text-green-600">
                    Drag and drop a video file here, or click to select
                  </div>
                )}
              </label>
            </div>

            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What kind of clip are you looking for?
              </label>
              <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., action scenes, emotional moments, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file || backendStatus !== 'connected'}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                ${
                  loading || !file || backendStatus !== 'connected'
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
            >
              {loading ? "Processing..." : backendStatus !== 'connected' ? "Server Disconnected" : "Extract Clip"}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {videoUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Your Clip</h2>
            <div className="w-full max-w-3xl mx-auto">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
            </div>
            
            {showFeedback && videoId && (
              <FeedbackForm 
                videoId={videoId}
                prompt={prompt}
                onFeedbackSubmitted={handleFeedbackSubmitted} 
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}