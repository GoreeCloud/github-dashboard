import test from "node:test";
import assert from "node:assert/strict";
import { allowedGitHubLink } from "../public/github-link-policy.js";

test("allows repository and deep GitHub source links belonging to GoreeCloud", () => {
  for (const url of [
    "https://github.com/GoreeCloud",
    "https://github.com/GoreeCloud/github-dashboard",
    "https://github.com/GoreeCloud/github-dashboard/pull/9",
    "https://github.com/GoreeCloud/github-dashboard/commit/d666a668a4e1c2dcaeaa93ac28ff9639424a0106",
    "https://github.com/GoreeCloud/github-dashboard/blob/main/docs/README%20file.md",
  ]) assert.equal(allowedGitHubLink(url), url);
});

test("fails closed for untrusted destinations and credentials", () => {
  for (const value of [
    null, undefined, 5, {}, "", "javascript:alert(1)",
    "data:text/html,<h1>unsafe</h1>",
    "http://github.com/GoreeCloud/github-dashboard",
    "https://github.com.evil.test/GoreeCloud/github-dashboard",
    "https://github.com@evil.test/GoreeCloud/github-dashboard",
    "https://" + "user:pass" + "@github.com/GoreeCloud/github-dashboard",
    "https://github.com:444/GoreeCloud/github-dashboard",
    "https://github.com/OtherOwner/github-dashboard",
    "https://github.com/GoreeCloudExtra/github-dashboard",
    "https://github.com/GoreeCloud/%2fnot-a-repo",
    "https://github.com/GoreeCloud/github-dashboard?next=evil",
    "https://github.com/GoreeCloud/github-dashboard#fragment",
    "https://github.com/GoreeCloud/../OtherOwner/repo",
    "https://github.com/GoreeCloud/" + "a".repeat(101),
    "https://github.com/GoreeCloud/" + "a".repeat(4096),
  ]) assert.equal(allowedGitHubLink(value), null, String(value).slice(0,80));
});
