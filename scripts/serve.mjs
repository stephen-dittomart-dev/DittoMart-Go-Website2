/**
 * Start Next without ever hitting EADDRINUSE.
 *
 *     node scripts/serve.mjs dev            # next dev  on 3000
 *     node scripts/serve.mjs start          # next start on 3000
 *     node scripts/serve.mjs start 4000     # ...on a port of your choosing
 *
 * The problem this solves is not really "the port is busy". It is that a Next
 * server which loses its terminal — a closed window, a killed shell, a crashed
 * parent — keeps running, keeps the port, and keeps serving whatever build was
 * on disk when it started. So the next `npm start` fails, and if you work
 * around it by picking a new port you end up looking at a stale build on the
 * old one. Both failure modes come from the same orphan.
 *
 * So this frees the port first — but only from something that is recognisably
 * a Next server for *this* project. Anything else holding it is somebody
 * else's process and gets left alone; you are told what it is and the server
 * moves to the next free port rather than killing it.
 */

import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIN = process.platform === "win32";

const mode = process.argv[2] === "dev" ? "dev" : "start";
const wanted = Number(process.argv[3]) || Number(process.env.PORT) || 3000;

/** Who is listening on `port`: `[{ pid, cmd }]`. Empty if nobody is. */
function holders(port) {
  try {
    if (WIN) {
      /* One PowerShell call for both halves. `Get-NetTCPConnection` gives the
         PID; only `Win32_Process` knows the command line, and the command line
         is the whole basis for deciding whether this is ours to kill. */
      const out = execFileSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue |` +
            ` Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {` +
            ` $c = (Get-CimInstance Win32_Process -Filter "ProcessId = $_" -ErrorAction SilentlyContinue).CommandLine;` +
            ` "$_|$c" }`,
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
      );
      return out
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const i = l.indexOf("|");
          return { pid: Number(l.slice(0, i)), cmd: l.slice(i + 1) };
        })
        .filter((h) => Number.isFinite(h.pid));
    }

    const pids = execFileSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return [...new Set(pids)].map((pid) => {
      let cmd = "";
      try {
        cmd = execFileSync("ps", ["-p", pid, "-o", "args="], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
      } catch {
        /* the process went away between the two calls — cmd stays empty, which
           reads as "not recognisably ours" and so it will not be killed */
      }
      return { pid: Number(pid), cmd };
    });
  } catch {
    // nothing listening, or the tool is missing: either way, nothing to free
    return [];
  }
}

/**
 * Is this orphan one of ours?
 *
 * Deliberately narrow. It has to look like Next *and* belong to this checkout,
 * because the alternative — killing anything on port 3000 — will one day kill
 * a database, an API someone is debugging, or another project's dev server.
 * A false negative costs a port; a false positive costs someone their work.
 */
function isOurs(cmd) {
  if (!cmd) return false;
  const c = cmd.toLowerCase();
  const here = ROOT.toLowerCase().replace(/\\/g, "/");
  const inHere = c.replace(/\\/g, "/").includes(here);
  return inHere && /next/.test(c);
}

function kill(pid) {
  try {
    if (WIN) {
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      process.kill(pid, "SIGKILL");
    }
    return true;
  } catch {
    return false;
  }
}

/** Free `port` if we may, otherwise walk up to the next port nobody wants. */
function claim(port) {
  for (let p = port; p < port + 20; p++) {
    const held = holders(p);
    if (!held.length) {
      if (p !== port) console.log(`→ port ${port} is taken, using ${p}`);
      return p;
    }

    const ours = held.filter((h) => isOurs(h.cmd));
    const theirs = held.filter((h) => !isOurs(h.cmd));

    if (theirs.length) {
      for (const t of theirs) {
        console.log(
          `→ port ${p} is held by PID ${t.pid}, which is not this project — leaving it alone`
        );
        console.log(`    ${t.cmd.slice(0, 110)}`);
      }
      continue;
    }

    for (const o of ours) {
      const ok = kill(o.pid);
      console.log(
        ok
          ? `→ freed port ${p} (stopped orphaned server, PID ${o.pid})`
          : `→ could not stop PID ${o.pid} on port ${p}`
      );
      if (!ok) return claimAfter(p);
    }
    return p;
  }
  console.error(`Could not find a free port in ${port}–${port + 19}.`);
  process.exit(1);
}

const claimAfter = (p) => claim(p + 1);

const port = claim(wanted);

console.log(`→ next ${mode} on http://localhost:${port}\n`);

const child = spawn(
  process.execPath,
  [path.join(ROOT, "node_modules", "next", "dist", "bin", "next"), mode, "-p", String(port)],
  { cwd: ROOT, stdio: "inherit" }
);

/* Pass signals through and wait for the child to actually go, so this script
   never becomes the orphan-maker it exists to clean up after. */
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => child.kill(sig));
}
child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0));
});
