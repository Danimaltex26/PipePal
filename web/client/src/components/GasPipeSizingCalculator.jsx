import { useState, useMemo } from 'react';

// Natural gas capacity (BTU/hr) by pipe size and length — black iron, 0.5 psi system
// Based on IFGC/NFPA 54 Table 402.4
const GAS_TABLE = [
  // [length_ft, 1/2", 3/4", 1", 1-1/4", 1-1/2", 2"]
  [10, 132000, 278000, 520000, 1050000, 1600000, 2900000],
  [20, 92000, 213000, 430000, 786000, 1100000, 2100000],
  [30, 73000, 170000, 350000, 625000, 890000, 1650000],
  [40, 63000, 152000, 300000, 545000, 780000, 1450000],
  [50, 56000, 130000, 265000, 487000, 690000, 1280000],
  [60, 50000, 118000, 240000, 440000, 630000, 1150000],
  [80, 43000, 102000, 205000, 380000, 540000, 990000],
  [100, 38000, 90000, 185000, 340000, 480000, 880000],
  [150, 31000, 73000, 150000, 275000, 390000, 720000],
  [200, 26000, 63000, 128000, 237000, 335000, 620000],
];

const PIPE_SIZES = ['1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"'];

const APPLIANCES = [
  { name: 'Furnace (small)', btu: 40000 },
  { name: 'Furnace (medium)', btu: 80000 },
  { name: 'Furnace (large)', btu: 120000 },
  { name: 'Water heater (40 gal)', btu: 40000 },
  { name: 'Water heater (50 gal)', btu: 50000 },
  { name: 'Tankless water heater', btu: 199000 },
  { name: 'Gas range / oven', btu: 65000 },
  { name: 'Gas dryer', btu: 35000 },
  { name: 'Gas fireplace / log set', btu: 40000 },
  { name: 'Pool heater', btu: 400000 },
  { name: 'Outdoor grill (built-in)', btu: 60000 },
  { name: 'Generator', btu: 200000 },
];

function interpolate(table, length) {
  if (length <= table[0][0]) return table[0];
  if (length >= table[table.length - 1][0]) return table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    if (length >= table[i][0] && length <= table[i + 1][0]) {
      const ratio = (length - table[i][0]) / (table[i + 1][0] - table[i][0]);
      return table[i].map((v, j) => j === 0 ? length : Math.round(v + (table[i + 1][j] - v) * ratio));
    }
  }
  return table[table.length - 1];
}

export default function GasPipeSizingCalculator() {
  const [counts, setCounts] = useState(Object.fromEntries(APPLIANCES.map(a => [a.name, 0])));
  const [pipeLength, setPipeLength] = useState('');

  const setCount = (name, val) => setCounts(prev => ({ ...prev, [name]: Math.max(0, parseInt(val) || 0) }));

  const totalBTU = useMemo(() => {
    return APPLIANCES.reduce((sum, a) => sum + (a.btu * (counts[a.name] || 0)), 0);
  }, [counts]);

  const result = useMemo(() => {
    const len = parseFloat(pipeLength);
    if (!len || len <= 0 || totalBTU <= 0) return null;

    const row = interpolate(GAS_TABLE, len);
    const capacities = PIPE_SIZES.map((size, i) => ({
      size,
      capacity: row[i + 1],
      sufficient: row[i + 1] >= totalBTU,
    }));

    const minPipe = capacities.find(c => c.sufficient);
    return { capacities, minPipe, totalBTU, pipeLength: len };
  }, [totalBTU, pipeLength]);

  const hasAppliances = Object.values(counts).some(c => c > 0);

  return (
    <div className="stack">
      <div className="card" style={{ padding: '0.75rem' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>Gas Appliances</h4>
        <div className="stack-sm">
          {APPLIANCES.map(a => (
            <div key={a.name} className="row-between">
              <span style={{ fontSize: '0.875rem', flex: 1 }}>{a.name}</span>
              <span className="text-secondary" style={{ fontSize: '0.75rem', marginRight: 8 }}>
                {(a.btu / 1000).toFixed(0)}K BTU
              </span>
              <input
                type="number"
                min="0"
                value={counts[a.name] || 0}
                onChange={e => setCount(a.name, e.target.value)}
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

      {hasAppliances && (
        <div className="info-box" style={{ fontSize: '0.875rem' }}>
          Total connected load: <strong>{(totalBTU / 1000).toFixed(0)}K BTU/hr</strong>
        </div>
      )}

      <div className="form-group">
        <label>Longest pipe run from meter (feet)</label>
        <input className="input" type="number" placeholder="e.g. 50" value={pipeLength} onChange={e => setPipeLength(e.target.value)} />
      </div>

      {result && (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 4 }}>Minimum Gas Pipe Size (Black Iron)</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>
              {result.minPipe?.size || 'Exceeds 2" — consult engineer'}
            </p>
            <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: 4 }}>
              {result.totalBTU.toLocaleString()} BTU/hr @ {result.pipeLength} ft run
            </p>
          </div>

          <div className="card" style={{ padding: '0.75rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>Capacity by Pipe Size</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <th style={{ textAlign: 'left', padding: 4 }}>Pipe Size</th>
                  <th style={{ textAlign: 'right', padding: 4 }}>Capacity (BTU/hr)</th>
                  <th style={{ textAlign: 'center', padding: 4 }}></th>
                </tr>
              </thead>
              <tbody>
                {result.capacities.map(c => (
                  <tr key={c.size} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: 4, fontWeight: 600 }}>{c.size}</td>
                    <td style={{ textAlign: 'right', padding: 4 }}>{c.capacity.toLocaleString()}</td>
                    <td style={{ textAlign: 'center', padding: 4 }}>
                      {c.sufficient ? <span style={{ color: '#22C55E' }}>OK</span> : <span style={{ color: '#EF4444' }}>Under</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="warning-box" style={{ fontSize: '0.8125rem' }}>
        Based on natural gas (0.60 SG), 0.5 PSI system, black iron pipe per IFGC/NFPA 54. CSST has its own sizing tables. Always pressure test at 3 PSI minimum before turn-on. Verify with gas utility for local requirements.
      </div>
    </div>
  );
}
