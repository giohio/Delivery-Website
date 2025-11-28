import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { ratingApi, CreateRatingRequest } from '../../services/ratingApi';

interface RatingModalProps {
  deliveryId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ deliveryId, onClose, onSuccess }) => {
  const [rating, setRating] = useState<CreateRatingRequest>({
    score: 0,
    comment: '',
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating.score === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ratingApi.createRating(deliveryId, rating);
      alert('Rating submitted successfully! Thank you for your feedback.');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit rating';
      setError(errorMessage);
      console.error('Rating submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Rate Delivery</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">How was your delivery experience?</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating({ ...rating, score: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoveredStar || rating.score)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating.score > 0 && (
              <p className="mt-2 text-sm font-medium text-gray-700">
                {rating.score === 1 && 'Poor'}
                {rating.score === 2 && 'Fair'}
                {rating.score === 3 && 'Good'}
                {rating.score === 4 && 'Very Good'}
                {rating.score === 5 && 'Excellent'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={rating.comment}
              onChange={(e) => setRating({ ...rating, comment: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Tell us about your experience..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating.score === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
