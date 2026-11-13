export default function StatsBar({ tracks }) {
  const total = tracks.length;
  const completed = tracks.filter((t) => t.currentBpm >= t.targetBpm).length;
  const inProgress = total - completed;

  const avgProgress =
    total === 0
      ? 0
      : Math.round(
          tracks.reduce((acc, item) => {
            const ratio = Math.min(100, Math.round((item.currentBpm / item.targetBpm) * 100));
            return acc + ratio;
          }, 0) / total
        );

  const stats = [
    { label: 'Toplam Egzersiz / Parça', value: total, color: 'text-zinc-100' },
    { label: 'Devam Eden', value: inProgress, color: 'text-amber-400' },
    { label: 'Hedef BPM Tamamlanan', value: completed, color: 'text-emerald-400' },
    { label: 'Ortalama Tempo İlerlemesi', value: `%${avgProgress}`, color: 'text-sky-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-md"
        >
          <p className="text-xs text-zinc-400 font-medium">{stat.label}</p>
          <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}