import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minlength: [3, "Lesson title must be at least 3 characters"],
    },
    description: {
      type: String,
      required: [true, "Lesson description is required"],
      minlength: [10, "Lesson description must be at least 10 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    order: {
      type: Number,
      required: true,
    },
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["pdf", "link", "document"],
          default: "link",
        },
      },
    ],
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      minlength: [10, "Short description must be at least 10 characters"],
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Programming",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Other",
      ],
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    whatYouWillLearn: [
      {
        type: String,
        trim: true,
      },
    ],
    lessons: [lessonSchema],
    totalDuration: {
      type: Number,
      default: 0,
    },
    enrolledStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reviews: [reviewSchema],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update rating when reviews change
courseSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  }
};

// Update published date when publishing
courseSchema.pre("save", function (next) {
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Calculate total duration from lessons
courseSchema.pre("save", function (next) {
  if (this.isModified("lessons")) {
    this.totalDuration = this.lessons.reduce(
      (total, lesson) => total + lesson.duration,
      0
    );
  }
  next();
});

export default mongoose.model("Course", courseSchema);
