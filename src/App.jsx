import { useState, useEffect, useRef } from 'react';
import Metronome from './components/Metronome';
import StatsBar from './components/StatsBar';
import PracticeForm from './components/PracticeForm';
import PracticeCard from './components/PracticeCard';

const INITIAL_TRACKS = [
  {
    id: '1',
    title: 'Chromatic Alternate Picking Warmup',
    artistOrCategory: 'Teknik Egzersiz',
    tuning: 'E Standard',
    currentBpm: 110,
    targetBpm: 150,
    notes: 'Her tel geçişinde pena yönünü bozmadan temiz vuruş.',
    lastPracticed: '13.11.2026',
  },
  {
    id: '2',
    title: 'Syncopated Rhythm & Palm Muting',
    artistOrCategory: 'Ritim & Tuşe',
    tuning: 'Drop D',
    currentBpm: 135,
    targetBpm: 135,
    notes: 'Susturma dengesini köprü üzerinde sabit tut.',
    lastPracticed: '12.11.2026',
  },
];

export default function App() {
  const [tracks, setTracks] = useState(() => {
    const saved = localStorage.getItem('rifflog_tracks');
    return saved ? JSON.parse(saved) : INITIAL_TRACKS;
  });

  const [bpm, setBpm] = useState(110);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [filter, setFilter] = useState('all');
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('rifflog_tracks', JSON.stringify(tracks));
  }, [tracks]);

  const handleAddTrack = (newTrack) => {
    setTracks([newTrack, ...tracks]);
  };

  const handleChangeBpm = (id, amount) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id !== id) return track;
        const updatedBpm = Math.min(240, Math.max(40, track.currentBpm + amount));
        if (activeTrackId === id) {
          setBpm(updatedBpm);
        }
        return {
          ...track,
          currentBpm: updatedBpm,
          lastPracticed: new Date().toLocaleDateString('tr-TR'),
        };
      })
    );
  };

  const handleUpdateNotes = (id, newNote) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === id ? { ...track, notes: newNote } : track))
    );
  };

  const handleDeleteTrack = (id) => {
    setTracks((prev) => prev.filter((track) => track.id !== id));
    if (activeTrackId === id) {
      setActiveTrackId(null);
    }
  };

  const handleSelectForMetronome = (track) => {
    setActiveTrackId(track.id);
    setBpm(track.currentBpm);
  };

  // JSON Yedek İndirme
  const handleExportJson = () => {
    const dataStr = JSON.stringify(tracks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rifflog-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // JSON Yedek Yükleme
  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          setTracks(parsed);
        }
      } catch {
        alert('Geçersiz JSON yedek dosyası.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeTrack = tracks.find((t) => t.id === activeTrackId);

  const filteredTracks = tracks.filter((track) => {
    const isCompleted = track.currentBpm >= track.targetBpm;
    if (filter === 'completed') return isCompleted;
    if (filter === 'in_progress') return !isCompleted;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      {/* Üst Başlık */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-zinc-950 text-lg">
              R
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">RiffLog</h1>
              <p className="text-xs text-zinc-400">Müzik Pratiği & Repertuvar Tempo Takipçisi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition cursor-pointer"
            >
              Yedek İndir (JSON)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition cursor-pointer"
            >
              Yedek Yükle
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        <StatsBar tracks={tracks} />

        <Metronome
          bpm={bpm}
          setBpm={setBpm}
          activeTrackTitle={activeTrack ? activeTrack.title : null}
        />

        <PracticeForm onAddTrack={handleAddTrack} />

        {/* Liste ve Filtreleme */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-zinc-100">Pratik Listesi</h2>

            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-fit">
              {[
                { key: 'all', label: 'Tümü' },
                { key: 'in_progress', label: 'Çalışılıyor' },
                { key: 'completed', label: 'Tamamlandı' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filter === tab.key
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTracks.length === 0 ? (
            <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-10 text-center text-zinc-500 text-sm">
              Bu filtrede gösterilecek parça veya egzersiz bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTracks.map((track) => (
                <PracticeCard
                  key={track.id}
                  track={track}
                  isSelected={track.id === activeTrackId}
                  onSelectForMetronome={handleSelectForMetronome}
                  onChangeBpm={handleChangeBpm}
                  onUpdateNotes={handleUpdateNotes}
                  onDelete={handleDeleteTrack}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}