import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  upvoteQuestion,
  downvoteQuestion,
  createAnswerForQuestion,
} from "../services/questionService.js";
import { upvoteAnswer, downvoteAnswer } from "../services/answerService.js";

const initialState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
};

export const fetchQuestions = createAsyncThunk(
  "question/fetchQuestions",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllQuestions();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch questions",
      );
    }
  },
);

export const fetchQuestionById = createAsyncThunk(
  "question/fetchQuestionById",
  async (id, { rejectWithValue }) => {
    try {
      return await getQuestionById(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch question",
      );
    }
  },
);

export const postQuestion = createAsyncThunk(
  "question/postQuestion",
  async ({ title, description, tags }, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().user;
      return await createQuestion(
        { title, description, tags, author: userInfo.userId },
        userInfo.token,
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to post question",
      );
    }
  },
);

export const voteQuestion = createAsyncThunk(
  "question/voteQuestion",
  async ({ question, voteType }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user.userInfo;
      if (voteType === "upvote") {
        return await upvoteQuestion(question._id, token);
      }
      return await downvoteQuestion(question._id, token);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to vote on question",
      );
    }
  },
);

export const voteAnswer = createAsyncThunk(
  "question/voteAnswer",
  async ({ answer, voteType }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user.userInfo;
      if (voteType === "upvote") {
        return await upvoteAnswer(answer._id, token);
      }
      return await downvoteAnswer(answer._id, token);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to vote on answer",
      );
    }
  },
);

export const postAnswer = createAsyncThunk(
  "question/postAnswer",
  async ({ questionId, answerText }, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().user;
      return await createAnswerForQuestion(
        questionId,
        answerText,
        userInfo.token,
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to post answer",
      );
    }
  },
);

const questionSlice = createSlice({
  name: "question",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(postQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(postQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.push(action.payload);
        state.currentQuestion = action.payload;
      })
      .addCase(postQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(voteQuestion.pending, (state) => {
        state.error = null;
      })
      .addCase(voteQuestion.fulfilled, (state, action) => {
        const { upvotes, downvotes, voteCount } = action.payload;
        const questionId = action.meta.arg.question._id;

        const questionIndex = state.questions.findIndex(
          (question) => question._id === questionId,
        );

        if (questionIndex !== -1) {
          state.questions[questionIndex] = {
            ...state.questions[questionIndex],
            upvotes,
            downvotes,
            voteCount,
          };
        }

        if (
          state.currentQuestion &&
          state.currentQuestion._id === questionId
        ) {
          state.currentQuestion = {
            ...state.currentQuestion,
            upvotes,
            downvotes,
            voteCount,
          };
        }
      })
      .addCase(voteQuestion.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(voteAnswer.pending, (state) => {
        state.error = null;
      })
      .addCase(voteAnswer.fulfilled, (state, action) => {
        if (!state.currentQuestion?.answers?.length) {
          return;
        }

        const { _id, upvotes, downvotes, voteCount } = action.payload;
        const answerIndex = state.currentQuestion.answers.findIndex(
          (answer) => answer._id === _id,
        );

        if (answerIndex !== -1) {
          state.currentQuestion.answers[answerIndex] = {
            ...state.currentQuestion.answers[answerIndex],
            upvotes,
            downvotes,
            voteCount,
          };
        }
      })
      .addCase(voteAnswer.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(postAnswer.pending, (state) => {
        state.error = null;
      })
      .addCase(postAnswer.fulfilled, (state, action) => {
        if (!state.currentQuestion) {
          return;
        }

        if (!Array.isArray(state.currentQuestion.answers)) {
          state.currentQuestion.answers = [];
        }

        state.currentQuestion.answers.push(action.payload);
      })
      .addCase(postAnswer.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default questionSlice.reducer;
