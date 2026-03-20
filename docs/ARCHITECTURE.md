# Browser Agent Architecture (v0.1)

## Goals

- Local-first runtime in browser
- Privacy-first defaults
- Open-source composable planner/executor contracts
- Human-approved mode for risky actions

## Runtime Components

1. Popup UI (`src/popup`)
   - Starts/stops sessions
   - Picks mode (`autonomous`, `human-approved`)
   - Picks planner (`heuristic`, `webllm`)

2. Background Service Worker (`src/background`)
   - Session state machine per tab
   - Tick loop orchestration
   - Approval handling

3. Content Agent (`src/content`)
   - `pageObserver`: page snapshot extraction
   - `planner`: next-action decision (heuristic/WebLLM)
   - `safety`: risk gating (`safe`, `review`, `blocked`)
   - `executor`: DOM action execution

## Contracts

- Shared in `src/shared/contracts.ts`
- Action protocol:
  - click
  - type
  - navigate
  - extract
  - wait
  - done

## Safety Model

- Block invalid URL protocols
- Review risky actions (submit/delete/pay-like selectors)
- In `human-approved` mode, review-level actions require manual approval

## WebLLM Usage

- Planner includes a `webllm` mode contract with a local bridge hook
- v0.1 bridge entrypoint: `window.__browserAgentWebLLM.plan(input, modelId)`
- Full in-extension worker integration is planned for v0.2

## Limitations (v0.1)

- No persistent long-term memory yet
- No task DSL/skills registry yet
- Risk scoring is simple keyword heuristic
- No robust selector healing yet
