import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

describe("GateGuide language selection", () => {
  it("shows the welcome screen with language options initially", () => {
    render(<App />);
    expect(screen.getByText(/GATEGUIDE/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue in English/i)).toBeInTheDocument();
    expect(screen.getByText(/Hinglish mein baat karo/i)).toBeInTheDocument();
  });

  it("moves to the main dashboard after choosing English", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Continue in English/i));
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it("shows all four console cards on the dashboard", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Continue in English/i));
    expect(screen.getAllByText(/AI Assistant/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Smart Navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Accessibility Hub/i)).toBeInTheDocument();
  });

  it("opens the chat bubble when the AI Assistant console is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Continue in English/i));
    const aiButtons = screen.getAllByText(/AI Assistant/i);
    fireEvent.click(aiButtons[aiButtons.length - 1]);
    expect(screen.getByText(/GateGuide Assistant/i)).toBeInTheDocument();
  });

  it("opens the Emergency console and sends an SOS message automatically", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Continue in English/i));
    fireEvent.click(screen.getByText(/Emergency Center/i));
    expect(screen.getByText(/GateGuide Assistant/i)).toBeInTheDocument();
  });

  it("returns to the language screen when Change Language is clicked", () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Continue in English/i));
    fireEvent.click(screen.getByText(/Change Language/i));
    expect(screen.getByText(/Choose your language to begin/i)).toBeInTheDocument();
  });

});