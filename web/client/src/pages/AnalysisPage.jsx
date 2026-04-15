import { useState, useRef, useEffect } from 'react';
import { apiUpload } from '../utils/api';
import { compressImage } from '../utils/compressImage';
import LoadingSpinner from '../components/LoadingSpinner';
import useOfflineQueue from '../hooks/useOfflineQueue';
import OfflineQueue from '../components/OfflineQueue';

const AI_MESSAGES = [
  'Analyzing your plumbing photo...',
  'Inspecting pipes and fittings...',
  'Identifying issues...',
  'Almost done...',
];

function severityBadge(severity) {
  if (!severity) return 'badge badge-gray';
  const s = severity.toLowerCase();
  if (s === 'critical' || s === 'severe') return 'badge badge-red';
  if (s === 'moderate') return 'badge badge-amber';
  return 'badge badge-green';
}

function actionBadge(action) {
  if (!action) return 'badge badge-gray';
  const a = action.toLowerCase();
  if (a.includes('routine') || a.includes('maintenance')) return 'badge badge-green';
  if (a.includes('repair') || a.includes('replace')) return 'badge badge-amber';
  if (a.includes('immediate') || a.includes('shutdown') || a.includes('professional')) return 'badge badge-red';
  return 'badge badge-gray';
}

export default function AnalysisPage() {
  const [analysisType, setAnalysisType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [model, setModel] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const {
    queue, enqueue, retry, dismiss, clearCompleted, processing,
  } = useOfflineQueue();

  // Track online/offline status
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  async function handleUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // If offline, queue for later
    if (!navigator.onLine) {
      await enqueue(files, analysisType);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    for (let i = 0; i < Math.min(files.length, 4); i++) {
      var compressed = await compressImage(files[i]);
      formData.append('images', compressed);
    }
    if (analysisType) formData.append('analysis_type', analysisType);

    try {
      const data = await apiUpload('/analysis', formData);
      setResult(data.result);
      setModel(data.model || '');
    } catch (err) {
      setError(err.message || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setModel('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner messages={AI_MESSAGES} />
      </div>
    );
  }

  if (result) {
    const imageUsable = result.is_plumbing_image !== false && result.image_quality?.usable !== false;
    const ctx = result.pipe_context;
    const pipe = result.pipe_inspection_analysis;
    const leak = result.leak_diagnosis_analysis;
    const fixture = result.fixture_inspection_analysis;
    const drain = result.drain_inspection_analysis;
    const gas = result.gas_piping_analysis;
    const hydronic = result.hydronic_system_analysis;
    const pressure = result.pressure_test_analysis;

    return (
      <div className="page">
        <div className="stack">
          <div className="page-header">
            <h2>Analysis Result</h2>
            {model && <div style={{ fontSize: '0.6875rem', color: '#6B6B73', marginTop: '0.25rem' }}>{model}</div>}
          </div>

          {/* Unusable image warning */}
          {!imageUsable && (
            <div className="warning-box">
              <strong>Image could not be analyzed.</strong>
              {result.image_quality?.quality_note && (
                <p style={{ marginTop: '0.25rem' }}>{result.image_quality.quality_note}</p>
              )}
            </div>
          )}

          {/* Overall Assessment Badge */}
          {imageUsable && result.overall_assessment && (
            <div className="card" style={{ textAlign: 'center' }}>
              <span className={actionBadge(result.overall_assessment)} style={{ fontSize: '1.25rem', padding: '0.5rem 1.5rem' }}>
                {result.overall_assessment.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          )}

          {/* Assessment Reasoning */}
          {result.assessment_reasoning && (
            <div className="card">
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.6 }}>{result.assessment_reasoning}</p>
            </div>
          )}

          {/* Immediate Safety Hazards — surface first */}
          {result.immediate_safety_hazards && result.immediate_safety_hazards.length > 0 && (
            <div className="card" style={{ borderLeft: '3px solid #EF4444' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>Immediate Safety Hazards</h3>
              <div className="stack-sm">
                {result.immediate_safety_hazards.map((h, i) => (
                  <div key={i} className="warning-box">
                    <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                      <strong>{h.hazard_type?.replace(/_/g, ' ')}</strong>
                      {h.severity && <span className={severityBadge(h.severity)}>{h.severity}</span>}
                    </div>
                    {h.description && <p style={{ marginTop: '0.25rem' }}>{h.description}</p>}
                    {h.immediate_action && (
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        <span className="text-secondary">Action:</span> {h.immediate_action}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Context */}
          {ctx && (ctx.installation_type || ctx.system_type_detected || (ctx.pipe_materials_detected && ctx.pipe_materials_detected.length > 0) || (ctx.brands_detected && ctx.brands_detected.length > 0)) && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Detected</h3>
              <div className="stack-sm">
                {ctx.installation_type && ctx.installation_type !== 'unknown' && (
                  <div className="row-between">
                    <span className="text-secondary">Installation</span>
                    <span style={{ fontWeight: 600 }}>{ctx.installation_type}</span>
                  </div>
                )}
                {ctx.system_type_detected && ctx.system_type_detected !== 'unknown' && (
                  <div className="row-between">
                    <span className="text-secondary">System</span>
                    <span className="badge badge-blue" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                      {ctx.system_type_detected.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                {ctx.pipe_materials_detected && ctx.pipe_materials_detected.length > 0 && (
                  <div className="row-between">
                    <span className="text-secondary">Materials</span>
                    <span style={{ fontWeight: 600 }}>{ctx.pipe_materials_detected.join(', ')}</span>
                  </div>
                )}
                {ctx.brands_detected && ctx.brands_detected.length > 0 && (
                  <div className="row-between">
                    <span className="text-secondary">Brands</span>
                    <span style={{ fontWeight: 600 }}>{ctx.brands_detected.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pipe Inspection */}
          {pipe?.applicable && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Pipe Inspection</h3>
              <div className="stack-sm">
                {pipe.pipe_material && (
                  <div className="row-between">
                    <span className="text-secondary">Material</span>
                    <span style={{ fontWeight: 600 }}>{pipe.pipe_material.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {pipe.pipe_condition && (
                  <div className="row-between">
                    <span className="text-secondary">Condition</span>
                    <span className={actionBadge(pipe.pipe_condition)}>{pipe.pipe_condition}</span>
                  </div>
                )}
              </div>
              {pipe.issues_found && pipe.issues_found.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Issues</h4>
                  <div className="stack-sm">
                    {pipe.issues_found.map((iss, i) => (
                      <div key={i} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                          <strong>{iss.issue_type?.replace(/_/g, ' ')}</strong>
                          {iss.severity && <span className={severityBadge(iss.severity)}>{iss.severity.replace(/_/g, ' ')}</span>}
                        </div>
                        {iss.location && <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>Location: {iss.location}</p>}
                        {iss.description && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{iss.description}</p>}
                        {iss.code_reference && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Code: {iss.code_reference}</p>}
                        {iss.corrective_action && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}><span className="text-secondary">Fix:</span> {iss.corrective_action}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leak Diagnosis */}
          {leak?.applicable && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Leak Diagnosis</h3>
              <div className="stack-sm">
                {leak.leak_type && (
                  <div className="row-between">
                    <span className="text-secondary">Leak Type</span>
                    <span style={{ fontWeight: 600 }}>{leak.leak_type.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {leak.leak_location && (
                  <div className="row-between">
                    <span className="text-secondary">Location</span>
                    <span>{leak.leak_location}</span>
                  </div>
                )}
                {leak.probable_source && (
                  <div className="row-between">
                    <span className="text-secondary">Probable Source</span>
                    <span>{leak.probable_source}</span>
                  </div>
                )}
                {leak.probable_cause && (
                  <div className="row-between">
                    <span className="text-secondary">Probable Cause</span>
                    <span>{leak.probable_cause}</span>
                  </div>
                )}
                {leak.urgency && (
                  <div className="row-between">
                    <span className="text-secondary">Urgency</span>
                    <span className={actionBadge(leak.urgency)}>{leak.urgency.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
              {leak.damage_assessment && (leak.damage_assessment.water_damage_visible != null || leak.damage_assessment.mold_risk || (leak.damage_assessment.affected_materials && leak.damage_assessment.affected_materials.length > 0)) && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Damage Assessment</h4>
                  <div className="stack-sm">
                    {leak.damage_assessment.water_damage_visible != null && (
                      <div className="row-between">
                        <span className="text-secondary">Water Damage Visible</span>
                        <span>{leak.damage_assessment.water_damage_visible ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {leak.damage_assessment.mold_risk && (
                      <div className="row-between">
                        <span className="text-secondary">Mold Risk</span>
                        <span className={severityBadge(leak.damage_assessment.mold_risk === 'high' ? 'critical' : leak.damage_assessment.mold_risk === 'moderate' ? 'moderate' : 'low')}>
                          {leak.damage_assessment.mold_risk}
                        </span>
                      </div>
                    )}
                    {leak.damage_assessment.affected_materials && leak.damage_assessment.affected_materials.length > 0 && (
                      <div className="row-between">
                        <span className="text-secondary">Affected Materials</span>
                        <span>{leak.damage_assessment.affected_materials.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {leak.repair_approach && (
                <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                  <span className="text-secondary">Repair approach:</span> {leak.repair_approach}
                </p>
              )}
            </div>
          )}

          {/* Fixture Inspection */}
          {fixture?.applicable && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Fixture Inspection</h3>
              <div className="stack-sm">
                {fixture.fixture_type && (
                  <div className="row-between">
                    <span className="text-secondary">Fixture</span>
                    <span style={{ fontWeight: 600 }}>{fixture.fixture_type}</span>
                  </div>
                )}
                {fixture.brand_model && (
                  <div className="row-between">
                    <span className="text-secondary">Brand / Model</span>
                    <span>{fixture.brand_model}</span>
                  </div>
                )}
              </div>
              {fixture.nameplate_data && Object.values(fixture.nameplate_data).some(v => v) && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Nameplate Data</h4>
                  <div className="stack-sm">
                    {fixture.nameplate_data.water_heater_capacity_gal && (
                      <div className="row-between"><span className="text-secondary">Capacity</span><span>{fixture.nameplate_data.water_heater_capacity_gal} gal</span></div>
                    )}
                    {fixture.nameplate_data.water_heater_btu && (
                      <div className="row-between"><span className="text-secondary">BTU</span><span>{fixture.nameplate_data.water_heater_btu}</span></div>
                    )}
                    {fixture.nameplate_data.water_heater_first_hour_rating && (
                      <div className="row-between"><span className="text-secondary">First Hour Rating</span><span>{fixture.nameplate_data.water_heater_first_hour_rating}</span></div>
                    )}
                    {fixture.nameplate_data.prv_setting_psi && (
                      <div className="row-between"><span className="text-secondary">PRV Setting</span><span>{fixture.nameplate_data.prv_setting_psi} PSI</span></div>
                    )}
                    {fixture.nameplate_data.backflow_type && (
                      <div className="row-between"><span className="text-secondary">Backflow Type</span><span>{fixture.nameplate_data.backflow_type}</span></div>
                    )}
                    {fixture.nameplate_data.age_or_install_date && (
                      <div className="row-between"><span className="text-secondary">Age / Install</span><span>{fixture.nameplate_data.age_or_install_date}</span></div>
                    )}
                  </div>
                </div>
              )}
              {fixture.issues_found && fixture.issues_found.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Issues</h4>
                  <div className="stack-sm">
                    {fixture.issues_found.map((iss, i) => (
                      <div key={i} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                          <strong>{iss.issue_type?.replace(/_/g, ' ')}</strong>
                          {iss.severity && <span className={severityBadge(iss.severity)}>{iss.severity}</span>}
                        </div>
                        {iss.description && <p style={{ fontSize: '0.875rem' }}>{iss.description}</p>}
                        {iss.code_reference && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Code: {iss.code_reference}</p>}
                        {iss.corrective_action && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}><span className="text-secondary">Fix:</span> {iss.corrective_action}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drain Inspection */}
          {drain?.applicable && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Drain Inspection</h3>
              <div className="stack-sm">
                {drain.drain_system && (
                  <div className="row-between">
                    <span className="text-secondary">Drain System</span>
                    <span style={{ fontWeight: 600 }}>{drain.drain_system}</span>
                  </div>
                )}
                {drain.slope_assessment && (
                  <div className="row-between">
                    <span className="text-secondary">Slope</span>
                    <span>{drain.slope_assessment}</span>
                  </div>
                )}
                {drain.blockage_indicators && (
                  <div className="row-between">
                    <span className="text-secondary">Blockage Indicators</span>
                    <span>{drain.blockage_indicators}</span>
                  </div>
                )}
              </div>
              {drain.issues_found && drain.issues_found.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Issues</h4>
                  <div className="stack-sm">
                    {drain.issues_found.map((iss, i) => (
                      <div key={i} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                          <strong>{iss.issue_type?.replace(/_/g, ' ')}</strong>
                          {iss.severity && <span className={severityBadge(iss.severity)}>{iss.severity.replace(/_/g, ' ')}</span>}
                        </div>
                        {iss.location && <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>Location: {iss.location}</p>}
                        {iss.description && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{iss.description}</p>}
                        {iss.code_reference && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Code: {iss.code_reference}</p>}
                        {iss.corrective_action && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}><span className="text-secondary">Fix:</span> {iss.corrective_action}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gas Piping */}
          {gas?.applicable && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Gas Piping</h3>
              <div className="stack-sm">
                {gas.pipe_material && (
                  <div className="row-between">
                    <span className="text-secondary">Material</span>
                    <span style={{ fontWeight: 600 }}>{gas.pipe_material.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {gas.csst_bonding_visible != null && (
                  <div className="row-between">
                    <span className="text-secondary">CSST Bonding Visible</span>
                    <span>{gas.csst_bonding_visible ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {gas.gas_leak_indicators && (
                  <div className="row-between">
                    <span className="text-secondary">Leak Indicators</span>
                    <span>{gas.gas_leak_indicators}</span>
                  </div>
                )}
                {gas.leak_test_recommended === true && (
                  <div className="warning-box" style={{ marginTop: '0.5rem' }}>
                    Leak test recommended before restoring gas service.
                  </div>
                )}
              </div>
              {gas.issues_found && gas.issues_found.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Issues</h4>
                  <div className="stack-sm">
                    {gas.issues_found.map((iss, i) => (
                      <div key={i} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                          <strong>{iss.issue_type?.replace(/_/g, ' ')}</strong>
                          {iss.severity && <span className={severityBadge(iss.severity)}>{iss.severity}</span>}
                        </div>
                        {iss.location && <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>Location: {iss.location}</p>}
                        {iss.description && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{iss.description}</p>}
                        {iss.code_reference && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Code: {iss.code_reference}</p>}
                        {iss.corrective_action && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}><span className="text-secondary">Fix:</span> {iss.corrective_action}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hydronic System */}
          {hydronic?.applicable && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Hydronic System</h3>
              <div className="stack-sm">
                {hydronic.system_type && (
                  <div className="row-between">
                    <span className="text-secondary">System Type</span>
                    <span style={{ fontWeight: 600 }}>{hydronic.system_type.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {hydronic.components_identified && hydronic.components_identified.length > 0 && (
                  <div className="row-between">
                    <span className="text-secondary">Components</span>
                    <span>{hydronic.components_identified.join(', ')}</span>
                  </div>
                )}
              </div>
              {hydronic.boiler_info && Object.values(hydronic.boiler_info).some(v => v) && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Boiler Info</h4>
                  <div className="stack-sm">
                    {hydronic.boiler_info.brand && (
                      <div className="row-between"><span className="text-secondary">Brand</span><span>{hydronic.boiler_info.brand}</span></div>
                    )}
                    {hydronic.boiler_info.type && (
                      <div className="row-between"><span className="text-secondary">Type</span><span>{hydronic.boiler_info.type.replace(/_/g, ' ')}</span></div>
                    )}
                    {hydronic.boiler_info.fuel_type && (
                      <div className="row-between"><span className="text-secondary">Fuel</span><span>{hydronic.boiler_info.fuel_type.replace(/_/g, ' ')}</span></div>
                    )}
                    {hydronic.boiler_info.capacity_btu && (
                      <div className="row-between"><span className="text-secondary">Capacity</span><span>{hydronic.boiler_info.capacity_btu}</span></div>
                    )}
                  </div>
                </div>
              )}
              {hydronic.issues_found && hydronic.issues_found.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Issues</h4>
                  <div className="stack-sm">
                    {hydronic.issues_found.map((iss, i) => (
                      <div key={i} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <div className="row-between" style={{ marginBottom: '0.25rem' }}>
                          <strong>{iss.issue_type?.replace(/_/g, ' ')}</strong>
                          {iss.severity && <span className={severityBadge(iss.severity)}>{iss.severity}</span>}
                        </div>
                        {iss.description && <p style={{ fontSize: '0.875rem' }}>{iss.description}</p>}
                        {iss.corrective_action && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}><span className="text-secondary">Fix:</span> {iss.corrective_action}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pressure Test */}
          {pressure?.applicable && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Pressure Test</h3>
              <div className="stack-sm">
                {pressure.gauge_reading_psi != null && (
                  <div className="row-between">
                    <span className="text-secondary">Gauge Reading</span>
                    <span style={{ fontWeight: 600 }}>{pressure.gauge_reading_psi} PSI</span>
                  </div>
                )}
                {pressure.test_medium && (
                  <div className="row-between">
                    <span className="text-secondary">Test Medium</span>
                    <span>{pressure.test_medium}</span>
                  </div>
                )}
                {pressure.required_test_pressure_psi && (
                  <div className="row-between">
                    <span className="text-secondary">Required Pressure</span>
                    <span>{pressure.required_test_pressure_psi}</span>
                  </div>
                )}
                {pressure.test_result_assessment && (
                  <div className="row-between">
                    <span className="text-secondary">Result</span>
                    <span className={actionBadge(pressure.test_result_assessment)}>{pressure.test_result_assessment.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {pressure.duration_visible && (
                  <div className="row-between">
                    <span className="text-secondary">Duration</span>
                    <span>{pressure.duration_visible}</span>
                  </div>
                )}
                {pressure.observations && (
                  <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    <span className="text-secondary">Observations:</span> {pressure.observations}
                  </p>
                )}
                {pressure.code_reference_for_test && (
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>Code: {pressure.code_reference_for_test}</p>
                )}
              </div>
            </div>
          )}

          {/* Prioritized Actions */}
          {result.prioritized_actions && result.prioritized_actions.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Corrective Actions</h3>
              <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {result.prioritized_actions.map((a, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem' }}>
                    <div className="row" style={{ gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                      {a.urgency && (
                        <span className={actionBadge(a.urgency === 'immediate' ? 'immediate' : a.urgency === 'before_service_restore' ? 'repair' : 'routine')} style={{ fontSize: '0.6875rem' }}>
                          {a.urgency.replace(/_/g, ' ')}
                        </span>
                      )}
                      <strong>{a.action}</strong>
                    </div>
                    {a.reason && <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>{a.reason}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Code References */}
          {result.code_references && result.code_references.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>Code References</h3>
              <div className="stack-sm">
                {result.code_references.map((ref, i) => (
                  <div key={i} style={{ fontSize: '0.875rem' }}>
                    <strong>{ref.code}</strong>
                    {ref.section && <span className="text-secondary"> · {ref.section}</span>}
                    {ref.requirement_summary && <p className="text-secondary" style={{ marginTop: '0.125rem' }}>{ref.requirement_summary}</p>}
                    {ref.applies_to && <p className="text-muted" style={{ fontSize: '0.75rem' }}>Applies to: {ref.applies_to}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Steps */}
          {result.recommended_next_steps && (
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>Next Steps</h3>
              <p>{result.recommended_next_steps}</p>
            </div>
          )}

          {/* Confidence */}
          {result.confidence && (
            <div className="card">
              <div className="row-between">
                <span className="text-secondary">Confidence</span>
                <span className={`badge ${result.confidence === 'high' ? 'badge-green' : result.confidence === 'medium' ? 'badge-amber' : 'badge-red'}`}>
                  {result.confidence}
                </span>
              </div>
              {result.confidence_reasoning && (
                <p className="text-secondary" style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>{result.confidence_reasoning}</p>
              )}
            </div>
          )}

          {/* Scope Disclaimer */}
          {result.scope_disclaimer && (
            <p className="text-muted" style={{ fontSize: '0.75rem', fontStyle: 'italic', padding: '0 0.5rem' }}>
              {result.scope_disclaimer}
            </p>
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
          <h2>Plumbing Photo Analysis</h2>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>
            Upload a photo of plumbing for AI-powered analysis
          </p>
        </div>

        {isOffline && (
          <div className="warning-box">
            You are offline. Photos will be queued and uploaded when connectivity returns.
          </div>
        )}

        <OfflineQueue
          queue={queue}
          onRetry={retry}
          onDismiss={dismiss}
          onViewResult={(item) => { setResult(item.result); dismiss(item.id); }}
          onClearCompleted={clearCompleted}
          processing={processing}
        />

        {error && <div className="error-banner">{error}</div>}

        {/* Analysis Type */}
        <div className="form-group">
          <label>Analysis Type (optional)</label>
          <select className="select" value={analysisType} onChange={(e) => setAnalysisType(e.target.value)}>
            <option value="">Auto-detect</option>
            <option value="leak_diagnosis">Leak Diagnosis</option>
            <option value="code_violation">Code Violation</option>
            <option value="fixture_installation">Fixture Installation</option>
            <option value="pipe_condition">Pipe Condition</option>
          </select>
        </div>

        {/* Upload Area */}
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            minHeight: 220,
            border: '2px dashed #2A2A2E',
            borderRadius: 16,
            cursor: 'pointer',
            padding: '2rem',
            textAlign: 'center',
            transition: 'border-color 0.15s',
          }}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3B82F6'; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2E'; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#2A2A2E';
            if (e.dataTransfer.files.length) {
              const dt = new DataTransfer();
              for (const f of e.dataTransfer.files) dt.items.add(f);
              fileInputRef.current.files = dt.files;
              handleUpload({ target: { files: dt.files } });
            }
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div>
            <p style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
              Tap to upload or take a photo
            </p>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Photo of pipes, fixtures, valves, or equipment (up to 4)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}
