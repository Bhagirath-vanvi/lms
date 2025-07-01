import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Course",
    "User",
    "Analytics",
    "AdminDashboard",
    "UserStats",
    "CourseStats",
    "RecentActivities",
  ],
  endpoints: (builder) => ({
    // Enhanced Admin Dashboard endpoints
    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),

    getAdminUserStats: builder.query({
      query: () => "/admin/users/stats",
      providesTags: ["UserStats"],
    }),

    getAdminCourseStats: builder.query({
      query: () => "/admin/courses/stats",
      providesTags: ["CourseStats"],
    }),

    getRecentActivities: builder.query({
      query: (limit = 20) => `/admin/recent-activities?limit=${limit}`,
      providesTags: ["RecentActivities"],
    }),

    // Enhanced course management
    getAdminCourses: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/admin/courses?${queryString}`;
      },
      providesTags: ["Course"],
    }),

    featureCourse: builder.mutation({
      query: ({ courseId, featured }) => ({
        url: `/admin/courses/${courseId}/feature`,
        method: "POST",
        body: { featured },
      }),
      invalidatesTags: ["Course", "AdminDashboard"],
    }),

    // Analytics endpoints
    getInstructorAnalytics: builder.query({
      query: () => "/analytics/instructor",
      providesTags: ["Analytics"],
    }),
    getStudentAnalytics: builder.query({
      query: () => "/analytics/student",
      providesTags: ["Analytics"],
    }),
    getAdminAnalytics: builder.query({
      query: () => "/analytics/admin",
      providesTags: ["Analytics"],
    }),
    getPublicStats: builder.query({
      query: () => "/analytics/public",
      providesTags: ["Analytics"],
    }),

    // Course progress endpoints
    updateLessonProgress: builder.mutation({
      query: ({ courseId, lessonId, completed }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/progress`,
        method: "PUT",
        body: { completed },
      }),
      invalidatesTags: ["Course", "Analytics"],
    }),

    // User management endpoints
    getUsers: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/users?${queryString}`;
      },
      providesTags: ["User"],
    }),

    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["User", "UserStats", "AdminDashboard"],
    }),

    updateUserStatus: builder.mutation({
      query: ({ userId, isActive }) => ({
        url: `/users/${userId}/status`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: ["User", "UserStats", "AdminDashboard"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "UserStats", "AdminDashboard"],
    }),

    // Course management endpoints
    getCourses: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/courses?${queryString}`;
      },
      providesTags: ["Course"],
    }),

    updateCourse: builder.mutation({
      query: ({ id, ...courseData }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: courseData,
      }),
      invalidatesTags: ["Course", "CourseStats", "AdminDashboard"],
    }),

    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course", "CourseStats", "AdminDashboard"],
    }),

    // File upload endpoints
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/upload/image",
        method: "POST",
        body: formData,
      }),
    }),

    uploadVideo: builder.mutation({
      query: (formData) => ({
        url: "/upload/video",
        method: "POST",
        body: formData,
      }),
    }),

    deleteFile: builder.mutation({
      query: ({ publicId, resourceType = "image" }) => ({
        url: `/upload/${publicId}?resourceType=${resourceType}`,
        method: "DELETE",
      }),
    }),

    // Additional admin endpoints for comprehensive reporting
    getTopInstructors: builder.query({
      query: (limit = 10) => `/admin/instructors/top?limit=${limit}`,
      providesTags: ["Analytics"],
    }),

    getPlatformMetrics: builder.query({
      query: (dateRange = "30days") => `/admin/metrics?range=${dateRange}`,
      providesTags: ["Analytics"],
    }),

    exportReportData: builder.query({
      query: ({ reportType, dateRange, format = "json" }) =>
        `/admin/reports/export?type=${reportType}&range=${dateRange}&format=${format}`,
      providesTags: ["Analytics"],
    }),

    // Revenue and financial analytics
    getRevenueAnalytics: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/admin/revenue/analytics?${queryString}`;
      },
      providesTags: ["Analytics"],
    }),

    // Course category analytics
    getCategoryAnalytics: builder.query({
      query: () => "/admin/categories/analytics",
      providesTags: ["CourseStats"],
    }),

    // User engagement metrics
    getUserEngagementMetrics: builder.query({
      query: (dateRange = "30days") =>
        `/admin/engagement/metrics?range=${dateRange}`,
      providesTags: ["UserStats"],
    }),
  }),
});

export const {
  // Admin Dashboard hooks
  useGetAdminDashboardQuery,
  useGetAdminUserStatsQuery,
  useGetAdminCourseStatsQuery,
  useGetRecentActivitiesQuery,

  // Enhanced course management hooks
  useGetAdminCoursesQuery,
  useFeatureCourseMutation,

  // Existing hooks
  useGetInstructorAnalyticsQuery,
  useGetStudentAnalyticsQuery,
  useGetAdminAnalyticsQuery,
  useGetPublicStatsQuery,
  useUpdateLessonProgressMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetCoursesQuery,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useUploadImageMutation,
  useUploadVideoMutation,
  useDeleteFileMutation,

  // New analytics hooks
  useGetTopInstructorsQuery,
  useGetPlatformMetricsQuery,
  useExportReportDataQuery,
  useGetRevenueAnalyticsQuery,
  useGetCategoryAnalyticsQuery,
  useGetUserEngagementMetricsQuery,
} = apiSlice;
