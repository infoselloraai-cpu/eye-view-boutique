import { createFileRoute } from "@tanstack/react-router";

// bKash redirects the customer here after payment; we execute + verify server-side.
export const Route = createFileRoute("/api/public/payments/bkash")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const paymentID = (url.searchParams.get("paymentID") ?? "").slice(0, 100);
        const s = url.searchParams.get("status");
        const { getAdmin, bkExecute } = await import("@/lib/payments.server");
        const db = await getAdmin();
        const { data: order } = await db.from("orders").select("id,total,payment_status").eq("gateway_ref", paymentID).maybeSingle();
        if (!order) return Response.redirect(`${url.origin}/payment-result?status=failed`, 303);
        let status = s === "cancel" ? "cancelled" : "failed";
        if (s === "success" && order.payment_status !== "paid") {
          const r = await bkExecute(paymentID);
          if (r.transactionStatus === "Completed" && r.merchantInvoiceNumber === order.id && Math.round(Number(r.amount)) >= order.total) {
            status = "paid";
            await db.from("orders").update({ payment_status: "paid", transaction_id: r.trxID, status: "Processing" }).eq("id", order.id);
          }
        } else if (order.payment_status === "paid") status = "paid";
        if (status !== "paid") await db.from("orders").update({ payment_status: status }).eq("id", order.id);
        return Response.redirect(`${url.origin}/payment-result?id=${order.id}&status=${status}`, 303);
      },
    },
  },
});
