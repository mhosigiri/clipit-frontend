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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">ClipIt</h1>
          <p className="text-lg text-slate-600 font-medium">AI-Powered Video Clip Extraction</p>
        </div>
        
        <div className={`text-sm text-center mb-6 flex items-center justify-center gap-2 ${
          backendStatus === 'connected' ? 'text-emerald-600' : 
          backendStatus === 'disconnected' ? 'text-orange-500' : 'text-blue-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 
            backendStatus === 'disconnected' ? 'bg-orange-400' : 'bg-blue-400 animate-pulse'
          }`}></div>
          {backendStatus === 'connected' ? '✨ Connected to AI Server' : 
           backendStatus === 'disconnected' ? '🔄 Connecting to server...' : 
           '⏳ Initializing...'}
        </div>
        
        {/* Stats Display */}
        <StatsDisplay />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-blue-200 rounded-xl p-10 text-center hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg"
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
                  <div className="text-blue-700 font-semibold text-lg">📁 {file.name}</div>
                ) : (
                  <div className="text-blue-600">
                    <div className="text-4xl mb-3">🎬</div>
                    <div className="font-semibold text-lg mb-1">Upload your video</div>
                    <div className="text-sm text-slate-500">Drag & drop or click to select</div>
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
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                placeholder="e.g., action scenes, emotional moments, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file || backendStatus !== 'connected'}
              className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-all duration-300 transform ${
                  loading || !file || backendStatus !== 'connected'
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                }`}
            >
              {loading ? "🚀 Processing with AI..." : backendStatus !== 'connected' ? "⏳ Connecting..." : "✨ Extract Clip with AI"}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-xl border border-red-100/50 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">🎬 Your AI-Generated Clip</h2>
            <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-xl shadow-lg"
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