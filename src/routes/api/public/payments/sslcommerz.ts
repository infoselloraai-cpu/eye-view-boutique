import { createFileRoute } from "@tanstack/react-router";

// SSLCommerz posts here for success / fail / cancel / IPN. We never trust the
// posted status: every success is re-checked with SSLCommerz's validation API.
export const Route = createFileRoute("/api/public/payments/sslcommerz")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const r = url.searchParams.get("r") ?? "fail";
        const form = await request.formData();
        const tranId = String(form.get("tran_id") ?? "").slice(0, 20);
        const valId = String(form.get("val_id") ?? "");
        const { getAdmin, sslValidate } = await import("@/lib/payments.server");
        const db = await getAdmin();
        let status = r === "cancel" ? "cancelled" : "failed";

        if ((r === "success" || r === "ipn") && valId && tranId) {
          const v = await sslValidate(valId);
          const { data: order } = await db.from("orders").select("id,total").eq("id", tranId).maybeSingle();
          if (order && (v.status === "VALID" || v.status === "VALIDATED") && v.tran_id === tranId && Math.round(Number(v.amount)) >= order.total) {
            status = "paid";
            await db.from("orders").update({ payment_status: "paid", transaction_id: v.bank_tran_id ?? valId, status: "Processing" }).eq("id", tranId);
          }
        }
        if (status !== "paid" && tranId) await db.from("orders").update({ payment_status: status }).eq("id", tranId).neq("payment_status", "paid");
        if (r === "ipn") return new Response("ok");
        return Response.redirect(`${url.origin}/payment-result?id=${encodeURIComponent(tranId)}&status=${status}`, 303);
      },
    },
  },
});
