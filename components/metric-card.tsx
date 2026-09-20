export function MetricCard({ label, value, delta, negative }: { label:string; value:string; delta?:string; negative?:boolean }) {
  return <div className="card"><div className="metric-label">{label}<span>•••</span></div><div className="metric">{value}</div>{delta && <div className={`delta ${negative?'neg':''}`}>{delta}</div>}</div>;
}
