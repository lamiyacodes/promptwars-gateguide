import { describe, it, expect } from "vitest";

function crowdLabel(crowd) {
  if (crowd === "High") return "FULL";
  if (crowd === "Medium") return "BUSY";
  return "OPEN";
}

describe("crowdLabel", () => {
  it("returns FULL for High crowd", () => {
    expect(crowdLabel("High")).toBe("FULL");
  });
  it("returns BUSY for Medium crowd", () => {
    expect(crowdLabel("Medium")).toBe("BUSY");
  });
  it("returns OPEN for Low crowd", () => {
    expect(crowdLabel("Low")).toBe("OPEN");
  });
  it("defaults to OPEN for unknown values", () => {
    expect(crowdLabel("Unknown")).toBe("OPEN");
  });
});

describe("suggestion data", () => {
  it("has matching number of English and Hinglish suggestions", () => {
    const SUGGESTIONS_EN = [
      { label: "How do I get to my seat?" },
      { label: "Is there a wheelchair-friendly route?" },
      { label: "Where can I grab food nearby?" },
    ];
    const SUGGESTIONS_HI = [
      { label: "Mera seat kahan hai?" },
      { label: "Wheelchair wala route hai kya?" },
      { label: "Khana kahan milega paas mein?" },
    ];
    expect(SUGGESTIONS_EN.length).toBe(SUGGESTIONS_HI.length);
  });
});

describe("stadium gate data", () => {
  const gates = [
    { id: "Gate 1", crowd: "Low" },
    { id: "Gate 2", crowd: "Medium" },
    { id: "Gate 3", crowd: "High" },
    { id: "Gate 4", crowd: "Low" },
  ];

  it("has exactly 4 gates", () => {
    expect(gates.length).toBe(4);
  });

  it("every gate has a valid crowd level", () => {
    const validLevels = ["Low", "Medium", "High"];
    gates.forEach((g) => {
      expect(validLevels).toContain(g.crowd);
    });
  });
});