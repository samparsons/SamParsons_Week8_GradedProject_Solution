import axiosInstance from "../api/axiosInstance.js";
import { THREAD_API, COMMENT_API } from "../config/apiConfig.js";

const getStoredToken = () => {
  if (
    typeof localStorage !== "undefined" &&
    typeof localStorage.getItem === "function"
  ) {
    return localStorage.getItem("token");
  }

  return null;
};

const getAuthHeaders = (token) => {
  const storedToken = getStoredToken();
  const authToken = token || storedToken;
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

export const getAllQuestions = async (token) => {
  const res = await axiosInstance.get(THREAD_API.GET_ALL, {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};

export const getQuestionById = async (id, token) => {
  const res = await axiosInstance.get(THREAD_API.GET_BY_ID(id), {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};

export const upvoteQuestion = async (questionId, token) => {
  const res = await axiosInstance.post(THREAD_API.UPVOTE(questionId), null, {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};

export const downvoteQuestion = async (questionId, token) => {
  const res = await axiosInstance.post(THREAD_API.DOWNVOTE(questionId), null, {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};

export const createQuestion = async (questionData, token) => {
  const mappedPayload = {
    ...questionData,
    content:
      questionData.content ??
      questionData.description ??
      questionData.body ??
      "",
    subreddit:
      questionData.subreddit ??
      (Array.isArray(questionData.tags) && questionData.tags.length
        ? questionData.tags[0]?._id || questionData.tags[0]
        : undefined),
  };

  const res = await axiosInstance.post(THREAD_API.CREATE, mappedPayload, {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};

export const getAnswersByQuestionId = async (questionId, token) => {
  const res = await axiosInstance.get(COMMENT_API.GET_BY_THREAD(questionId), {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};

export const createAnswerForQuestion = async (questionId, answerText, token) => {
  const res = await axiosInstance.post(
    COMMENT_API.CREATE,
    { thread: questionId, content: answerText },
    { headers: getAuthHeaders(token) },
  );
  return res.data.data;
};

export const upvoteAnswer = async (answerId, token) => {
  const res = await axiosInstance.post(COMMENT_API.UPVOTE(answerId), null, {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};

export const downvoteAnswer = async (answerId, token) => {
  const res = await axiosInstance.post(COMMENT_API.DOWNVOTE(answerId), null, {
    headers: getAuthHeaders(token),
  });
  return res.data.data;
};
