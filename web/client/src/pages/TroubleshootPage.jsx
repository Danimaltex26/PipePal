import { useState } from 'react';
import { apiPost } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EQUIPMENT_TYPES = [
  'Toilet / Water Closet',
  'Faucet / Valve',
  'Kitchen Sink / Garbage Disposal',
  'Bathtub / Shower',
  'Water Heater (Tank)',
  'Water Heater (Tankless)',
  'Drain / Sewer Line',
  'Sump Pump / Ejector Pump',
  'Water Softener / Filtration',
  'Gas Line / Gas Appliance',
  'Backflow Preventer',
  'Expansion Tank / PRV',
  'Boiler / Hydronic Heating',
  'Steam System',
  'Pipe Leak / Burst / Freeze',
  'Water Main / Service Line',
  'Irrigation / Sprinkler',
  'Hose Bibb / Outdoor',
  'Commercial Kitchen (grease trap)',
  'Washing Machine Box / Laundry',
  'Other',
];

const EQUIPMENT_BRANDS = {
  'Toilet / Water Closet': [
    'Kohler', 'American Standard', 'TOTO', 'Gerber', 'Mansfield',
    'Eljer', 'Glacier Bay', 'Delta', 'Swiss Madison',
  ],
  'Faucet / Valve': [
    'Moen', 'Delta', 'Kohler', 'Pfister', 'American Standard',
    'Grohe', 'Watts', 'Nibco', 'Apollo',
  ],
  'Kitchen Sink / Garbage Disposal': [
    'InSinkErator', 'Waste King', 'Moen', 'GE',
  ],
  'Bathtub / Shower': [
    'Moen', 'Delta', 'Kohler', 'Pfister', 'American Standard', 'Grohe',
  ],
  'Water Heater (Tank)': [
    'Rheem', 'A.O. Smith', 'Bradford White', 'State', 'GE', 'Kenmore', 'Whirlpool',
  ],
  'Water Heater (Tankless)': [
    'Rinnai', 'Navien', 'Noritz', 'Rheem', 'Takagi',
    'Bosch', 'EcoSmart', 'Stiebel Eltron',
  ],
  'Drain / Sewer Line': [],
  'Sump Pump / Ejector Pump': [
    'Zoeller', 'Wayne', 'Liberty', 'Superior Pump', 'Flotec', 'Little Giant',
  ],
  'Water Softener / Filtration': [
    'Fleck', 'Clack', 'Kinetico', 'Culligan', 'GE', 'Whirlpool', 'Pelican', 'Aquasana',
  ],
  'Gas Line / Gas Appliance': [
    'Rheem', 'A.O. Smith', 'Carrier', 'Trane', 'Lennox',
  ],
  'Backflow Preventer': [
    'Watts', 'Wilkins (Zurn)', 'Febco', 'Ames', 'Apollo',
  ],
  'Expansion Tank / PRV': [
    'Watts', 'Wilkins (Zurn)', 'Amtrol', 'Flexcon',
  ],
  'Boiler / Hydronic Heating': [
    'Weil-McLain', 'Burnham', 'Buderus', 'Navien',
    'Triangle Tube', 'Lochinvar', 'NTI',
  ],
  'Steam System': [
    'Weil-McLain', 'Burnham', 'Buderus',
  ],
  'Pipe Leak / Burst / Freeze': [],
  'Water Main / Service Line': [],
  'Irrigation / Sprinkler': [
    'Rain Bird', 'Hunter', 'Orbit', 'Toro',
  ],
  'Hose Bibb / Outdoor': [],
  'Commercial Kitchen (grease trap)': [],
  'Washing Machine Box / Laundry': [],
  Other: [],
};

const SYSTEM_TYPES = [
  'Potable Water (copper)',
  'Potable Water (PEX)',
  'Potable Water (CPVC)',
  'DWV (PVC/ABS)',
  'DWV (Cast Iron)',
  'Gas (Black Iron)',
  'Gas (CSST)',
  'Hydronic / Steam',
  'Irrigation',
  'Medical Gas',
];

const ENVIRONMENTS = [
  'Residential (single family)',
  'Residential (multi-family)',
  'Commercial',
  'Restaurant / Food Service',
  'Healthcare / Hospital',
  'Industrial',
  'Outdoor / Underground',
];

const ALREADY_TRIED_OPTIONS = [
  'Checked water supply valve',
  'Plunged / snaked drain',
  'Checked for visible leaks',
  'Turned off water main',
  'Checked water pressure',
  'Tested T&P valve',
  'Checked pilot light / igniter',
  'Inspected trap / P-trap',
  'Checked for frozen pipes',
  'Tightened fittings',
  'Nothing yet',
];

const AI_MESSAGES = [
  'Analyzing the issue...',
  'Checking common causes...',
  'Building diagnosis...',
];

export default function TroubleshootPage() {
  const [form, setForm] = useState({
    equipment_type: '',
    equipment_brand: '',
    system_type: '',
    symptom: '',
    environment: '',
    already_tried: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [model, setModel] = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleTried = (opt) => {
    setForm((prev) => {
      const arr = prev.already_tried.includes(opt)
        ? prev.already_tried.filter((o) => o !== opt)
        : [...prev.already_tried, opt];
      return { ...prev, already_tried: arr };
    });
  };

  const brandOptions = EQUIPMENT_BRANDS[form.equipment_type] || [];

  const handleSubmit = async () => {
    if (!form.symptom.trim()) {
      setError('Please describe the symptom.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await apiPost('/troubleshoot', form);
      setResult(data.result || data);
      setModel(data.model || '');
    } catch (err) {
      setError(err.message || 'Troubleshoot failed.');
    } finally {
      setLoading(false);
    }
  };

  function handleReset() {
    setResult(null);
    setModel('');
    setError('');
    setForm({
      equipment_type: '',
      equipment_brand: '',
      system_type: '',
      symptom: '',
      environment: '',
      already_tried: [],
    });
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner messages={AI_MESSAGES} />
      </div>
    );
  }

  if (result) {
    return (
      <div className="page">
        <div className="stack">
          <div className="page-header">
            <h2>Diagnosis</h2>
            {model && <div style={{ fontSize: '0.6875rem', color: '#6B6B73', marginTop: '0.25rem' }}>{model}</div>}
          </div>

          {/* Do NOT Restore Service — top critical banner */}
          {result.do_not_restore_service === true && (
            <div className="card" style={{ background: 'rgba(239,68,68,0.12)', borderLeft: '4px solid #EF4444' }}>
              <h3 style={{ marginBottom: '0.375rem', color: '#EF4444' }}>⚠ Do not restore service</h3>
              {result.do_not_restore_reasoning && (
                <p style={{ fontSize: '0.9375rem' }}>{result.do_not_restore_reasoning}</p>
              )}
            </div>
          )}

          {/* Safety callout — only for genuine hazards */}
          {(result.safety_callout || result.safety_warning) && (
            <div className="warning-box">
              <strong>Safety: </strong>{result.safety_callout || result.safety_warning}
            </div>
          )}

          {/* Leak Test Required */}
          {result.leak_test_required === true && (
            <div className="warning-box">
              <strong>Leak test required: </strong>perform soap-bubble or electronic gas detector test before restoring gas service. Never use open flame.
            </div>
          )}

          {/* Plain English Summary */}
          {result.plain_english_summary && (
            <div className="card">
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.6 }}>{result.plain_english_summary}</p>
            </div>
          )}

          {/* Probable Causes — each with fix_path, parts, pressure test, code ref */}
          {result.probable_causes && result.probable_causes.length > 0 && (
            <div className="stack">
              <h3>Probable Causes</h3>
              {result.probable_causes.map((c, i) => {
                const rank = c.rank ?? i + 1;
                const fixSteps = c.fix_path || c.fix_steps || [];
                const parts = c.parts_to_check || [];
                const pt = c.pressure_test_guidance;
                const ptApplicable = pt && pt.applicable === true;
                return (
                  <div key={i} className="card">
                    <div className="row" style={{ marginBottom: '0.5rem', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="row" style={{ gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{
                          minWidth: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#3B82F6',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                        }}>
                          {rank}
                        </div>
                        <strong style={{ lineHeight: 1.3 }}>{c.cause}</strong>
                      </div>
                      {c.likelihood && (
                        <span className={`badge ${c.likelihood === 'high' ? 'badge-red' : c.likelihood === 'medium' ? 'badge-amber' : 'badge-gray'}`}>
                          {c.likelihood}
                        </span>
                      )}
                    </div>

                    {c.explanation && (
                      <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        {c.explanation}
                      </p>
                    )}

                    {c.code_reference && (
                      <p style={{ fontSize: '0.8125rem', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(59,130,246,0.1)', borderLeft: '3px solid #3B82F6', borderRadius: 4 }}>
                        <strong>Code: </strong>{c.code_reference}
                      </p>
                    )}

                    {ptApplicable && (
                      <div style={{ marginBottom: parts.length > 0 || fixSteps.length > 0 ? '0.75rem' : 0 }}>
                        <p className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>
                          Pressure Test
                        </p>
                        <div style={{ fontSize: '0.875rem', padding: '0.625rem', background: 'rgba(59,130,246,0.06)', borderRadius: 6 }}>
                          {pt.test_medium && (
                            <p style={{ marginBottom: '0.25rem' }}>
                              <span className="text-secondary">Medium: </span>{pt.test_medium}
                            </p>
                          )}
                          {pt.test_pressure_psi && (
                            <p style={{ marginBottom: '0.25rem' }}>
                              <span className="text-secondary">Pressure: </span>{pt.test_pressure_psi}
                            </p>
                          )}
                          {pt.duration && (
                            <p style={{ marginBottom: '0.25rem' }}>
                              <span className="text-secondary">Hold time: </span>{pt.duration}
                            </p>
                          )}
                          {pt.pass_criteria && (
                            <p>
                              <span className="text-secondary">Pass: </span>{pt.pass_criteria}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {parts.length > 0 && (
                      <div style={{ marginBottom: fixSteps.length > 0 ? '0.75rem' : 0 }}>
                        <p className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>
                          Parts to Check
                        </p>
                        <div className="stack-sm">
                          {parts.map((p, pi) => (
                            <div key={pi} style={{ padding: '0.5rem 0.625rem', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                              <div className="row-between" style={{ marginBottom: '0.25rem', alignItems: 'flex-start' }}>
                                <strong style={{ fontSize: '0.9375rem' }}>{p.part}</strong>
                                {p.estimated_cost && <span className="text-secondary" style={{ fontSize: '0.8125rem', flexShrink: 0, marginLeft: '0.5rem' }}>{p.estimated_cost}</span>}
                              </div>
                              {p.symptom_if_failed && (
                                <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>
                                  <em>If failed:</em> {p.symptom_if_failed}
                                </p>
                              )}
                              {p.test_method && (
                                <p className="text-secondary" style={{ fontSize: '0.8125rem', marginTop: '0.125rem' }}>
                                  <em>Test:</em> {p.test_method}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {fixSteps.length > 0 && (
                      <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid #2A2A2E' }}>
                        <p className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                          Fix Path
                        </p>
                        <div className="stack-sm">
                          {fixSteps.map((step, si) => (
                            <div key={si} className="row" style={{ gap: '0.5rem', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 600, color: '#3B82F6', minWidth: 18, fontSize: '0.875rem' }}>
                                {step.step ?? si + 1}.
                              </span>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9375rem' }}>{step.action || step.instruction || step}</p>
                                {step.tip && (
                                  <p className="text-secondary" style={{ fontSize: '0.8125rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                    Tip: {step.tip}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Permit required */}
          {result.permit_required_indicator && (
            <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <strong style={{ color: '#F59E0B' }}>Permit note: </strong>
              <span>{result.permit_required_indicator}</span>
            </div>
          )}

          {/* Code jurisdiction note (IPC vs UPC differences) */}
          {result.code_jurisdiction_note && (
            <div className="card">
              <p style={{ fontSize: '0.9375rem' }}>
                <span className="text-secondary">Code jurisdiction: </span>{result.code_jurisdiction_note}
              </p>
            </div>
          )}

          {/* Escalation */}
          {result.escalate_if && (
            <div className="warning-box">
              <strong>Escalate if: </strong>{result.escalate_if}
            </div>
          )}

          {/* Estimated Fix Time */}
          {result.estimated_fix_time && (
            <div className="card">
              <div className="row-between">
                <span className="text-secondary">Estimated fix time</span>
                <strong>{result.estimated_fix_time}</strong>
              </div>
            </div>
          )}

          {/* Confidence */}
          {result.confidence && (
            <div className="card">
              <div className="row-between" style={{ alignItems: 'center' }}>
                <span className="text-secondary">Confidence</span>
                <span className={`badge ${result.confidence === 'high' ? 'badge-green' : result.confidence === 'medium' ? 'badge-amber' : 'badge-red'}`}>
                  {result.confidence}
                </span>
              </div>
              {result.confidence_reasoning && (
                <p className="text-secondary" style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                  {result.confidence_reasoning}
                </p>
              )}
            </div>
          )}

          <button className="btn btn-secondary btn-block" onClick={handleReset}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="stack">
        <div className="page-header">
          <h2>Troubleshoot</h2>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>
            Describe your issue and get an AI-powered diagnosis
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label>Equipment Type</label>
          <select
            className="select"
            value={form.equipment_type}
            onChange={(e) => {
              set('equipment_type', e.target.value);
              set('equipment_brand', '');
            }}
          >
            <option value="">Select...</option>
            {EQUIPMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {brandOptions.length > 0 ? (
          <div className="form-group">
            <label>Equipment Brand / Model</label>
            <select className="select" value={form.equipment_brand} onChange={(e) => set('equipment_brand', e.target.value)}>
              <option value="">Select...</option>
              {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value="__other">Other (not listed)</option>
            </select>
            {form.equipment_brand === '__other' && (
              <input
                className="input"
                style={{ marginTop: '0.5rem' }}
                placeholder="Type brand / model"
                value=""
                onChange={(e) => set('equipment_brand', e.target.value)}
              />
            )}
          </div>
        ) : form.equipment_type && !['Drain / Sewer Line', 'Pipe Leak / Burst / Freeze', 'Water Main / Service Line', 'Hose Bibb / Outdoor', 'Commercial Kitchen (grease trap)', 'Washing Machine Box / Laundry', 'Other'].includes(form.equipment_type) ? (
          <div className="form-group">
            <label>Equipment Brand / Model</label>
            <input className="input" placeholder="e.g. brand and model" value={form.equipment_brand} onChange={(e) => set('equipment_brand', e.target.value)} />
          </div>
        ) : null}

        <div className="form-group">
          <label>System Type</label>
          <select className="select" value={form.system_type} onChange={(e) => set('system_type', e.target.value)}>
            <option value="">Select...</option>
            {SYSTEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Symptom *</label>
          <textarea
            className="input"
            rows={4}
            style={{ resize: 'vertical' }}
            placeholder="Describe what's happening..."
            value={form.symptom}
            onChange={(e) => set('symptom', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Environment</label>
          <select className="select" value={form.environment} onChange={(e) => set('environment', e.target.value)}>
            <option value="">Select...</option>
            {ENVIRONMENTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Already Tried</label>
          <div className="stack-sm">
            {ALREADY_TRIED_OPTIONS.map((opt) => (
              <label key={opt} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.already_tried.includes(opt)}
                  onChange={() => toggleTried(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : 'Get Diagnosis'}
        </button>
      </div>
    </div>
  );
}
