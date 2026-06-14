import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login as loginAPI, register as registerAPI } from "../services/authService";
import { handleApiError } from "../utils/handleApiError";

const parseStoredUser = () => {
	const storedUser = localStorage.getItem("user");
	if (!storedUser) return null;

	try {
		return JSON.parse(storedUser);
	} catch {
		return null;
	}
};

const initialState = {
	token: localStorage.getItem("token") || null,
	user: parseStoredUser(),
	loading: false,
	error: null,
	registrationSuccess: false,
};

export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (credentials, { rejectWithValue }) => {
		try {
			return await loginAPI(credentials);
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	},
);

export const registerUser = createAsyncThunk(
	"auth/registerUser",
	async (formData, { rejectWithValue }) => {
		try {
			return await registerAPI(formData);
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	},
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		saveUser: (state, action) => {
			state.user = {
				...(state.user || {}),
				...action.payload,
			};
			localStorage.setItem("user", JSON.stringify(state.user));
		},
		clearAuthState: (state) => {
			state.loading = false;
			state.error = null;
			state.registrationSuccess = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.loading = false;
				state.token = action.payload.token;
				state.user = action.payload.user;
				localStorage.setItem("token", action.payload.token);
				localStorage.setItem("user", JSON.stringify(action.payload.user));
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(registerUser.pending, (state) => {
				state.loading = true;
				state.error = null;
				state.registrationSuccess = false;
			})
			.addCase(registerUser.fulfilled, (state) => {
				state.loading = false;
				state.registrationSuccess = true;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.registrationSuccess = false;
			})
			.addCase(logoutUser.fulfilled, (state) => {
				state.token = null;
				state.user = null;
				state.error = null;
				state.loading = false;
				state.registrationSuccess = false;
			});
	},
});

export const { saveUser, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
