import type { CodeSample } from "@/components/visuals/code-window";

export const createOrderSamples: CodeSample[] = [
  {
    id: "curl",
    label: "cURL",
    language: "bash",
    code: `curl https://api.dittomart.in/api/v1/orders \\
  -H "Authorization: Bearer $DMGO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_order_ref": "SO-48213",
    "pickup":  { "lat": 13.0067, "lng": 80.2570, "contact": "+919000000001" },
    "drop":    { "lat": 13.0418, "lng": 80.2341, "contact": "+919000000002" },
    "vehicle_type": "BIKE",
    "product_type": "CHILLED",
    "min_temp": 2,
    "max_temp": 5,
    "cod_amount": 0,
    "sla_minutes": 60
  }'`,
  },
  {
    id: "node",
    label: "Node",
    language: "javascript",
    code: `import { DittoMartGo } from "@dittomart/go";

const go = new DittoMartGo(process.env.DMGO_API_KEY);

const order = await go.orders.create({
  client_order_ref: "SO-48213",
  pickup:  { lat: 13.0067, lng: 80.2570, contact: "+919000000001" },
  drop:    { lat: 13.0418, lng: 80.2341, contact: "+919000000002" },
  vehicle_type: "BIKE",
  product_type: "CHILLED",
  min_temp: 2,
  max_temp: 5,
  sla_minutes: 60,
});

console.log(order.tracking_url);`,
  },
  {
    id: "python",
    label: "Python",
    language: "python",
    code: `from dittomart_go import Client

go = Client(api_key=os.environ["DMGO_API_KEY"])

order = go.orders.create(
    client_order_ref="SO-48213",
    pickup={"lat": 13.0067, "lng": 80.2570, "contact": "+919000000001"},
    drop={"lat": 13.0418, "lng": 80.2341, "contact": "+919000000002"},
    vehicle_type="BIKE",
    product_type="CHILLED",
    min_temp=2,
    max_temp=5,
    sla_minutes=60,
)

print(order.tracking_url)`,
  },
];

export const createOrderResponse = `{
  "id": "ord_8f31c2a7",
  "client_order_ref": "SO-48213",
  "status": "ALLOCATING",
  "quoted_rate": 56.00,
  "currency_code": "INR",
  "rate_locked": true,
  "sla_deadline": "2026-08-05T18:46:00+05:30",
  "tracking_url": "https://track.dittomart.in/t_7Kq2mXa9",
  "created_at": "2026-08-05T17:46:12+05:30"
}`;

export const webhookSample: CodeSample[] = [
  {
    id: "payload",
    label: "Payload",
    language: "json",
    code: `{
  "event": "order.delivered",
  "id": "evt_2c9a71f0",
  "created_at": "2026-08-05T18:31:44+05:30",
  "data": {
    "order_id": "ord_8f31c2a7",
    "client_order_ref": "SO-48213",
    "delivered_at": "2026-08-05T18:31:40+05:30",
    "proof": {
      "type": "OTP",
      "verified": true,
      "photo_url": "https://cdn.dittomart.in/pod/8f31c2a7.jpg"
    },
    "temperature": { "min": 2.8, "max": 4.0, "breached": false }
  }
}`,
  },
  {
    id: "verify",
    label: "Verify",
    language: "javascript",
    code: `import crypto from "node:crypto";

// Every webhook is signed. Compare in constant time — a naive === here
// is a timing oracle.
function verify(rawBody, header, secret) {
  const [ts, sig] = header.split(",").map((p) => p.split("=")[1]);
  const expected = crypto
    .createHmac("sha256", secret)
    .update(ts + "." + rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expected)
  );
}`,
  },
];

export const quoteSample: CodeSample[] = [
  {
    id: "quote",
    label: "Quote",
    language: "bash",
    code: `curl https://api.dittomart.in/api/v1/quote \\
  -H "Authorization: Bearer $DMGO_API_KEY" \\
  -d '{
    "pickup":  { "lat": 13.0067, "lng": 80.2570 },
    "drop":    { "lat": 13.0418, "lng": 80.2341 },
    "product_type": "CHILLED"
  }'`,
  },
];

export const quoteResponse = `{
  "quoted_rate": 56.00,
  "currency_code": "INR",
  "serviceable": true,
  "matched_rule": { "priority": "P3", "scope": "client + zone" },
  "breakdown": [
    { "component": "base_fare", "amount": 25.00 },
    { "component": "distance",  "amount": 16.00, "detail": "2 km @ 8/km" },
    { "component": "cold_chain", "amount": 15.00 },
    { "component": "surge", "amount": 0.00, "detail": "x1.0" }
  ],
  "eta_minutes": 34
}`;
