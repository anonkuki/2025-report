# Disable QA Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disable the question-answering agent, remove its frontend display, and shut down its public backend endpoints without affecting the annual-report experience.

**Architecture:** Keep the existing mascot implementation as dormant source so it can be restored deliberately, but gate it before any DOM, timer, storage, or network work. Remove the Netlify and local proxy entry points so direct API calls no longer reach an AI service. Verify both the editable generator source and the exported static report.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, Netlify configuration and Functions.

---

### Task 1: Add a regression test for the disabled state

**Files:**
- Create: `tests/qa-agent-disabled.test.js`

- [ ] **Step 1: Write the failing test**

```js
test('QA agent stays disabled in source and exported report', () => {
  assert.match(config, /const AI_QA_AGENT_ENABLED = false;/);
  assert.ok(componentGuardAppearsBeforeImplementation);
  assert.ok(exportedGuardAppearsBeforeImplementation);
});

test('QA backend endpoints are not published', () => {
  assert.doesNotMatch(netlifyConfig, /api\/chat|chat-stream|functions/);
  assert.equal(existsSync('netlify/functions/chat.js'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/qa-agent-disabled.test.js`

Expected: FAIL because the disabled flag and early-return guards do not exist and the chat endpoints are still present.

### Task 2: Disable frontend initialization

**Files:**
- Modify: `backup/generator-config.js`
- Modify: `backup/components/ai-mascot.js`
- Modify: `backup/module-sources.js`
- Modify: `output/script.js`
- Create: `scripts/build-module-sources.js`

- [ ] **Step 1: Add the shared default-off flag**

```js
const AI_QA_AGENT_ENABLED = false;
```

- [ ] **Step 2: Guard both source and exported implementations before side effects**

```js
if (typeof AI_QA_AGENT_ENABLED === 'undefined' || !AI_QA_AGENT_ENABLED) {
    window.YouziAgent = null;
    return;
}
```

- [ ] **Step 3: Run the focused test**

Regenerate `backup/module-sources.js` from the editable module files so future exports inherit the default-off flag and early-return guard.

- [ ] **Step 3: Run the focused test**

Run: `node --test tests/qa-agent-disabled.test.js`

Expected: the frontend assertions pass while the backend-removal assertion still fails.

### Task 3: Remove QA backend entry points

**Files:**
- Modify: `netlify.toml`
- Delete: `netlify/functions/chat.js`
- Delete: `netlify/functions/chat-stream.js`
- Delete: `netlify/functions/health.js`
- Delete: `local-ai-proxy.js`

- [ ] **Step 1: Reduce Netlify configuration to the static output directory**

```toml
[build]
  publish = "output"
```

- [ ] **Step 2: Delete the AI-only Functions and local proxy**

The deleted files must no longer exist, preventing direct function-path access as well as friendly redirects.

- [ ] **Step 3: Run the focused test**

Run: `node --test tests/qa-agent-disabled.test.js`

Expected: PASS with 0 failures.

### Task 4: Verify and publish

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `output/README.md`

- [ ] **Step 1: Ignore local source data and caches that must not be published**

Add patterns for `.venv/`, Office lock files, the local questionnaire workbook, and local author/photo source folders.

Update both README copies to state that the question-answering Agent and its local/Netlify service entry points are disabled.

- [ ] **Step 2: Run syntax, regression, and static scans**

Run: `node --check backup/components/ai-mascot.js`, `node --check output/script.js`, `node --test tests/qa-agent-disabled.test.js`, and a repository search for active chat routes.

Expected: all commands exit 0; active chat routes exist only inside dormant implementation code and test assertions, with no published backend.

- [ ] **Step 3: Stage only intended project files, commit, and push**

Run: explicit `git add` paths, `git commit -m "Disable QA agent and frontend"`, then push `HEAD` to the target repository's `main` branch.

Expected: push succeeds and remote `main` resolves to the new commit.
