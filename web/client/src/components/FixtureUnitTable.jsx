import { useState } from 'react';

const RESIDENTIAL_FIXTURES = [
  { fixture: 'Bathtub (with or without shower)', wsfu: 1.4, dfu: 2, trap: '1-1/2"', minDrain: '1-1/2"', minVent: '1-1/4"' },
  { fixture: 'Shower stall', wsfu: 1.4, dfu: 2, trap: '2"', minDrain: '2"', minVent: '1-1/2"' },
  { fixture: 'Lavatory (bathroom sink)', wsfu: 1.0, dfu: 1, trap: '1-1/4"', minDrain: '1-1/4"', minVent: '1-1/4"' },
  { fixture: 'Kitchen sink', wsfu: 1.4, dfu: 2, trap: '1-1/2"', minDrain: '1-1/2"', minVent: '1-1/4"' },
  { fixture: 'Kitchen sink w/ disposal', wsfu: 1.4, dfu: 2, trap: '1-1/2"', minDrain: '1-1/2"', minVent: '1-1/4"' },
  { fixture: 'Toilet (tank type)', wsfu: 2.2, dfu: 3, trap: 'integral', minDrain: '3"', minVent: '1-1/2"' },
  { fixture: 'Toilet (flushometer)', wsfu: 5.0, dfu: 4, trap: 'integral', minDrain: '3"', minVent: '2"' },
  { fixture: 'Clothes washer', wsfu: 1.4, dfu: 2, trap: '2"', minDrain: '2"', minVent: '1-1/2"' },
  { fixture: 'Dishwasher', wsfu: 1.4, dfu: 2, trap: 'via sink', minDrain: 'via sink', minVent: 'via sink' },
  { fixture: 'Utility / laundry sink', wsfu: 1.4, dfu: 2, trap: '1-1/2"', minDrain: '1-1/2"', minVent: '1-1/4"' },
  { fixture: 'Bar sink', wsfu: 1.0, dfu: 1, trap: '1-1/4"', minDrain: '1-1/4"', minVent: '1-1/4"' },
  { fixture: 'Floor drain', wsfu: 0, dfu: 2, trap: '2"', minDrain: '2"', minVent: '1-1/2"' },
  { fixture: 'Hose bibb', wsfu: 2.2, dfu: 0, trap: 'n/a', minDrain: 'n/a', minVent: 'n/a' },
];

const COMMERCIAL_FIXTURES = [
  { fixture: 'Drinking fountain', wsfu: 0.5, dfu: 1, trap: '1-1/4"', minDrain: '1-1/4"', minVent: '1-1/4"' },
  { fixture: 'Urinal (flush valve)', wsfu: 3.0, dfu: 4, trap: '2"', minDrain: '2"', minVent: '1-1/2"' },
  { fixture: 'Urinal (tank)', wsfu: 1.5, dfu: 2, trap: '2"', minDrain: '2"', minVent: '1-1/2"' },
  { fixture: 'Mop sink / service sink', wsfu: 1.4, dfu: 3, trap: '3"', minDrain: '3"', minVent: '2"' },
  { fixture: 'Commercial kitchen sink (3-comp)', wsfu: 2.8, dfu: 4, trap: '2"', minDrain: '2"', minVent: '1-1/2"' },
  { fixture: 'Commercial dishwasher', wsfu: 1.4, dfu: 2, trap: '2"', minDrain: '2"', minVent: '1-1/2"' },
  { fixture: 'Grease interceptor', wsfu: 0, dfu: 0, trap: 'integral', minDrain: 'per sizing', minVent: 'per sizing' },
];

const cellStyle = { padding: '6px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8125rem' };
const headerStyle = { ...cellStyle, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#A0A0A8' };

export default function FixtureUnitTable() {
  const [tab, setTab] = useState('residential');
  const fixtures = tab === 'residential' ? RESIDENTIAL_FIXTURES : COMMERCIAL_FIXTURES;

  return (
    <div className="stack">
      <div className="toggle-group">
        <button className={`toggle-option ${tab === 'residential' ? 'active' : ''}`} onClick={() => setTab('residential')}>
          Residential
        </button>
        <button className={`toggle-option ${tab === 'commercial' ? 'active' : ''}`} onClick={() => setTab('commercial')}>
          Commercial
        </button>
      </div>

      <div className="card" style={{ padding: '0.75rem' }}>
        <h3 style={{ margin: '0 0 4px' }}>Fixture Unit Reference</h3>
        <p className="text-secondary" style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
          WSFU = Water Supply Fixture Units, DFU = Drainage Fixture Units (IPC Tables)
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ ...headerStyle, textAlign: 'left' }}>Fixture</th>
                <th style={{ ...headerStyle, textAlign: 'center', color: '#3B82F6' }}>WSFU</th>
                <th style={{ ...headerStyle, textAlign: 'center', color: '#3B82F6' }}>DFU</th>
                <th style={{ ...headerStyle, textAlign: 'center' }}>Trap</th>
                <th style={{ ...headerStyle, textAlign: 'center' }}>Min Drain</th>
                <th style={{ ...headerStyle, textAlign: 'center' }}>Min Vent</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map(f => (
                <tr key={f.fixture}>
                  <td style={{ ...cellStyle, fontWeight: 500 }}>{f.fixture}</td>
                  <td style={{ ...cellStyle, textAlign: 'center', color: '#3B82F6', fontWeight: 600 }}>{f.wsfu || '—'}</td>
                  <td style={{ ...cellStyle, textAlign: 'center', color: '#3B82F6', fontWeight: 600 }}>{f.dfu || '—'}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{f.trap}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{f.minDrain}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{f.minVent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="warning-box" style={{ fontSize: '0.8125rem' }}>
        <strong>Key rules:</strong>
        <ul style={{ margin: '4px 0 0 16px', listStyle: 'disc' }}>
          <li>Toilets require minimum 3" drain — cannot be reduced downstream</li>
          <li>Building drain/sewer must be minimum 4" for residential</li>
          <li>Trap arm length varies by code (IPC vs UPC) — always verify locally</li>
          <li>Dishwashers drain through the kitchen sink trap — no separate trap needed</li>
        </ul>
      </div>
    </div>
  );
}
