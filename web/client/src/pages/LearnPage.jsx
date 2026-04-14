import { useState } from 'react';

const TOPICS = [
  {
    title: 'Plumbing Code Basics',
    items: ['IPC vs UPC differences', 'DWV system design', 'Fixture unit calculations', 'Trap arm length & slope', 'Venting methods & sizing', 'Code adoption by jurisdiction'],
  },
  {
    title: 'Water Supply Systems',
    items: ['Pipe sizing & pressure drop', 'Water heater types & sizing', 'Backflow prevention devices', 'Pressure regulation & PRVs', 'Pipe material selection', 'Cross-connection control'],
  },
  {
    title: 'Drainage & Waste',
    items: ['Drain sizing by fixture units', 'Cleanout placement rules', 'Grease & sand interceptors', 'Ejector & sump pumps', 'Storm drainage systems', 'Slope & grade requirements'],
  },
  {
    title: 'Gas Piping',
    items: ['BTU load & pipe sizing', 'Gas pipe materials & joining', 'Pressure testing procedures', 'Appliance connection methods', 'Venting categories & types', 'Gas code compliance'],
  },
  {
    title: 'Journeyman/Master Prep',
    items: ['Code calculation practice', 'Permit process & inspections', 'Exam topic overview', 'Practical test preparation', 'Isometric drawing skills', 'Business & license requirements'],
  },
];

export default function LearnPage() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="page stack">
      <h1>Learn</h1>
      <div className="info-box">Training modules are coming soon. Browse topic previews below.</div>

      <div className="stack-sm">
        {TOPICS.map((topic, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i} className="card">
              <div className="expandable-header" onClick={() => setExpanded(isOpen ? null : i)}>
                <h3>{topic.title}</h3>
                <span style={{ color: '#6B6B73', fontSize: '1.25rem' }}>{isOpen ? '\u2212' : '+'}</span>
              </div>
              {isOpen && (
                <div style={{ marginTop: '0.75rem' }}>
                  {topic.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #2A2A2E' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span className="text-secondary" style={{ fontSize: '0.875rem' }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
