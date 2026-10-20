import test from "node:test";
import assert from "node:assert/strict";
import {normalizeAttention,filterAttention,attentionCounts,allowedRepositoryUrl} from "../public/attention-model.js";
const rows=[
 {repository:"alpha",severity:"warning",reasons:["Stale"],activityScore:9,updatedAt:"2026-10-14T00:00:00Z"},
 {repository:"beta",severity:"critical",reasons:["CI Failure"],activityScore:2,updatedAt:"2026-10-13T00:00:00Z"},
 {repository:"gamma",severity:"info",reasons:["No releases"],activityScore:12,updatedAt:"2026-10-15T00:00:00Z"}
];
test("severity, activity and recency sort independently",()=>{
 assert.deepEqual(filterAttention(rows).map(x=>x.repository),["beta","alpha","gamma"]);
 assert.deepEqual(filterAttention(rows,{sort:"activity"}).map(x=>x.repository),["gamma","alpha","beta"]);
 assert.deepEqual(filterAttention(rows,{sort:"recent"}).map(x=>x.repository),["gamma","alpha","beta"]);
});
test("search reasons, severity and empty state",()=>{
 assert.deepEqual(filterAttention(rows,{severity:"critical",query:"ci failure"}).map(x=>x.repository),["beta"]);
 assert.deepEqual(filterAttention([]),[]);
 assert.equal(normalizeAttention(null),null);
 assert.deepEqual(attentionCounts(rows),{critical:1,warning:1,info:1,total:3});
});
test("URLs are HTTPS and owned by GoreeCloud",()=>{
 assert.equal(allowedRepositoryUrl("https://github.com/GoreeCloud/test"),"https://github.com/GoreeCloud/test");
 assert.equal(allowedRepositoryUrl("https://github.com/Other/test"),null);
 assert.equal(allowedRepositoryUrl("http://github.com/GoreeCloud/test"),null);
 assert.equal(allowedRepositoryUrl("https://github.com.evil.test/GoreeCloud/test"),null);
});
