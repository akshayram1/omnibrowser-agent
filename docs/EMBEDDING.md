# Embedding Browser Agent in Your Website

You can keep the extension flow and also embed Browser Agent as a library in your own web app.

## Install

```bash
npm install browser-agent
```

## Basic usage

```ts
import { createBrowserAgent } from "browser-agent";

const agent = createBrowserAgent(
  {
    goal: "Search contact Jane Doe and open profile",
    mode: "human-approved",
    planner: { kind: "heuristic" },
    maxSteps: 15,
    stepDelayMs: 400
  },
  {
    onStep: (result) => console.log("step", result),
    onApprovalRequired: (action) => {
      console.log("approval required", action);
      // Show your own modal/button then call approvePendingAction()
    },
    onDone: (result) => console.log("done", result),
    onError: (error) => console.error(error)
  }
);

await agent.start();
```

## Approve a pending action

```ts
await agent.approvePendingAction();
```

## Stop running session

```ts
agent.stop();
```

## WebLLM mode in embedded app

To use planner mode `webllm`, provide a local bridge in your app:

```ts
window.__browserAgentWebLLM = {
  async plan(input, modelId) {
    // call your local WebLLM engine and return one AgentAction JSON
    return { type: "done", reason: `Implement bridge with model ${modelId ?? "default"}` };
  }
};
```

Then configure:

```ts
planner: { kind: "webllm", modelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC" }
```

## Notes

- For production, mount this inside an authenticated app shell and add your own permission checks.
- `human-approved` mode is recommended for CRM/finance/admin actions.
