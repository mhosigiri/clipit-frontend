import { useEffect, useState } from 'react';
import { getStats, StatsResponse } from '../api/client';

export default function StatsDisplay() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getStats();
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse w-full h-16 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return null; // Hide stats on error
  }

  if (!stats || stats.total_clips === 0) {
    return null; // Hide stats if none available
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-green-100">
      <h3 className="text-lg font-medium text-green-800 mb-3">Clip Extraction Stats</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Total Clips</p>
          <p className="text-2xl font-bold text-green-800">{stats.total_clips}</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Feedback Received</p>
          <p className="text-2xl font-bold text-green-800">{stats.feedback_count}</p>
        </div>
        
        {stats.feedback_count > 0 && (
          <>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-green-800">{Math.round(stats.satisfaction_rate * 100)}%</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Positive Feedback</p>
              <p className="text-2xl font-bold text-blue-800">{stats.positive_feedback}</p>
            </div>
          </>
        )}
      </div>
      
      {stats.feedback_count > 0 && stats.satisfaction_rate >= 0.8 && (
        <div className="mt-3 text-sm text-green-600 text-center">
          Gemini AI is learning from your feedback to deliver better clips! 🚀
        </div>
      )}
    </div>
  );
}