import { useState } from 'react';

export default function PracticeCard({
  track,
  isSelected,
  onSelectForMetronome,
  onChangeBpm,
  onUpdateNotes,
  onDelete,
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(track.notes || '');

  const isCompleted = track.currentBpm >= track.targetBpm;
  const progress = Math.min(100, Math.round((track.currentBpm / track.targetBpm) * 100));

  const handleSaveNote = () => {
    onUpdateNotes(track.id, noteDraft.trim());
    setIsEditingNote(false);
  };

  return (
    <div
      className={`bg-zinc-900 border rounded-2xl p-5 transition flex flex-col justify-between gap-4 ${
        isSelected
          ? 'border-amber-500/80 shadow-lg shadow-amber-500/10'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 mb-2">
              {track.artistOrCategory}
            </span>
            <h3 className="text-base font-bold text-zinc-100 leading-snug">{track.title}</h3>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isCompleted ? 'Tamamlandı' : 'Çalışılıyor'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
          <span>
            Akort: <strong className="text-zinc-200">{track.tuning}</strong>
          </span>
          <span>•</span>
          <span>Son Pratik: {track.lastPracticed}</span>
        </div>

        {/* Not Görüntüleme / Düzenleme Alanı */}
        {isEditingNote ? (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Teknik notunuzu yazın..."
              className="w-full bg-zinc-950 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => {
                  setNoteDraft(track.notes || '');
                  setIsEditingNote(false);
                }}
                className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 text-[11px] cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSaveNote}
                className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[11px] cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNote(true)}
            title="Notu düzenlemek için tıklayın"
            className="text-xs text-zinc-400 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-lg p-2.5 mt-3 cursor-pointer transition flex items-center justify-between gap-2"
          >
            <span>{track.notes || 'Not eklemek için tıklayın...'}</span>
            <span className="text-[10px] text-zinc-500 shrink-0">Düzenle</span>
          </div>
        )}
      </div>

      {/* İlerleme Çubuğu ve Kontroller */}
      <div className="space-y-3 pt-2 border-t border-zinc-800/80">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-zinc-400">
              Mevcut: <strong className="text-white">{track.currentBpm} BPM</strong>
            </span>
            <span className="text-zinc-400">
              Hedef: <strong className="text-amber-400">{track.targetBpm} BPM</strong> (%{progress})
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectForMetronome(track)}
            className="flex-1 py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition cursor-pointer"
          >
            Metronoma Aktar
          </button>

          <button
            onClick={() => onChangeBpm(track.id, -5)}
            className="py-2 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-bold transition cursor-pointer"
            title="Hızı 5 BPM düşür"
          >
            -5
          </button>

          <button
            onClick={() => onChangeBpm(track.id, 5)}
            className="py-2 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
            title="Hızı 5 BPM artır"
          >
            +5
          </button>

          <button
            onClick={() => onDelete(track.id)}
            className="py-2 px-2.5 rounded-lg bg-rose-600/15 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold transition cursor-pointer"
            title="Sil"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}