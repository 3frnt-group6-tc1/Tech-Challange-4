import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Pagination from "../../components/Pagination";
import { lightTheme, darkTheme } from "../../contexts/ThemeContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock the useTheme hook
const mockUseTheme = jest.fn();
jest.mock("../../contexts/ThemeContext", () => {
  const originalModule = jest.requireActual("../../contexts/ThemeContext");
  return {
    ...originalModule,
    useTheme: () => mockUseTheme(),
  };
});

// Test wrapper component
const TestWrapper = ({ children, theme = "light" }) => {
  const selectedTheme = theme === "light" ? lightTheme : darkTheme;
  mockUseTheme.mockReturnValue({
    theme: selectedTheme,
    isDarkMode: theme === "dark",
    toggleTheme: jest.fn(),
    isLoading: false,
  });

  return <>{children}</>;
};

describe("Pagination Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("returns null when totalPages is 1", () => {
      const { queryByText } = render(
        <TestWrapper>
          <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
        </TestWrapper>
      );

      expect(queryByText(/Página/)).toBeNull();
    });

    it("returns null when totalPages is less than 1", () => {
      const { queryByText } = render(
        <TestWrapper>
          <Pagination currentPage={1} totalPages={0} onPageChange={jest.fn()} />
        </TestWrapper>
      );

      expect(queryByText(/Página/)).toBeNull();
    });

    it("renders pagination when totalPages is greater than 1", () => {
      const { getByText } = render(
        <TestWrapper>
          <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Página 1 de 5")).toBeTruthy();
      expect(getByText("Anterior")).toBeTruthy();
      expect(getByText("Próxima")).toBeTruthy();
    });

    it("displays correct page information", () => {
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={3}
            totalPages={10}
            onPageChange={jest.fn()}
          />
        </TestWrapper>
      );

      expect(getByText("Página 3 de 10")).toBeTruthy();
    });
  });

  describe("Navigation Buttons", () => {
    it("disables previous button on first page", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={1}
            totalPages={5}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Anterior"));
      expect(onPageChangeMock).not.toHaveBeenCalled();
    });

    it("enables previous button when not on first page", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={2}
            totalPages={5}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Anterior"));
      expect(onPageChangeMock).toHaveBeenCalledWith(1);
    });

    it("disables next button on last page", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={5}
            totalPages={5}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Próxima"));
      expect(onPageChangeMock).not.toHaveBeenCalled();
    });

    it("enables next button when not on last page", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={2}
            totalPages={5}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Próxima"));
      expect(onPageChangeMock).toHaveBeenCalledWith(3);
    });
  });

  describe("Page Change Logic", () => {
    it("navigates to previous page correctly", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={5}
            totalPages={10}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Anterior"));
      expect(onPageChangeMock).toHaveBeenCalledWith(4);
    });

    it("navigates to next page correctly", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={5}
            totalPages={10}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Próxima"));
      expect(onPageChangeMock).toHaveBeenCalledWith(6);
    });

    it("does not go below page 1 when pressing previous", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={1}
            totalPages={5}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Anterior"));
      expect(onPageChangeMock).not.toHaveBeenCalled();
    });

    it("does not go beyond totalPages when pressing next", () => {
      const onPageChangeMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={5}
            totalPages={5}
            onPageChange={onPageChangeMock}
          />
        </TestWrapper>
      );

      fireEvent.press(getByText("Próxima"));
      expect(onPageChangeMock).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles two-page pagination", () => {
      const { getByText } = render(
        <TestWrapper>
          <Pagination currentPage={1} totalPages={2} onPageChange={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Página 1 de 2")).toBeTruthy();
      expect(getByText("Anterior")).toBeTruthy();
      expect(getByText("Próxima")).toBeTruthy();
    });

    it("handles large number of pages", () => {
      const { getByText } = render(
        <TestWrapper>
          <Pagination
            currentPage={50}
            totalPages={100}
            onPageChange={jest.fn()}
          />
        </TestWrapper>
      );

      expect(getByText("Página 50 de 100")).toBeTruthy();
    });
  });

  describe("Theme Support", () => {
    it("renders correctly with light theme", () => {
      const { getByText } = render(
        <TestWrapper theme="light">
          <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Página 1 de 5")).toBeTruthy();
    });

    it("renders correctly with dark theme", () => {
      const { getByText } = render(
        <TestWrapper theme="dark">
          <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Página 1 de 5")).toBeTruthy();
    });
  });
});
