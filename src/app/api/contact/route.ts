import { NextResponse } from "next/server";
import { site } from "@/lib/site";

/**
 * Where a demo request actually goes.
 *
 * The form used to validate, pause for nine hundred milliseconds and then tell
 * the reader "we will be in touch" — while sending the enquiry precisely
 * nowhere. Every lead the site ever collected would have been discarded, and
 * the reader would have had no way of knowing. That is worse than having no
 * form at all, because a missing form makes people mail you instead.
 *
 * This is deliberately provider-agnostic. It forwards the enquiry as JSON to
 * whatever URL `CONTACT_WEBHOOK_URL` names — a CRM intake, a Zapier or Make
 * hook, a Slack incoming webhook, a Google Apps Script, your own inbox
 * service. Nothing here needs to change when you pick one.
 *
 * If that variable is not set, this route says so honestly (`503`,
 * `configured: false`) and the form falls back to opening the reader's mail
 * client with the message prefilled. The one thing it will never do is claim
 * an enquiry was received when it was not.
 */

export const runtime = "nodejs";
/** Nothing here is cacheable — every call is a distinct submission. */
export const dynamic = "force-dynamic";

type Payload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
  /** Honeypot. Real people leave it empty; most bots fill everything in. */
  website?: unknown;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/* A submission every few seconds from one address is not a person typing.
   In-memory and per-instance, which is the right size for this: it stops the
   obvious flood without pretending to be infrastructure. */
const seen = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 500) {
    // keep the map from growing without bound on a long-lived instance
    for (const [k, v] of seen) if (!v.some((t) => now - t < WINDOW_MS)) seen.delete(k);
  }
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  // Silently accept and drop anything that fills the honeypot: telling a bot
  // it failed only teaches it what to change.
  if (str(body.website)) return NextResponse.json({ ok: true });

  const name = str(body.name);
  const email = str(body.email);
  const company = str(body.company);
  const message = str(body.message);

  const invalid =
    name.length < 2 ||
    company.length < 2 ||
    message.length < 10 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  if (invalid) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  const endpoint = process.env.CONTACT_WEBHOOK_URL;
  if (!endpoint) {
    /* Not an error in the code — a deployment that has not been pointed at a
       destination yet. The client uses this to fall back to mail rather than
       to show a success it cannot justify. */
    return NextResponse.json(
      { ok: false, configured: false, error: "no-endpoint" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.CONTACT_WEBHOOK_TOKEN
          ? { authorization: `Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        source: site.url,
        receivedAt: new Date().toISOString(),
        name,
        email,
        company,
        message,
      }),
      // A hanging CRM must not hang the reader's browser.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, configured: true, error: "upstream" },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, configured: true, error: "upstream" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
