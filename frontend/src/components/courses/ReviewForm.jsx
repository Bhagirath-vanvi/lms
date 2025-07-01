import { useState } from "react";
import { FiStar } from "react-icons/fi";

const ReviewForm = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;

    onSubmit({
      rating,
      comment: comment.trim(),
    });

    setRating(0);
    setComment("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Write a Review
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl transition-colors duration-200"
              >
                <FiStar
                  className={
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Comment (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Share your thoughts about this course..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={rating === 0}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Submit Review
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
