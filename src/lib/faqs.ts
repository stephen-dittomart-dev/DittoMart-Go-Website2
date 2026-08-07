export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "Which delivery networks do you actually route across?",
    a: "Nine: Adloggs, Shiprocket Quick, Qwqer, Flash by Shadowfax, Quicka, Pidge and Ek Bharath on the partner rail, Pro Routing as the optimisation layer, and the ONDC rail which carries Ola and Rapido. Our own agency fleet sits alongside them. Every one is reachable through the same API call.",
  },
  {
    q: "Do we need to sign contracts with each delivery provider?",
    a: "No. You contract with us; we hold all nine provider relationships. That is most of the value — one agreement, one rate card, one invoice, and no negotiation every time you want to add capacity in a new pincode.",
  },
  {
    q: "How do you reach Ola and Rapido without a direct contract?",
    a: "Through ONDC. We are a registered participant on the open network's LOG10 logistics domain, in both directions — we buy capacity from providers on the network including Ola and Rapido, and we publish our own fleet back to it so idle riders still earn. One integration, national reach, no bilateral negotiation.",
  },
  {
    q: "What happens if a provider does not accept an order?",
    a: "Broadcast dispatch triggers every eligible provider in parallel, so a single provider refusing costs you nothing. If nobody accepts inside the window, we automatically retry the next ranked set, then escalate to our operations team and notify you — before your customer notices.",
  },
  {
    q: "How is double-booking prevented when you broadcast to everyone?",
    a: "The first provider to accept takes a distributed lock on the order. Exactly one acceptance can ever commit; every other acceptance is rejected idempotently, and cancellations reach the remaining providers in under two seconds. A nightly reconciliation matches provider invoices against accepted orders and auto-disputes any charge for a cancelled assignment.",
  },
  {
    q: "How does billing work?",
    a: "You hold a prepaid wallet. Each order is checked against your balance before any provider is contacted, so an unfunded delivery never leaves. A GST invoice is generated monthly and reconciles line by line against your transaction ledger. Enterprise accounts can be moved to postpaid terms.",
  },
  {
    q: "Can we use our own delivery fleet alongside yours?",
    a: "Yes. Your fleet becomes another rail in the routing engine, ranked alongside third-party providers on cost, ETA and reliability. Use your own riders where they are efficient and overflow to the network where they are not.",
  },
  {
    q: "Is our data isolated from other customers?",
    a: "Tenant isolation is enforced at the data-access layer rather than in the interface, and every endpoint is covered by an automated suite that attempts cross-tenant reads and must fail. No customer can see another customer's orders, rates or volumes.",
  },
  {
    q: "Which cities do you operate in?",
    a: "Chennai today, with the network model extending to any city where we can contract supply. Serviceability is checked per pincode through the API, so you can build against national coverage and light up cities as they come online.",
  },
  {
    q: "How long does integration take?",
    a: "Sandbox credentials are issued at signup and most teams have a working integration inside a day. There are nine endpoints and one webhook contract — the whole surface fits on a page.",
  },
];
