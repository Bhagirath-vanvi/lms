import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Async thunks
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`/courses?${queryString}`, {
        headers: {
          ...(auth.token && { Authorization: `Bearer ${auth.token}` }),
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

export const fetchCourse = createAsyncThunk(
  "courses/fetchCourse",
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`/courses/${courseId}`, {
        headers: {
          ...(auth.token && { Authorization: `Bearer ${auth.token}` }),
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course"
      );
    }
  }
);

export const enrollCourse = createAsyncThunk(
  "courses/enrollCourse",
  async ({ courseId, paymentId, orderId }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `/courses/${courseId}/enroll`,
        { paymentId, orderId },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Successfully enrolled in course!");
      return { courseId, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to enroll in course";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addLesson = createAsyncThunk(
  "courses/addLesson",
  async ({ courseId, lessonData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `/courses/${courseId}/lessons`,
        lessonData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Lesson added successfully!");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add lesson";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateLesson = createAsyncThunk(
  "courses/updateLesson",
  async ({ courseId, lessonId, lessonData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(
        `/courses/${courseId}/lessons/${lessonId}`,
        lessonData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Lesson updated successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update lesson";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteLesson = createAsyncThunk(
  "courses/deleteLesson",
  async ({ courseId, lessonId }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`/courses/${courseId}/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      toast.success("Lesson deleted successfully!");
      return { courseId, lessonId };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete lesson";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createCourse = createAsyncThunk(
  "courses/createCourse",
  async (courseData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post("/courses", courseData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      toast.success("Course created successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create course";
      return rejectWithValue(message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  "courses/updateCourse",
  async ({ courseId, courseData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`/courses/${courseId}`, courseData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      toast.success("Course updated successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update course";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "courses/deleteCourse",
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      toast.success("Course deleted successfully!");
      return courseId;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete course";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrolledCourses = createAsyncThunk(
  "courses/fetchEnrolledCourses",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get("/courses/enrolled", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch enrolled courses"
      );
    }
  }
);

export const unenrollCourse = createAsyncThunk(
  "courses/unenrollCourse",
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `/courses/${courseId}/unenroll`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Successfully unenrolled from course!");
      return { courseId, message: response.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to unenroll from course";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchInstructorCourses = createAsyncThunk(
  "courses/fetchInstructorCourses",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get("/courses/instructor/my-courses", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch instructor courses"
      );
    }
  }
);

export const addReview = createAsyncThunk(
  "courses/addReview",
  async ({ courseId, reviewData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `/courses/${courseId}/reviews`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      toast.success("Review added successfully!");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add review";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  "courses/updateLessonProgress",
  async ({ courseId, lessonId, completed }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(
        `/courses/${courseId}/lessons/${lessonId}/progress`,
        { completed },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update progress";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  courses: [],
  enrolledCourses: [],
  currentCourse: null,
  instructorCourses: [],
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  filters: {
    category: "all",
    level: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.courses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Single Course
      .addCase(fetchCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload.course;
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.unshift(action.payload.course);
        state.instructorCourses.unshift(action.payload.course);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCourse = action.payload.course;
        const index = state.courses.findIndex(
          (course) => course._id === updatedCourse._id
        );
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        const instructorIndex = state.instructorCourses.findIndex(
          (course) => course._id === updatedCourse._id
        );
        if (instructorIndex !== -1) {
          state.instructorCourses[instructorIndex] = updatedCourse;
        }
        if (
          state.currentCourse &&
          state.currentCourse._id === updatedCourse._id
        ) {
          state.currentCourse = { ...state.currentCourse, ...updatedCourse };
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter(
          (course) => course._id !== action.payload
        );
        state.instructorCourses = state.instructorCourses.filter(
          (course) => course._id !== action.payload
        );
        if (state.currentCourse && state.currentCourse._id === action.payload) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Enroll Course
      .addCase(enrollCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(enrollCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        if (
          state.currentCourse &&
          state.currentCourse._id === action.payload.courseId
        ) {
          state.currentCourse.enrollmentInfo = {
            isEnrolled: true,
            enrolledAt: new Date().toISOString(),
            completedLessons: [],
            progress: 0,
            isCompleted: false,
            completedAt: null,
          };
        }
      })
      .addCase(enrollCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add Lesson
      .addCase(addLesson.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentCourse) {
          state.currentCourse.lessons.push(action.payload.lesson);
        }
      })
      .addCase(addLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Lesson
      .addCase(updateLesson.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentCourse) {
          const lessonIndex = state.currentCourse.lessons.findIndex(
            (lesson) => lesson._id === action.payload.lesson._id
          );
          if (lessonIndex !== -1) {
            state.currentCourse.lessons[lessonIndex] = action.payload.lesson;
          }
        }
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Lesson
      .addCase(deleteLesson.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentCourse) {
          state.currentCourse.lessons = state.currentCourse.lessons.filter(
            (lesson) => lesson._id !== action.payload.lessonId
          );
        }
      })
      .addCase(deleteLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Lesson Progress
      .addCase(updateLessonProgress.pending, (state) => {
        state.isLoading = false; // Don't show loading for progress updates
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update current course enrollment info
        if (state.currentCourse && state.currentCourse.enrollmentInfo) {
          state.currentCourse.enrollmentInfo.progress = action.payload.progress;
          state.currentCourse.enrollmentInfo.isCompleted =
            action.payload.isCompleted;
          state.currentCourse.enrollmentInfo.completedAt =
            action.payload.completedAt;
        }
      })
      .addCase(updateLessonProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Enrolled Courses
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrolledCourses = action.payload.courses;
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Unenroll Course
      .addCase(unenrollCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unenrollCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrolledCourses = state.enrolledCourses.filter(
          (course) => course._id !== action.payload.courseId
        );
        if (
          state.currentCourse &&
          state.currentCourse._id === action.payload.courseId
        ) {
          state.currentCourse.enrollmentInfo = null;
        }
      })
      .addCase(unenrollCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Instructor Courses
      .addCase(fetchInstructorCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instructorCourses = action.payload.courses;
      })
      .addCase(fetchInstructorCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add Review
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentCourse) {
          state.currentCourse.reviews.push(action.payload.review);
          // Update rating if provided
          if (action.payload.course?.rating) {
            state.currentCourse.rating = action.payload.course.rating;
          }
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearCurrentCourse, clearError, setLoading } =
  courseSlice.actions;
export default courseSlice.reducer;
