import { beforeAll, afterAll, afterEach, beforeEach, describe, it, expect } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

import questionReducer, {
  fetchQuestions,
  fetchQuestionById,
  postQuestion,
  voteQuestion,
} from "../../src/reducers/questionSlice";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

let threadsData;

const makeThread = (overrides = {}) => ({
  _id: "question-1",
  title: "How do I optimize React renders?",
  description: "Looking for practical memoization advice.",
  voteCount: 0,
  upvotes: 0,
  downvotes: 0,
  author: { _id: "user-1", name: "Ada" },
  tags: [{ _id: "sub-1", name: "reactjs" }],
  answers: [],
  ...overrides,
});

const server = setupServer(
  http.get(`${API_BASE}/threads`, ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: threadsData,
    });
  }),

  http.get(`${API_BASE}/threads/:id`, ({ params, request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const thread = threadsData.find((item) => item._id === params.id);

    if (!thread) {
      return HttpResponse.json(
        { success: false, message: "Thread not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: thread,
    });
  }),

  http.get(`${API_BASE}/comments/thread/:id`, ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post(`${API_BASE}/threads`, async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const created = makeThread({
      _id: "question-2",
      title: body.title,
      description: body.description ?? body.content,
      tags: [{ _id: body.subreddit ?? "sub-2", name: "frontend" }],
      voteCount: 0,
      upvotes: 0,
      downvotes: 0,
    });

    threadsData = [created, ...threadsData];

    return HttpResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 },
    );
  }),

  http.post(`${API_BASE}/threads/:id/upvote`, ({ params, request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const index = threadsData.findIndex((item) => item._id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: "Thread not found" },
        { status: 404 },
      );
    }

    const existing = threadsData[index];
    const updated = {
      ...existing,
      upvotes: (existing.upvotes ?? 0) + 1,
      voteCount: (existing.voteCount ?? 0) + 1,
    };

    threadsData[index] = updated;

    return HttpResponse.json({
      success: true,
      data: {
        _id: updated._id,
        upvotes: updated.upvotes,
        downvotes: updated.downvotes,
        voteCount: updated.voteCount,
      },
    });
  }),
);

const createTestStore = () =>
  configureStore({
    reducer: {
      question: questionReducer,
      user: (state = { userInfo: { userId: "user-1", token: "test-token" } }) =>
        state,
    },
  });

describe("question flow equivalent (thread flow) integration", () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    threadsData = [makeThread()];
  });

  it("fetches all questions into list state", async () => {
    const store = createTestStore();

    const result = await store.dispatch(fetchQuestions());

    expect(result.type).toBe("questions/fetchQuestions/fulfilled");
    expect(store.getState().question.questions).toHaveLength(1);
    expect(store.getState().question.questions[0]._id).toBe("question-1");
  });

  it("fetches single question by id", async () => {
    const store = createTestStore();

    const result = await store.dispatch(fetchQuestionById("question-1"));

    expect(result.type).toBe("questions/fetchQuestionById/fulfilled");
    expect(store.getState().question.currentQuestion._id).toBe("question-1");
  });

  it("posts a question and prepends it to the list", async () => {
    const store = createTestStore();

    await store.dispatch(fetchQuestions());

    const result = await store.dispatch(
      postQuestion({
        title: "New frontend question",
        description: "How should I structure reducers?",
        tags: ["sub-2"],
      }),
    );

    expect(result.type).toBe("questions/postQuestion/fulfilled");
    expect(store.getState().question.questions[0]._id).toBe("question-2");
    expect(store.getState().question.questions).toHaveLength(2);
  });

  it("votes on a question and updates list and current question", async () => {
    const store = createTestStore();

    await store.dispatch(fetchQuestions());
    await store.dispatch(fetchQuestionById("question-1"));

    const result = await store.dispatch(
      voteQuestion({
        question: { _id: "question-1" },
        voteType: "upvote",
      }),
    );

    expect(result.type).toBe("questions/voteQuestion/fulfilled");
    expect(store.getState().question.questions[0].voteCount).toBe(1);
    expect(store.getState().question.questions[0].upvotes).toBe(1);
    expect(store.getState().question.currentQuestion.voteCount).toBe(1);
    expect(store.getState().question.currentQuestion.upvotes).toBe(1);
  });
});
