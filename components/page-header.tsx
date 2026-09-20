export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  return <div className="topbar">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{subtitle && <div className="subtitle">{subtitle}</div>}</div>
    {actions && <div className="actions">{actions}</div>}
  </div>;
}
