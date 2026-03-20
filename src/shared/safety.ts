import type { AgentAction, RiskLevel } from "./contracts";

const RISKY_KEYWORDS = /\b(delete|remove|pay|purchase|submit|confirm|checkout|transfer|withdraw|send)\b/i;

function elementTextRisky(text?: string): boolean {
  return text != null && RISKY_KEYWORDS.test(text);
}

export function assessRisk(action: AgentAction): RiskLevel {
  switch (action.type) {
    case "navigate": {
      try {
        const next = new URL(action.url);
        if (!["http:", "https:"].includes(next.protocol)) {
          return "blocked";
        }
      } catch {
        return "blocked";
      }
      return "safe";
    }
    case "click":
      return elementTextRisky(action.label) ? "review" : "safe";
    case "type":
      return elementTextRisky(action.label) ? "review" : "safe";
    case "focus":
    case "scroll":
    case "wait":
      return "safe";
    case "extract":
      return "review";
    case "done":
      return "safe";
    default:
      return "review";
  }
}
