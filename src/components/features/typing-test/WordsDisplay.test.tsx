import { render, screen } from "@testing-library/react";
import { WordsDisplay } from "./WordsDisplay";
import { useTypingStore } from "@/store/useTypingStore";
import { useConfigStore } from "@/store/useConfigStore";
import { defaultConfig } from "@/types/config";
import { vi } from "vitest";

// Mock the stores
vi.mock("@/store/useTypingStore");
vi.mock("@/store/useConfigStore");

describe("WordsDisplay", () => {
  const mockTypingState = {
    words: ["hello", "world", "test"],
    wordInputs: [],
    currentInput: "",
    activeWordIndex: 0,
    isFinished: false,
  };

  const mockConfigState = {
    ...defaultConfig,
    fontSize: 1.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTypingStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: typeof mockTypingState) => unknown) => 
      selector(mockTypingState)
    );
    (useConfigStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: typeof mockConfigState) => unknown) => 
      selector(mockConfigState)
    );
  });

  it("renders words correctly", () => {
    render(<WordsDisplay />);
    
    expect(screen.getByText("h")).toBeInTheDocument();
    expect(screen.getByText("e")).toBeInTheDocument();
    expect(screen.getByText("l")).toBeInTheDocument();
    expect(screen.getByText("l")).toBeInTheDocument();
    expect(screen.getByText("o")).toBeInTheDocument();
  });

  it("renders without crashing (infinite loop check)", async () => {
    // This test primarily checks that rendering doesn't throw "Maximum update depth exceeded"
    // We simulate a state that triggers the layout effect
    const { container } = render(<WordsDisplay />);
    
    expect(container).toBeInTheDocument();
  });
});
