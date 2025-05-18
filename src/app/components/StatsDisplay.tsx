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

  if (!stats || stats.total_extractions === 0) {
    return null; // Hide stats if none available
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-green-100">
      <h3 className="text-lg font-medium text-green-800 mb-3">Clip Extraction Stats</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Total Extractions</p>
          <p className="text-2xl font-bold text-green-800">{stats.total_extractions}</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Feedback Received</p>
          <p className="text-2xl font-bold text-green-800">{stats.feedback_received}</p>
        </div>
        
        {stats.feedback_received > 0 && (
          <>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Accuracy Rate</p>
              <p className="text-2xl font-bold text-green-800">{Math.round(stats.accurate_percentage)}%</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Need Improvement</p>
              <p className="text-2xl font-bold text-red-800">{Math.round(stats.inaccurate_percentage)}%</p>
            </div>
          </>
        )}
      </div>
      
      {stats.feedback_received > 0 && stats.accurate_percentage >= 80 && (
        <div className="mt-3 text-sm text-green-600 text-center">
          Gemini AI is learning from your feedback to deliver better clips! 🚀
        </div>
      )}
    </div>
  );
}