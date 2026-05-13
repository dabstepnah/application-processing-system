export const Card = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="rounded-xl bg-appCard p-5 shadow-card transition hover:bg-appHover">
    {title && <h3 className="mb-3 text-lg font-semibold text-textPrimary">{title}</h3>}
    {children}
  </div>
);
