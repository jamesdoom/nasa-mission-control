import { afterEach, describe, expect, it, vi } from "vitest";
import { afterPageLoad } from "./afterPageLoad";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe("deferred worker registration", () => {
  it("waits for page load and a quiet interval", () => {
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    const register = vi.fn();
    const cancel = afterPageLoad(register);
    vi.advanceTimersByTime(5000);
    expect(register).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("load"));
    vi.advanceTimersByTime(999);
    expect(register).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(register).toHaveBeenCalledOnce();
    cancel();
  });
  it("cancels scheduled work when the owner unmounts", () => {
    vi.useFakeTimers();
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    const register = vi.fn();
    afterPageLoad(register)();
    vi.runAllTimers();
    expect(register).not.toHaveBeenCalled();
  });
});
