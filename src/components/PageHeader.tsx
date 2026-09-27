export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="container-page pb-6 pt-10">
      <h1 className="font-display text-4xl font-bold md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
