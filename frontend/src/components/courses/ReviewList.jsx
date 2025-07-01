import { FiStar } from "react-icons/fi";
import { motion } from "framer-motion";

const ReviewList = ({ reviews }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <FiStar className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 dark:text-gray-400">
          No reviews yet. Be the first to review this course!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <motion.div
          key={review._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-start space-x-4">
            <img
              src={review.user?.avatar || "/placeholder.svg?height=40&width=40"}
              alt={review.user?.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    {review.user?.name}
                  </h5>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={
                          star <= review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300 dark:text-gray-600"
                        }
                        size={16}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewList;
