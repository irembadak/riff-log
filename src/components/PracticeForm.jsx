import { useState } from 'react';

export default function PracticeForm({ onAddTrack }) {
  const [title, setTitle] = useState('');
  const [artistOrCategory, setArtistOrCategory] = useState('');
  const [tuning, setTuning] = useState('E Standard');
  const [currentBpm, setCurrentBpm] = useState(90);
  const [targetBpm, setTargetBpm] = useState(140);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTrack = {
      id: Date.now().toString(),
      title: title.trim(),
      artistOrCategory: artistOrCategory.trim() || 'Genel Teknik',
      tuning: tuning.trim() || 'E Standard',
      currentBpm: Number(currentBpm),
      targetBpm: Number(targetBpm),
      notes: notes.trim(),
      lastPracticed: new Date().toLocaleDateString('tr-TR'),
    };

    onAddTrack(newTrack);
    setTitle('');
    setArtistOrCategory('');
    setNotes('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4"
    >
      <h2 className="text-lg font-bold text-zinc-100">Yeni Parça veya Teknik Egzersiz Ekle</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Parça / Egzersiz Adı *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Alternate Picking Chromatic"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Sanatçı / Teknik Kategori
          </label>
          <input
            type="text"
            placeholder="Örn: Fingerstyle / Solo / Ritim"
            value={artistOrCategory}
            onChange={(e) => setArtistOrCategory(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Akort Düzeni (Tuning)
          </label>
          <input
            type="text"
            placeholder="Örn: E Standard, Drop D, D-G-B-E"
            value={tuning}
            onChange={(e) => setTuning(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Başlangıç Hızı (Mevcut BPM)
          </label>
          <input
            type="number"
            min="40"
            max="240"
            required
            value={currentBpm}
            onChange={(e) => setCurrentBpm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Hedef Hız (Target BPM)
          </label>
          <input
            type="number"
            min="40"
            max="240"
            required
            value={targetBpm}
            onChange={(e) => setTargetBpm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Çalışma Notu (İsteğe Bağlı)
          </label>
          <input
            type="text"
            placeholder="Örn: 3. ölçüdeki geçişe dikkat et"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition cursor-pointer"
        >
          + Listeye Ekle
        </button>
      </div>
    </form>
  );
}