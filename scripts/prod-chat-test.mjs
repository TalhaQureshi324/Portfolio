const BASE = "https://talha-qureshi-portfolio.vercel.app";
const tests = [
  ["TEST 1 Recruiter Redis+Playwright", "I am a recruiter and looking to sign a person who has good knowledge of Redis and Playwright. Should I hire Talha for this post?"],
  ["TEST 2 Playwright depth", "Does Talha actually know Playwright or is it just listed on his portfolio?"],
  ["TEST 3 Redis usage", "Where has Talha used Redis?"],
  ["TEST 4 K8s gap", "Should I hire Talha for a Kubernetes platform engineering role requiring 7 years of production Kubernetes experience?"],
  ["TEST 5 Interview AI automation", "What should I ask Talha in an interview for an AI automation role?"],
  ["TEST 6 Full assessment", "Give me a complete assessment of Talha for an AI Engineer position."],
  ["TEST 7 AWS", "Does Talha have AWS experience?"],
  ["TEST 8 Off-topic code", "Write me a Python program that sorts an array."],
];
const browser = (await import("playwright-core")).chromium;
