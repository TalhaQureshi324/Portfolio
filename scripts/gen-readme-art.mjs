/** Generates perfectly-aligned box/divider ASCII art for the README */

const W = 62; // inner width

function box(lines, title = "") {
  const t = title ? ` ${title} ` : "";
  const top = "┌" + "─".repeat(W - 2 - t.length) + t + "┐";
  const bottom = "└" + "─".repeat(W - 2) + "┘";
  const body = lines.map((l) => {
    const raw = l.replace(/\x1b\[[0-9;]*m/g, "");
    const visible = [...raw].reduce((n, c) => n + (/[\u2500-\u257F\u2580-\u259F●▸✓▶⚡]/.test(c) ? 1 : 1), 0);
    return "│ " + l + " ".repeat(Math.max(0, W - 4 - visible)) + " │";
  });
  return [top, ...body, bottom].join("\n");
}

function divider(title) {
  const t = ` ${title} `;
  const left = 4;
  const right = W - 2 - t.length - left;
  return "├" + "─".repeat(left) + t + "─".repeat(Math.max(0, right)) + "┤";
}

const banner = `
████████╗ █████╗ ██╗     ██╗   ██╗ █████╗ 
╚══██╔══╝██╔══██╗██║     ╚██╗ ██╔╝██╔══██╗
   ██║   ███████║██║      ╚████╔╝ ███████║
   ██║   ██╔══██║██║       ╚██╔╝  ██╔══██║
   ██║   ██║  ██║███████╗   ██║   ██║  ██║
   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝`.trim();

console.log("=== BANNER ===");
console.log(banner);
console.log("\n=== INTRO BOX ===");
console.log(
  box(
    [
      "$ whoami",
      "▸ AI Systems Engineer & Full-Stack Architect",
      "",
      "$ cat ~/status",
      "● AVAILABLE FOR WORK — Pakistan · PKT (UTC+5)",
      "",
      "$ ls ~/flagship-systems",
      "▸ malaria-screening/    outbound-automation/",
      "▸ deepfake-detection/   nlp-bias-analyzer/",
      "▸ b2b-commerce/         voice-pipeline/",
      "",
      "$ open portfolio --live",
      "✓ https://talha-qureshi-portfolio.vercel.app",
    ],
    "visitor@talha-dev — zsh"
  )
);
console.log("\n=== DIVIDER SAMPLES ===");
console.log(divider("SYSTEM TOPOLOGY"));
console.log(divider("QUICK START"));
console.log(divider("DIRECTORY TREE"));
console.log(divider("CONTACT PIPELINE"));
console.log(divider("CUSTOMIZATION"));
