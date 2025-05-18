import { useState } from 'react';
import { submitFeedback } from '../api/client';

interface FeedbackFormProps {
  videoId: string;
  prompt: string;
  onFeedbackSubmitted: () => void;
}

export default function FeedbackForm({ videoId, prompt, onFeedbackSubmitted }: FeedbackFormProps) {
  const [isSatisfied, setIsSatisfied] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSatisfied === null) {
      setError('Please select whether you liked the clip or not');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitFeedback({
        video_id: videoId,
        prompt: prompt,
        satisfied: isSatisfied,
        feedback_text: feedbackText || undefined
      });
      
      setSubmitted(true);
      onFeedbackSubmitted();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
        <p className="text-green-700 font-medium">Thank you for your feedback!</p>
        <p className="text-green-600 text-sm mt-1">
          Your input helps improve future clip extractions.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-6 border border-green-100">
      <h3 className="text-lg font-medium text-green-800 mb-3">How was the clip?</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setIsSatisfied(true)}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              isSatisfied === true
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👍 Great!
          </button>
          
          <button
            type="button"
            onClick={() => setIsSatisfied(false)}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              isSatisfied === false
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👎 Not Great
          </button>
        </div>
        
        <div>
          <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 mb-1">
            Additional feedback (optional)
          </label>
          <textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what could be improved..."
            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || isSatisfied === null}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
            isSubmitting || isSatisfied === null
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}