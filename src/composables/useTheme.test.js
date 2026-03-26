import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { useTheme } from "./useTheme";

const createStorageMock = () => {
  let store = {};

  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const createDocumentMock = () => {
  const attributes = {};

  return {
    documentElement: {
      setAttribute: (key, value) => {
        attributes[key] = String(value);
      },
      getAttribute: (key) => attributes[key] ?? null,
      removeAttribute: (key) => {
        delete attributes[key];
      },
    },
  };
};

describe("useTheme", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, "document", {
      value: createDocumentMock(),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to light theme and applies html attribute", () => {
    const { theme } = useTheme();

    expect(theme.value).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles to dark and persists value", async () => {
    const { theme, toggleTheme } = useTheme();

    toggleTheme();
    await nextTick();

    expect(theme.value).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
