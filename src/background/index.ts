import type { AgentMode, AgentSession, PlannerKind } from "../shared/contracts";

const sessions = new Map<number, AgentSession>();

function makeSession(tabId: number, goal: string, mode: AgentMode, plannerKind: PlannerKind): AgentSession {
  return {
    id: crypto.randomUUID(),
    tabId: tabId,
    goal,
    mode,
    planner: {
      kind: plannerKind
    },
    history: [],
    isRunning: true
  };
}

async function tick(tabId: number) {
  const session = sessions.get(tabId);
  if (!session || !session.isRunning) {
    return;
  }

  const result = await chrome.tabs.sendMessage(tabId, {
    type: "AGENT_TICK",
    session
  });

  session.history.push(result.message);

  if (result.status === "needs_approval") {
    session.pendingAction = result.action;
    session.isRunning = false;
    return;
  }

  session.pendingAction = undefined;

  if (["done", "blocked", "error"].includes(result.status)) {
    session.isRunning = false;
    return;
  }

  setTimeout(() => tick(tabId), 600);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "START_AGENT") {
    const session = makeSession(message.tabId, message.goal, message.mode, message.planner);
    sessions.set(message.tabId, session);
    tick(message.tabId).catch((error) => {
      const failed = sessions.get(message.tabId);
      if (failed) {
        failed.history.push(`Error: ${String(error)}`);
        failed.isRunning = false;
      }
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "APPROVE_ACTION") {
    const session = sessions.get(message.tabId);
    if (!session) {
      sendResponse({ ok: false, error: "No active session" });
      return true;
    }

    session.isRunning = true;
    tick(message.tabId).catch((error) => {
      session.history.push(`Error: ${String(error)}`);
      session.isRunning = false;
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "STOP_AGENT") {
    const session = sessions.get(message.tabId);
    if (session) {
      session.isRunning = false;
    }
    chrome.tabs.sendMessage(message.tabId, { type: "AGENT_STOP" }).catch(() => undefined);
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "GET_STATUS") {
    const lines = Array.from(sessions.values()).map(
      (session) =>
        `${session.isRunning ? "RUNNING" : "IDLE"} ${session.tabId}: ${session.goal.slice(0, 45)}${session.goal.length > 45 ? "..." : ""}`
    );

    sendResponse({ status: lines.length > 0 ? lines.join("\n") : "Idle" });
    return true;
  }

  return false;
});
