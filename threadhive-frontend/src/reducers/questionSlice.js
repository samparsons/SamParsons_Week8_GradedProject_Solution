import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  upvoteQuestion,
  downvoteQuestion,
  getAnswersByQuestionId,
  createAnswerForQuestion,
  upvoteAnswer,
  downvoteAnswer,
} from "../services/questionService";
import { handleApiError } from "../utils/handleApiError";

const initialState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
};

const getStoredToken = () => {
  if (
    typeof localStorage !== "undefined" &&
    typeof localStorage.getItem === "function"
  ) {
    return localStorage.getItem("token");
  }

  return null;
};

const selectUserInfo = (state) => {
  if (state?.user?.userInfo) {
    return state.user.userInfo;
  }

  if (state?.auth?.token || state?.auth?.user) {
    return {
      token: state.auth.token,
      userId: state.auth.user?._id,
    };
  }

  return {
    token: getStoredToken(),
  };
};

export const fetchQuestions = createAsyncThunk(
  "questions/fetchQuestions",
  async (_, thunkAPI) => {
    try {
      const userInfo = selectUserInfo(thunkAPI.getState());
      return await getAllQuestions(userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  },
);

export const fetchQuestionById = createAsyncThunk(
  "questions/fetchQuestionById",
  async (id, thunkAPI) => {
    try {
      const userInfo = selectUserInfo(thunkAPI.getState());
      const question = await getQuestionById(id, userInfo.token);
      const answers = await getAnswersByQuestionId(id, userInfo.token);
      return {
        ...question,
        answers,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  },
);

export const postQuestion = createAsyncThunk(
  "questions/postQuestion",
  async ({ title, description, tags, subreddit, content }, thunkAPI) => {
    try {
      const userInfo = selectUserInfo(thunkAPI.getState());
      return await createQuestion(
        {
          title,
          description,
          tags,
          subreddit,
          content,
          author: userInfo.userId,
        },
        userInfo.token,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  },
);

export const voteQuestion = createAsyncThunk(
  "questions/voteQuestion",
  async ({ question, voteType }, thunkAPI) => {
    try {
      const userInfo = selectUserInfo(thunkAPI.getState());

      if (voteType === "upvote") {
        return await upvoteQuestion(question._id, userInfo.token);
      }

      return await downvoteQuestion(question._id, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  },
);

export const voteAnswer = createAsyncThunk(
  "questions/voteAnswer",
  async ({ answer, voteType }, thunkAPI) => {
    try {
      const userInfo = selectUserInfo(thunkAPI.getState());

      if (voteType === "upvote") {
        return await upvoteAnswer(answer._id, userInfo.token);
      }

      return await downvoteAnswer(answer._id, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  },
);

export const postAnswer = createAsyncThunk(
  "questions/postAnswer",
  async ({ questionId, answerText }, thunkAPI) => {
    try {
      const userInfo = selectUserInfo(thunkAPI.getState());
      return await createAnswerForQuestion(questionId, answerText, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(handleApiError(error));
    }
  },
);

const questionSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
      state.error = null;
    },
  },
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      .addCase(postQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.unshift(action.payload);
      })
      .addCase(postQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(voteQuestion.pending, (state) => {
        state.error = null;
      })
      .addCase(voteQuestion.fulfilled, (state, action) => {
        const updatedQuestion = action.payload;
        const questionIndex = state.questions.findIndex(
          (question) => question._id === updatedQuestion._id,
        );

        if (questionIndex !== -1) {
          state.questions[questionIndex] = {
            ...state.questions[questionIndex],
            upvotes: updatedQuestion.upvotes,
            downvotes: updatedQuestion.downvotes,
            voteCount: updatedQuestion.voteCount,
          };
        }

        if (
          state.currentQuestion &&
          state.currentQuestion._id === updatedQuestion._id
        ) {
          state.currentQuestion = {
            ...state.currentQuestion,
            upvotes: updatedQuestion.upvotes,
            downvotes: updatedQuestion.downvotes,
            voteCount: updatedQuestion.voteCount,
          };
        }
      })
      .addCase(voteQuestion.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(voteAnswer.pending, (state) => {
        state.error = null;
      })
      .addCase(voteAnswer.fulfilled, (state, action) => {
        if (!state.currentQuestion?.answers?.length) {
          return;
        }

        const updatedAnswer = action.payload;
        const answerIndex = state.currentQuestion.answers.findIndex(
          (answer) => answer._id === updatedAnswer._id,
        );

        if (answerIndex !== -1) {
          state.currentQuestion.answers[answerIndex] = {
            ...state.currentQuestion.answers[answerIndex],
            upvotedBy: updatedAnswer.upvotedBy,
            downvotedBy: updatedAnswer.downvotedBy,
            voteCount: updatedAnswer.voteCount,
            user: updatedAnswer.user,
            content: updatedAnswer.content,
          };
        }
      })
      .addCase(voteAnswer.rejected, (state, action) => {
        state.error = action.payload;
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
        state.error = action.payload;
      });
  },
});

export const { clearCurrentQuestion } = questionSlice.actions;
export default questionSlice.reducer;
