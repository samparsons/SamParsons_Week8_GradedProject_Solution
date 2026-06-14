import { describe, it, expect } from "vitest";
import threadListReducer, {
  fetchThreads,
  createThreadThunk,
} from "../../../src/reducers/threadListSlice";

describe("threadListSlice reducer", () => {
  it("returns initial state", () => {
    const state = threadListReducer(undefined, { type: "unknown" });

    expect(state).toEqual({
      threads: [],
      loading: false,
      error: null,
    });
  });

  it("handles fetchThreads pending", () => {
    const state = threadListReducer(
      undefined,
      fetchThreads.pending("req-1", undefined),
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.threads).toEqual([]);
  });

  it("handles fetchThreads fulfilled", () => {
    const payload = [
      {
        _id: "thread-1",
        title: "Thread one",
        voteCount: 2,
      },
    ];

    const state = threadListReducer(
      undefined,
      fetchThreads.fulfilled(payload, "req-2", undefined),
    );

    expect(state.loading).toBe(false);
    expect(state.threads).toEqual(payload);
    expect(state.error).toBeNull();
  });

  it("handles fetchThreads rejected", () => {
    const action = {
      type: fetchThreads.rejected.type,
      payload: "Failed to fetch threads",
    };

    const state = threadListReducer(undefined, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to fetch threads");
  });

  it("handles createThreadThunk pending", () => {
    const state = threadListReducer(
      undefined,
      createThreadThunk.pending("req-3", {
        title: "New Thread",
        content: "Body",
        subreddit: "sub-1",
      }),
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("handles createThreadThunk fulfilled", () => {
    const existingState = {
      threads: [
        {
          _id: "thread-1",
          title: "Existing thread",
          voteCount: 0,
        },
      ],
      loading: true,
      error: null,
    };

    const newThread = {
      _id: "thread-2",
      title: "New thread",
      voteCount: 1,
    };

    const state = threadListReducer(
      existingState,
      createThreadThunk.fulfilled(
        newThread,
        "req-4",
        {
          title: "New thread",
          content: "Body",
          subreddit: "sub-1",
        },
      ),
    );

    expect(state.loading).toBe(false);
    expect(state.threads[0]).toEqual(newThread);
    expect(state.threads).toHaveLength(2);
  });

  it("handles createThreadThunk rejected", () => {
    const action = {
      type: createThreadThunk.rejected.type,
      payload: "Failed to create thread",
    };

    const state = threadListReducer(undefined, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Failed to create thread");
  });
});
