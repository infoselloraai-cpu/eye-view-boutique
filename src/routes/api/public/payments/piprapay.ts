import { createFileRoute } from "@tanstack/react-router";

// PipraPay sends the customer back here (GET) and posts a webhook (POST).
// We never trust the incoming status: every payment is re-checked with PipraPay's verify API.
async function settle(orderId: string) {
  const { getAdmin, ppVerify } = await import("@/lib/payments.server");
  const db = await getAdmin();
  const { data: order } = await db.from("orders").select("id,total,payment_status,gateway_ref").eq("id", orderId).maybeSingle();
  if (!order?.gateway_ref) return { id: orderId, status: "failed" };
  if (order.payment_status === "paid") return { id: order.id, status: "paid" };
  const v = await ppVerify(order.gateway_ref);
  const st = String(v["status"] ?? "").toLowerCase();
  const okMeta = !v["metadata"] || v["metadata"]?.order_id === undefined || String(v["metadata"].order_id) === order.id;
  if (["completed", "paid", "success"].includes(st) && okMeta && Math.round(Number(v["amount"])) >= order.total) {
    await db.from("orders").update({ payment_status: "paid", transaction_id: String(v["transaction_id"] ?? v["pp_id"] ?? order.gateway_ref), status: "Processing" }).eq("id", order.id);
    return { id: order.id, status: "paid" };
  }
  const status = st === "pending" ? "pending" : st === "canceled" || st === "cancelled" ? "cancelled" : "failed";
  await db.from("orders").update({ payment_status: status }).eq("id", order.id).neq("payment_status", "paid");
  return { id: order.id, status };
}

export const Route = createFileRoute("/api/public/payments/piprapay")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = (url.searchParams.get("order") ?? "").slice(0, 20);
        const r = id ? await settle(id) : { id: "", status: "failed" };
        return Response.redirect(`${url.origin}/payment-result?id=${encodeURIComponent(r.id)}&status=${r.status}`, 303);
      },
      POST: async ({ request }) => {
        const id = (new URL(request.url).searchParams.get("order") ?? "").slice(0, 20);
        if (id) await settle(id);
        return new Response("ok");
      },
    },
  },
});
