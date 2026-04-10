import { useState, useMemo } from 'react';

// WSFU-based pipe sizing (IPC Table 604.3, copper Type L)
const SUPPLY_SIZES = [
  { size: '1/2"', maxWSFU: 4, maxGPM: 4 },
  { size: '3/4"', maxWSFU: 14, maxGPM: 10 },
  { size: '1"', maxWSFU: 30, maxGPM: 18 },
  { size: '1-1/4"', maxWSFU: 46, maxGPM: 28 },
  { size: '1-1/2"', maxWSFU: 70, maxGPM: 40 },
  { size: '2"', maxWSFU: 124, maxGPM: 72 },
  { size: '2-1/2"', maxWSFU: 210, maxGPM: 110 },
  { size: '3"', maxWSFU: 370, maxGPM: 170 },
];

// DFU-based drain sizing (IPC Table 710.1)
const DRAIN_SIZES = [
  { size: '1-1/2"', maxDFU: 3 },
  { size: '2"', maxDFU: 6 },
  { size: '3"', maxDFU: 20 },
  { size: '4"', maxDFU: 160 },
  { size: '6"', maxDFU: 620 },
];

const FIXTURES = [
  { name: 'Lavatory (bathroom sink)', wsfu: 1, dfu: 1 },
  { name: 'Kitchen sink', wsfu: 1.4, dfu: 2 },
  { name: 'Bathtub / Shower', wsfu: 1.4, dfu: 2 },
  { name: 'Toilet (tank type)', wsfu: 2.2, dfu: 3 },
  { name: 'Clothes washer', wsfu: 1.4, dfu: 2 },
  { name: 'Dishwasher', wsfu: 1.4, dfu: 2 },
  { name: 'Hose bibb', wsfu: 2.2, dfu: 0 },
  { name: 'Floor drain', wsfu: 0, dfu: 2 },
  { name: 'Utility sink', wsfu: 1.4, dfu: 2 },
  { name: 'Bar sink', wsfu: 1, dfu: 1 },
];

export default function PipeSizingCalculator() {
  const [mode, setMode] = useState('supply');
  const [counts, setCounts] = useState(Object.fromEntries(FIXTURES.map(f => [f.name, 0])));

  const setCount = (name, val) => setCounts(prev => ({ ...prev, [name]: Math.max(0, parseInt(val) || 0) }));

  const totals = useMemo(() => {
    let wsfu = 0, dfu = 0;
    FIXTURES.forEach(f => {
      const c = counts[f.name] || 0;
      wsfu += f.wsfu * c;
      dfu += f.dfu * c;
    });
    return { wsfu: Math.round(wsfu * 10) / 10, dfu };
  }, [counts]);

  const supplyPipe = SUPPLY_SIZES.find(s => s.maxWSFU >= totals.wsfu);
  const drainPipe = DRAIN_SIZES.find(s => s.maxDFU >= totals.dfu);

  const hasFixtures = Object.values(counts).some(c => c > 0);
  const hasDrainFixtures = FIXTURES.some(f => f.dfu > 0 && (counts[f.name] || 0) > 0);
  const hasToilet = (counts['Toilet (tank type)'] || 0) > 0;

  return (
    <div className="stack">
      <div className="toggle-group">
        <button className={`toggle-option ${mode === 'supply' ? 'active' : ''}`} onClick={() => setMode('supply')}>
          Water Supply
        </button>
        <button className={`toggle-option ${mode === 'drain' ? 'active' : ''}`} onClick={() => setMode('drain')}>
          DWV Drain
        </button>
      </div>

      <div className="card" style={{ padding: '0.75rem' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>Fixture Count</h4>
        <div className="stack-sm">
          {FIXTURES.filter(f => mode === 'supply' ? f.wsfu > 0 : f.dfu > 0).map(f => (
            <div key={f.name} className="row-between">
              <span style={{ fontSize: '0.875rem', flex: 1 }}>{f.name}</span>
              <span className="text-secondary" style={{ fontSize: '0.75rem', marginRight: 8 }}>
                {mode === 'supply' ? `${f.wsfu} WSFU` : `${f.dfu} DFU`}
              </span>
              <input
                type="number"
                min="0"
                value={counts[f.name] || 0}
                onChange={e => setCount(f.name, e.target.value)}
                style={{
                  width: 56, textAlign: 'center', padding: '4px',
                  backgroundColor: '#0D0D0F', border: '1px solid #2A2A2E',
                  borderRadius: 6, color: '#F5F5F5', fontSize: '0.875rem',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {hasFixtures && (
        <div className="card" style={{ textAlign: 'center' }}>
          {mode === 'supply' ? (
            <>
              <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                Total: {totals.wsfu} WSFU
              </p>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 4 }}>Minimum Supply Pipe Size</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>
                {supplyPipe?.size || 'Exceeds table — consult engineer'}
              </p>
            </>
          ) : (
            <>
              <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: 2 }}>
                Total: {totals.dfu} DFU
              </p>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 4 }}>Minimum Drain Pipe Size</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>
                {drainPipe?.size || 'Exceeds table — consult engineer'}
              </p>
              {hasToilet && drainPipe && parseFloat(drainPipe.size) < 3 && (
                <div className="warning-box" style={{ marginTop: 8, fontSize: '0.8125rem', textAlign: 'left' }}>
                  Toilets require minimum 3" drain regardless of DFU count.
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="info-box" style={{ fontSize: '0.8125rem' }}>
        {mode === 'supply'
          ? 'Based on IPC Table 604.3 (copper Type L). Derate for long runs, elevation, and PRV losses. PEX sizing differs — check manufacturer charts.'
          : 'Based on IPC Table 710.1. Horizontal drains: 1/4" per foot slope (3" and under), 1/8" per foot (4" and larger). Building drain minimum 4" for residential.'}
      </div>
    </div>
  );
}
