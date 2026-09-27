const methods = ["bKash", "Nagad", "Rocket", "VISA", "Mastercard", "COD"];

export function PaymentBadges() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {methods.map((m) => (
        <span key={m} className="rounded bg-card px-2 py-1 text-[10px] font-bold text-card-foreground">{m}</span>
      ))}
    </div>
  );
}
