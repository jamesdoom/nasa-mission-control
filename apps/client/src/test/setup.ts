import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetApiQueryCache } from "../hooks/useApiQuery";

afterEach(() => {
  cleanup();
  resetApiQueryCache();
});
