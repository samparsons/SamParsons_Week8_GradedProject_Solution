import { describe, it, expect } from "vitest";
import questionReducer, {
  fetchQuestions,
  postQuestion,
} from "../../../src/reducers/questionSlice";

describe("questionSlice reducer", () => {
  it("returns initial state", () => {
    const state = questionReducer(undefined, { type: "unknown" });

    expect(state).toEqual({
      questions: [],
      currentQuestion: null,
      loading: false,
      error: null,
    });
  });

  it("handles fetchQuestions pending", () => {
    const state = questionReducer(
      undefined,
      fetchQuestions.pending("req-1", undefined),
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("handles fetchQuestions fulfilled", () => {
    const payload = [{ _id: "question-1", title: "Question one", voteCount: 2 }];

    const state = questionReducer(
      undefined,
      fetchQuestions.fulfilled(payload, "req-2", undefined),
    );

    expect(state.loading).toBe(false);
    expect(state.questions).toEqual(payload);
  });

  it("handles fetchQuestions rejected", () => {
    const action = {
      type: fetchQuestions.rejected.type,
      payload: "Failed to fetch questions",
    };

    const state = questionReducer(undefined, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch questions");
  });

  it("handles postQuestion pending", () => {
    const state = questionReducer(
      undefined,
      postQuestion.pending("req-3", {
        title: "New question",
        description: "Body",
        tags: ["sub-1"],
      }),
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("handles postQuestion fulfilled", () => {
    const existingState = {
      questions: [{ _id: "question-1", title: "Old question", voteCount: 0 }],
      currentQuestion: null,
      loading: true,
      error: null,
    };

    const newQuestion = {
      _id: "question-2",
      title: "New question",
      voteCount: 1,
    };

    const state = questionReducer(
      existingState,
      postQuestion.fulfilled(
        newQuestion,
        "req-4",
        {
          title: "New question",
          description: "Body",
          tags: ["sub-1"],
        },
      ),
    );

    expect(state.loading).toBe(false);
    expect(state.questions[0]).toEqual(newQuestion);
    expect(state.questions).toHaveLength(2);
  });

  it("handles postQuestion rejected", () => {
    const action = {
      type: postQuestion.rejected.type,
      payload: "Failed to create question",
    };

    const state = questionReducer(undefined, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to create question");
  });
});
