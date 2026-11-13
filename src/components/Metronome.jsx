import { useState, useEffect, useRef } from 'react';

const SUBDIVISIONS = [
  {
    id: 'quarter',
    label: 'Dörtlük (1/4)',
    ratios: [0],
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <ellipse cx="10" cy="18" rx="3.8" ry="2.7" transform="rotate(-20 10 18)" />
        <rect x="12.6" y="5" width="1.8" height="13" />
      </svg>
    ),
  },
  {
    id: 'eighth',
    label: 'Sekizlik (1/8)',
    ratios: [0, 0.5],
    icon: (
      <svg viewBox="0 0 28 24" className="w-7 h-6 fill-current">
        <ellipse cx="7" cy="18" rx="3.4" ry="2.4" transform="rotate(-20 7 18)" />
        <rect x="9.3" y="5" width="1.7" height="13" />
        <ellipse cx="19" cy="18" rx="3.4" ry="2.4" transform="rotate(-20 19 18)" />
        <rect x="21.3" y="5" width="1.7" height="13" />
        <rect x="9.3" y="4.5" width="13.7" height="2.6" />
      </svg>
    ),
  },
  {
    id: 'sixteenth',
    label: 'Onaltılık (1/16)',
    ratios: [0, 0.25, 0.5, 0.75],
    icon: (
      <svg viewBox="0 0 36 24" className="w-8 h-6 fill-current">
        {[5, 13, 21, 29].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="18.5" rx="2.7" ry="2" transform={`rotate(-20 ${x} 18.5)`} />
            <rect x={x + 1.8} y="6" width="1.4" height="12.5" />
          </g>
        ))}
        <rect x="6.8" y="5" width="25.4" height="2.1" />
        <rect x="6.8" y="8.5" width="25.4" height="2.1" />
      </svg>
    ),
  },
  {
    id: 'triplet',
    label: 'Üçleme (Triplet)',
    ratios: [0, 1 / 3, 2 / 3],
    icon: (
      <svg viewBox="0 0 32 26" className="w-8 h-6 fill-current">
        <text x="16" y="6.5" textAnchor="middle" fontSize="7" fontWeight="bold" fontStyle="italic">
          3
        </text>
        {[6, 15, 24].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="20" rx="2.9" ry="2.1" transform={`rotate(-20 ${x} 20)`} />
            <rect x={x + 2} y="8.5" width="1.5" height="11.5" />
          </g>
        ))}
        <rect x="8" y="8" width="19.5" height="2.3" />
      </svg>
    ),
  },
  {
    id: 'swing',
    label: 'Swing / Shuffle',
    ratios: [0, 2 / 3],
    icon: (
      <svg viewBox="0 0 30 26" className="w-7 h-6 fill-current">
        <text x="15" y="6.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fontStyle="italic">
          3
        </text>
        <path d="M7 9 V7 H12 M18 7 H23 V9" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <ellipse cx="8" cy="20" rx="3.1" ry="2.2" transform="rotate(-20 8 20)" />
        <rect x="10.2" y="9" width="1.5" height="11" />
        <ellipse cx="20" cy="20" rx="3.1" ry="2.2" transform="rotate(-20 20 20)" />
        <rect x="22.2" y="9" width="1.5" height="11" />
        <path d="M22.2 9 Q26 11.5 24.5 14.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </svg>
    ),
  },
];

export default function Metronome({ bpm, setBpm, activeTrackTitle }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [subdivision, setSubdivision] = useState('quarter');
  const [speedTrainer, setSpeedTrainer] = useState(false);
  const [secondsPracticed, setSecondsPracticed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const audioCtxRef = useRef(null);
  const tapTimesRef = useRef([]);
  const subTimeoutsRef = useRef([]);
  const measureCountRef = useRef(0);

  const playClick = (toneType) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 'accent' = 1. vuruş (1050 Hz), 'beat' = ana vuruş (750 Hz), 'sub' = ara nota bölünmesi (520 Hz)
    if (toneType === 'accent') {
      osc.frequency.value = 1050;
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
    } else if (toneType === 'beat') {
      osc.frequency.value = 750;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
    } else {
      osc.frequency.value = 520;
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  };

  // Ana Metronom + Subdivision + Speed Trainer döngüsü
  useEffect(() => {
    subTimeoutsRef.current.forEach(clearTimeout);
    subTimeoutsRef.current = [];

    if (!isPlaying) {
      setBeat(0);
      measureCountRef.current = 0;
      return;
    }

    const currentSubObj = SUBDIVISIONS.find((s) => s.id === subdivision) || SUBDIVISIONS[0];
    const beatDurationMs = (60 / bpm) * 1000;
    let currentBeat = 0;

    const triggerBeatWithSubdivisions = (beatIndex) => {
      // Ana vuruşu çal
      playClick(beatIndex === 0 ? 'accent' : 'beat');
      setBeat(beatIndex + 1);

      // Ara bölünmeleri (sekizlik, onaltılık, üçleme, swing) zamanla
      currentSubObj.ratios.slice(1).forEach((ratio) => {
        const timeoutId = setTimeout(() => {
          playClick('sub');
        }, beatDurationMs * ratio);
        subTimeoutsRef.current.push(timeoutId);
      });
    };

    triggerBeatWithSubdivisions(0);

    const timer = setInterval(() => {
      currentBeat = (currentBeat + 1) % beatsPerMeasure;

      // Speed Trainer: Her 4 ölçüde bir otomatik +5 BPM
      if (currentBeat === 0 && speedTrainer) {
        measureCountRef.current += 1;
        if (measureCountRef.current % 4 === 0) {
          setBpm((prev) => Math.min(240, prev + 5));
        }
      }

      triggerBeatWithSubdivisions(currentBeat);
    }, beatDurationMs);

    return () => {
      clearInterval(timer);
      subTimeoutsRef.current.forEach(clearTimeout);
      subTimeoutsRef.current = [];
    };
  }, [isPlaying, bpm, beatsPerMeasure, subdivision, speedTrainer, setBpm]);

  // Pratik kronometresi
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsPracticed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Tap Tempo
  const handleTapTempo = () => {
    const now = Date.now();
    const taps = tapTimesRef.current;

    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);
    if (taps.length > 5) taps.shift();

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      setBpm(Math.min(240, Math.max(40, calculatedBpm)));
    }
  };

  // Klavye Kısayolları (Space: Başlat/Durdur, T: Tap Tempo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => {
          const next = !prev;
          if (next) setIsTimerRunning(true);
          return next;
        });
      } else if (e.key.toLowerCase() === 't') {
        handleTapTempo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const adjustBpm = (amount) => {
    setBpm((prev) => Math.min(240, Math.max(40, prev + amount)));
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Üst Satır: Başlık, Ölçü Birimi ve LED Göstergesi */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Stüdyo Metronomu & Ritim Bölünmeleri
          </span>
          <h2 className="text-lg font-bold text-zinc-100 mt-0.5">
            {activeTrackTitle ? `Çalışılan: ${activeTrackTitle}` : 'Serbest Tempo Modu'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ölçü Birimi Seçici */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {[
              { label: '4/4', value: 4 },
              { label: '3/4', value: 3 },
              { label: '6/8', value: 6 },
              { label: '7/8', value: 7 },
            ].map((sig) => (
              <button
                key={sig.label}
                onClick={() => setBeatsPerMeasure(sig.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  beatsPerMeasure === sig.value
                    ? 'bg-zinc-800 text-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {sig.label}
              </button>
            ))}
          </div>

          {/* Görsel LED'ler */}
          <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800">
            {Array.from({ length: beatsPerMeasure }, (_, idx) => idx + 1).map((dot) => (
              <span
                key={dot}
                className={`w-3 h-3 rounded-full transition-all duration-75 ${
                  isPlaying && beat === dot
                    ? dot === 1
                      ? 'bg-amber-500 scale-125 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : 'bg-emerald-400 scale-110 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Orta Satır: BPM Kontrolü ve Başlat */}
      <div className="flex flex-col md:flex-row items-center gap-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBpm(-5)}
            className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition cursor-pointer"
          >
            -5
          </button>
          <button
            onClick={() => adjustBpm(-1)}
            className="w-9 h-9 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 font-semibold transition cursor-pointer"
          >
            -1
          </button>

          <div className="text-center min-w-[85px]">
            <span className="text-4xl font-black text-white tracking-tight">{bpm}</span>
            <span className="block text-xs text-zinc-400 font-medium">BPM</span>
          </div>

          <button
            onClick={() => adjustBpm(1)}
            className="w-9 h-9 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 font-semibold transition cursor-pointer"
          >
            +1
          </button>
          <button
            onClick={() => adjustBpm(5)}
            className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition cursor-pointer"
          >
            +5
          </button>
        </div>

        <div className="w-full space-y-2">
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Kısayollar: [Space] Başlat/Durdur • [T] Tap Tempo</span>
            <button
              onClick={() => setBpm((prev) => Math.max(40, Math.round(prev * 0.5)))}
              className="text-amber-400/90 hover:text-amber-300 font-semibold cursor-pointer"
            >
              ½ Yarı Hızda Çalış
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleTapTempo}
            className="flex-1 md:flex-initial px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-bold text-xs tracking-wide transition cursor-pointer active:scale-95"
          >
            TAP TEMPO
          </button>

          <button
            onClick={() => {
              const nextState = !isPlaying;
              setIsPlaying(nextState);
              if (nextState && !isTimerRunning) setIsTimerRunning(true);
            }}
            className={`flex-1 md:flex-initial px-7 py-3 rounded-xl font-bold text-sm tracking-wide transition cursor-pointer shrink-0 ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
            }`}
          >
            {isPlaying ? 'DURDUR' : 'BAŞLAT'}
          </button>
        </div>
      </div>

      {/* Nota Bölünmeleri (Subdivision Seçici Kartlar) */}
      <div className="pt-4 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-zinc-400">
            Ritim Bölünmesi (Subdivision):{' '}
            <strong className="text-amber-400">
              {SUBDIVISIONS.find((s) => s.id === subdivision)?.label}
            </strong>
          </span>

          <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={speedTrainer}
              onChange={(e) => setSpeedTrainer(e.target.checked)}
              className="accent-amber-500 w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span>Speed Trainer (Her 4 ölçüde +5 BPM)</span>
          </label>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {SUBDIVISIONS.map((item) => {
            const active = subdivision === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubdivision(item.id)}
                title={item.label}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold'
                    : 'bg-zinc-950 hover:bg-zinc-800/80 text-zinc-300 border-zinc-800'
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1.5 hidden sm:block truncate max-w-full">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alt Satır: Pratik Kronometresi */}
      <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <span>Oturum Süresi:</span>
          <span className="font-mono text-sm font-bold text-emerald-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
            {formatTime(secondsPracticed)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition cursor-pointer"
          >
            {isTimerRunning ? 'Sayacı Duraklat' : 'Sayacı Başlat'}
          </button>
          <button
            onClick={() => {
              setIsTimerRunning(false);
              setSecondsPracticed(0);
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 font-semibold transition cursor-pointer"
          >
            Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}