import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// Set default axios config
axios.defaults.baseURL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Load user from token
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        setAuthToken(token);
        const response = await axios.get("/auth/me");
        return response.data;
      }
      return null;
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue(
        error.response?.data?.message || "Failed to load user"
      );
    }
  }
);

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/auth/register", userData);
      const { token, user } = response.data;

      setAuthToken(token);
      toast.success("Registration successful!");

      return { token, user };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post("/auth/login", credentials);
      const { token, user } = response.data;

      setAuthToken(token);
      toast.success("Login successful!");

      return { token, user };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put("/auth/profile", profileData);
      toast.success("Profile updated successfully!");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  setAuthToken(null);
  toast.success("Logged out successfully!");
});

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
