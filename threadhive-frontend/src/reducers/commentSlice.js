import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
	fetchCommentsForThread,
	postComment,
	upvoteComment,
	downvoteComment,
} from "../services/commentService";
import { handleApiError } from "../utils/handleApiError";

const initialState = {
	comments: [],
	loading: false,
	posting: false,
	voting: false,
	error: null,
};

export const fetchCommentsThunk = createAsyncThunk(
	"comments/fetchByThread",
	async (threadId, { rejectWithValue }) => {
		try {
			return await fetchCommentsForThread(threadId);
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	},
);

export const postCommentThunk = createAsyncThunk(
	"comments/post",
	async ({ threadId, content }, { rejectWithValue }) => {
		try {
			return await postComment({ threadId, content });
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	},
);

export const upvoteCommentThunk = createAsyncThunk(
	"comments/upvote",
	async (commentId, { rejectWithValue }) => {
		try {
			return await upvoteComment(commentId);
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	},
);

export const downvoteCommentThunk = createAsyncThunk(
	"comments/downvote",
	async (commentId, { rejectWithValue }) => {
		try {
			return await downvoteComment(commentId);
		} catch (error) {
			return rejectWithValue(handleApiError(error));
		}
	},
);

const commentSlice = createSlice({
	name: "comments",
	initialState,
	reducers: {
		clearComments: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCommentsThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCommentsThunk.fulfilled, (state, action) => {
				state.loading = false;
				state.comments = action.payload;
			})
			.addCase(fetchCommentsThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(postCommentThunk.pending, (state) => {
				state.posting = true;
				state.error = null;
			})
			.addCase(postCommentThunk.fulfilled, (state, action) => {
				state.posting = false;
				state.comments.push(action.payload);
			})
			.addCase(postCommentThunk.rejected, (state, action) => {
				state.posting = false;
				state.error = action.payload;
			})
			.addCase(upvoteCommentThunk.pending, (state) => {
				state.voting = true;
				state.error = null;
			})
			.addCase(upvoteCommentThunk.fulfilled, (state, action) => {
				state.voting = false;
				const idx = state.comments.findIndex((c) => c._id === action.payload._id);
				if (idx !== -1) {
					state.comments[idx] = {
						...state.comments[idx],
						...action.payload,
					};
				}
			})
			.addCase(upvoteCommentThunk.rejected, (state, action) => {
				state.voting = false;
				state.error = action.payload;
			})
			.addCase(downvoteCommentThunk.pending, (state) => {
				state.voting = true;
				state.error = null;
			})
			.addCase(downvoteCommentThunk.fulfilled, (state, action) => {
				state.voting = false;
				const idx = state.comments.findIndex((c) => c._id === action.payload._id);
				if (idx !== -1) {
					state.comments[idx] = {
						...state.comments[idx],
						...action.payload,
					};
				}
			})
			.addCase(downvoteCommentThunk.rejected, (state, action) => {
				state.voting = false;
				state.error = action.payload;
			});
	},
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;
