import { useState } from 'react';

export default function BeforeAfterSlider({ beforeImage, afterImage }: { beforeImage?: string; afterImage?: string }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
  };

  if (!beforeImage && !afterImage) return null;

  return (
    <div className="card">
      <h3 className="font-bold text-lg text-slate-900 mb-4">Before & After Comparison</h3>
      {!afterImage ? (
        <div className="text-center py-8 text-slate-500">
          {beforeImage && <img src={beforeImage} alt="Before" className="max-h-64 mx-auto rounded-xl mb-3" />}
          <p className="text-sm italic">Resolution image not uploaded yet.</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden cursor-ew-resize select-none" onMouseMove={handleMove} onMouseDown={() => setDragging(true)} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}>
          <img src={afterImage} alt="After" className="w-full h-64 md:h-80 object-cover" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
            <img src={beforeImage} alt="Before" className="w-full h-64 md:h-80 object-cover" style={{ minWidth: '100%' }} />
          </div>
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 font-bold text-xs">⇔</div>
          </div>
          <div className="absolute top-3 left-3 badge bg-black/50 text-white text-xs">Before</div>
          <div className="absolute top-3 right-3 badge bg-black/50 text-white text-xs">After</div>
        </div>
      )}
    </div>
  );
}
