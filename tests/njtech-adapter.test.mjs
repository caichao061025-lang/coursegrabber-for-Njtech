import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../courseGrabber.js", import.meta.url), "utf8");

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Expected courseGrabber.js to define ${name}()`);

  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index++) {
    const char = source[index];
    if (char === "{") depth++;
    if (char === "}") depth--;
    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  throw new Error(`Could not extract ${name}()`);
}

test("detects the NJTech platform and applies conservative defaults", () => {
  const detectPlatformProfile = Function(
    `${extractFunction("detectPlatformProfile")}\nreturn detectPlatformProfile;`,
  )();

  const profile = detectPlatformProfile({ hostname: "jwgl.njtech.edu.cn" });

  assert.equal(profile.id, "njtech");
  assert.equal(profile.name, "南京工业大学");
  assert.equal(profile.checkInterval, 3000);
  assert.equal(profile.concurrentEnabled, false);
  assert.equal(profile.refreshEveryAttempts, 5);
});

test("reports a closed NJTech selection window before polling", () => {
  const inspectPlatformPage = Function(
    `${extractFunction("inspectPlatformPage")}\nreturn inspectPlatformPage;`,
  )();
  const root = {
    querySelector(selector) {
      return selector === "#iskxk" ? { value: "0" } : null;
    },
    querySelectorAll() {
      return [];
    },
  };

  const result = inspectPlatformPage({ id: "njtech" }, root);

  assert.equal(result.ready, false);
  assert.match(result.reason, /不在选课时间/);
});

test("requires NJTech course cards to be loaded", () => {
  const inspectPlatformPage = Function(
    `${extractFunction("inspectPlatformPage")}\nreturn inspectPlatformPage;`,
  )();
  const root = {
    querySelector(selector) {
      return selector === "#iskxk" ? { value: "1" } : null;
    },
    querySelectorAll() {
      return [];
    },
  };

  const result = inspectPlatformPage({ id: "njtech" }, root);

  assert.equal(result.ready, false);
  assert.match(result.reason, /课程卡片/);
});

test("uses the exact NJTech course-selection button", () => {
  const helpers = Function(
    `${extractFunction("isElementClickable")}\n${extractFunction("findSelectActionElement")}\nreturn { findSelectActionElement };`,
  )();
  const selectButton = {
    tagName: "BUTTON",
    textContent: "选课",
    onclick() {},
    getAttribute() {
      return null;
    },
  };
  const row = {
    querySelector(selector) {
      assert.match(selector, /btn-xk-/);
      return selectButton;
    },
    querySelectorAll() {
      return [];
    },
  };

  assert.equal(
    helpers.findSelectActionElement(row, { id: "njtech" }),
    selectButton,
  );
});

test("does not mistake NJTech textbook controls for a selection button", () => {
  const helpers = Function(
    `${extractFunction("isElementClickable")}\n${extractFunction("findSelectActionElement")}\nreturn { findSelectActionElement };`,
  )();
  const textbookButton = {
    tagName: "BUTTON",
    textContent: "预定教材",
    onclick() {},
    getAttribute() {
      return null;
    },
  };
  const row = {
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [textbookButton];
    },
  };

  assert.equal(
    helpers.findSelectActionElement(row, { id: "njtech" }),
    null,
  );
});
