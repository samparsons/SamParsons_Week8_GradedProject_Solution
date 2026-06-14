import { describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import questionReducer, {
  fetchQuestions,
  fetchQuestionById,
  postQuestion,
  voteQuestion,
} from "../../src/reducers/questionSlice.js";

const createTestStore = () =>
  configureStore({
    reducer: {
      question: questionReducer,
      user: (
        state = {
          userInfo: {
            token: "mock-jwt-token-alice",
            userId: "user-1",
            name: "Alice Johnson",
          },
        },
      ) => state,
    },
  });

describe("questionFlow integration", () => {
  it("fetches all questions into list state", async () => {
    const store = createTestStore();

    const result = await store.dispatch(fetchQuestions());

    expect(result.type).toBe("question/fetchQuestions/fulfilled");
    expect(store.getState().question.questions).toHaveLength(3);
    expect(store.getState().question.questions[0]._id).toBe("question-1");
    expect(store.getState().question.loading).toBe(false);
  });

  it("fetches single question by id", async () => {
    const store = createTestStore();

    const result = await store.dispatch(fetchQuestionById("question-1"));

    expect(result.type).toBe("question/fetchQuestionById/fulfilled");
    expect(store.getState().question.currentQuestion._id).toBe("question-1");
    expect(store.getState().question.currentQuestion.title).toBe(
      "How do I manage state in React?",
    );
  });

  it("posts a question and appends it to the list", async () => {
    const store = createTestStore();

    await store.dispatch(fetchQuestions());

    const result = await store.dispatch(
      postQuestion({
        title: "How do I test Redux thunks?",
        description: "Looking for integration test patterns.",
        tags: "javascript, redux",
      }),
    );

    expect(result.type).toBe("question/postQuestion/fulfilled");
    expect(store.getState().question.questions).toHaveLength(4);
    expect(store.getState().question.currentQuestion.title).toBe(
      "How do I test Redux thunks?",
    );
  });

  it("votes on a question and updates list and current question", async () => {
    const store = createTestStore();

    await store.dispatch(fetchQuestions());
    await store.dispatch(fetchQuestionById("question-1"));

    const question = store.getState().question.questions[0];

    const result = await store.dispatch(
      voteQuestion({
        question,
        voteType: "upvote",
      }),
    );

    expect(result.type).toBe("question/voteQuestion/fulfilled");
    expect(store.getState().question.questions[0].voteCount).toBe(11);
    expect(store.getState().question.currentQuestion.voteCount).toBe(11);
  });
});
