import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  LanguageProvider,
  useLanguage,
} from "../src/contexts/LanguageContext.jsx";

function wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to English when nothing is stored", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe("en");
  });

  it("persists changes to localStorage", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setLanguage("ta");
    });
    expect(result.current.language).toBe("ta");
    expect(localStorage.getItem("ruralLearn.language")).toBe("ta");
  });

  it("reads the stored language on init", () => {
    localStorage.setItem("ruralLearn.language", "ta");
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe("ta");
  });

  it("toggles between English and Tamil", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe("ta");
    act(() => {
      result.current.toggleLanguage();
    });
    expect(result.current.language).toBe("en");
  });

  it("ignores an unsupported language", () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => {
      result.current.setLanguage("fr");
    });
    expect(result.current.language).toBe("en");
  });
});
