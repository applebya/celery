/*
  Runs the a11y and perf harnesses against a real preview server.

  measure-perf.ts and audit-a11y.ts both default to http://localhost:4173 but
  neither starts anything, so on their own they only pass if someone happens
  to have `vite preview` running. This owns that lifecycle so `bun run verify`
  is a gate rather than a suggestion.

  Usage: bun run verify
*/
import { spawn, type Subprocess } from "bun";

const PORT = 4173;
const BASE = `http://localhost:${PORT}/`;

let preview: Subprocess | null = null;

function stopPreview() {
  if (!preview) return;
  preview.kill();
  preview = null;
}

/* Make sure the server dies with us however we exit, including Ctrl-C. */
process.on("exit", stopPreview);
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    stopPreview();
    process.exit(130);
  });
}

async function waitForServer(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`preview server did not come up on ${BASE}`);
}

async function run(label: string, cmd: string[]) {
  process.stderr.write(`\n── ${label} ──────────────────────────────\n`);
  const proc = spawn(cmd, { stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`${label} failed (exit ${code})`);
}

preview = spawn(["bunx", "vite", "preview", "--port", String(PORT)], {
  stdout: "ignore",
  stderr: "ignore",
});

try {
  await waitForServer();
  await run("accessibility", ["bun", "run", "tools/audit-a11y.ts", BASE]);
  await run("performance", ["bun", "run", "tools/measure-perf.ts", BASE]);
  process.stderr.write("\nverify: all gates passed\n");
} catch (e) {
  process.stderr.write(`\nverify: ${e instanceof Error ? e.message : e}\n`);
  stopPreview();
  process.exit(1);
} finally {
  stopPreview();
}
