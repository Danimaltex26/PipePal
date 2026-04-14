// PipePal training module definitions
// Plumbing certification path: APPRENTICE → JOURNEYMAN → MASTER + MEDICAL_GAS

export const MODULES = [
  // ── APPRENTICE ────────────────────────────────────────────
  {
    cert_level: 'APPRENTICE', module_number: 1, title: 'Plumbing Fundamentals',
    estimated_minutes: 50, exam_domain_weight: 0.25,
    topic_list: ['Water supply systems', 'DWV systems', 'Fixture units', 'Pipe materials', 'Fitting types', 'Soldering and brazing basics', 'Solvent welding', 'Plumbing math basics'],
  },
  {
    cert_level: 'APPRENTICE', module_number: 2, title: 'IPC/UPC Code Basics',
    estimated_minutes: 45, exam_domain_weight: 0.20,
    topic_list: ['IPC vs UPC scope', 'Code structure and navigation', 'Definitions and terms', 'Permit requirements', 'Inspection process', 'Code tables — how to read them', 'Local amendments', 'Code cycles and adoption'],
  },
  {
    cert_level: 'APPRENTICE', module_number: 3, title: 'Water Supply Piping',
    estimated_minutes: 50, exam_domain_weight: 0.20,
    topic_list: ['Pipe sizing by fixture units', 'Copper types K/L/M', 'PEX types A/B/C', 'CPVC applications', 'Pressure regulators', 'Thermal expansion', 'Water hammer arrestors', 'Backflow prevention basics'],
  },
  {
    cert_level: 'APPRENTICE', module_number: 4, title: 'DWV Piping and Venting',
    estimated_minutes: 55, exam_domain_weight: 0.20,
    topic_list: ['Drain pipe sizing DFU method', 'Trap requirements and types', 'Vent pipe sizing', 'Individual and common vents', 'Wet venting', 'Slope requirements', 'Cleanout requirements', 'AAV air admittance valves'],
  },
  {
    cert_level: 'APPRENTICE', module_number: 5, title: 'Safety and Tools',
    estimated_minutes: 40, exam_domain_weight: 0.15,
    topic_list: ['Soldering safety', 'Confined space awareness', 'Trenching safety', 'PPE requirements', 'Fire watch procedures', 'Tool identification', 'Power tool safety', 'Chemical safety — flux/solvents/adhesives'],
  },

  // ── JOURNEYMAN ────────────────────────────────────────────
  {
    cert_level: 'JOURNEYMAN', module_number: 1, title: 'Advanced Code Application',
    estimated_minutes: 60, exam_domain_weight: 0.25,
    topic_list: ['Complex fixture unit calculations', 'Building sewer sizing', 'Storm drainage sizing', 'Combined waste and vent systems', 'Indirect and special waste', 'Grease interceptors', 'Chemical waste systems', 'Code interpretation skills'],
  },
  {
    cert_level: 'JOURNEYMAN', module_number: 2, title: 'Gas Piping Systems',
    estimated_minutes: 55, exam_domain_weight: 0.20,
    topic_list: ['IFGC and NFPA 54', 'Gas pipe sizing BTU method', 'Pipe materials for gas', 'CSST installation', 'Gas pressure testing', 'Appliance venting categories', 'Combustion air calculations', 'Gas leak detection'],
  },
  {
    cert_level: 'JOURNEYMAN', module_number: 3, title: 'Water Heater Systems',
    estimated_minutes: 50, exam_domain_weight: 0.20,
    topic_list: ['Tank water heater installation', 'Tankless water heater installation', 'T&P relief valve requirements', 'Expansion tanks', 'Recirculation systems', 'Combustion venting', 'Energy efficiency', 'Troubleshooting common issues'],
  },
  {
    cert_level: 'JOURNEYMAN', module_number: 4, title: 'Backflow Prevention',
    estimated_minutes: 45, exam_domain_weight: 0.15,
    topic_list: ['Cross-connection types', 'Backflow device selection', 'RPZ assemblies', 'DCVA assemblies', 'PVB and AVB devices', 'Air gap requirements', 'Annual testing requirements', 'Installation requirements'],
  },
  {
    cert_level: 'JOURNEYMAN', module_number: 5, title: 'Fixture Installation',
    estimated_minutes: 45, exam_domain_weight: 0.10,
    topic_list: ['Toilet rough-in dimensions', 'Lavatory installation', 'Bathtub and shower installation', 'Kitchen sink installation', 'ADA accessibility requirements', 'Water closet flange setting', 'Fixture carrier requirements', 'Commercial fixture installation'],
  },
  {
    cert_level: 'JOURNEYMAN', module_number: 6, title: 'Troubleshooting and Repair',
    estimated_minutes: 45, exam_domain_weight: 0.10,
    topic_list: ['Leak detection methods', 'Drain cleaning techniques', 'Camera inspection', 'Pressure testing', 'Water quality issues', 'Noise diagnosis', 'Frozen pipe remediation', 'Emergency repair procedures'],
  },

  // ── MASTER ────────────────────────────────────────────────
  {
    cert_level: 'MASTER', module_number: 1, title: 'System Design and Engineering',
    estimated_minutes: 60, exam_domain_weight: 0.30,
    topic_list: ['Multi-story building design', 'Pressure zone design', 'Booster pump systems', 'Hot water demand calculations', 'Storm drainage design', 'Roof drain sizing', 'Fire sprinkler coordination', 'Rainwater harvesting'],
  },
  {
    cert_level: 'MASTER', module_number: 2, title: 'Commercial and Specialty Systems',
    estimated_minutes: 55, exam_domain_weight: 0.25,
    topic_list: ['Commercial kitchen plumbing', 'Laboratory waste systems', 'Swimming pool plumbing', 'Healthcare facility requirements', 'Grease trap sizing', 'Oil/sand interceptors', 'Acid waste neutralization', 'High-rise plumbing'],
  },
  {
    cert_level: 'MASTER', module_number: 3, title: 'Business and Code Administration',
    estimated_minutes: 45, exam_domain_weight: 0.20,
    topic_list: ['Plumbing contractor licensing', 'Permit and plan review', 'Estimating and bidding', 'Worker supervision', 'Liability and insurance', 'Code interpretation authority', 'Variance requests', 'Continuing education'],
  },
  {
    cert_level: 'MASTER', module_number: 4, title: 'Advanced Materials and Methods',
    estimated_minutes: 50, exam_domain_weight: 0.25,
    topic_list: ['Stainless steel piping', 'Polypropylene systems', 'HDPE fusion welding', 'Expansion loop design', 'Seismic bracing', 'Insulation requirements', 'Green building plumbing', 'Water conservation systems'],
  },

  // ── MEDICAL_GAS (Medical Gas Installer) ───────────────────
  {
    cert_level: 'MEDICAL_GAS', module_number: 1, title: 'Medical Gas Systems Overview',
    estimated_minutes: 55, exam_domain_weight: 0.25,
    topic_list: ['NFPA 99 Health Care Facilities Code', 'ASSE 6010 installer certification', 'Medical gas types — oxygen/nitrous oxide/nitrogen/medical air/vacuum', 'System components', 'Zone valve boxes', 'Alarm systems', 'Source equipment'],
  },
  {
    cert_level: 'MEDICAL_GAS', module_number: 2, title: 'Brazing and Installation',
    estimated_minutes: 50, exam_domain_weight: 0.30,
    topic_list: ['Type K and L copper for medical gas', 'Nitrogen purge brazing', 'BCuP-5 brazing alloy', 'Joint preparation and cleaning', 'Tube cutting and deburring', 'Hot work permits in healthcare', 'Installation procedures NFPA 99', 'Hanger and support spacing'],
  },
  {
    cert_level: 'MEDICAL_GAS', module_number: 3, title: 'Testing and Verification',
    estimated_minutes: 50, exam_domain_weight: 0.25,
    topic_list: ['Initial pressure test — 150 psi 24 hours', 'Standing pressure test', 'Cross-connection test', 'Purge and particulate test', 'Purity test — dew point and hydrocarbon', 'Operational pressure test', 'Verification procedures', 'Documentation requirements'],
  },
  {
    cert_level: 'MEDICAL_GAS', module_number: 4, title: 'Maintenance and Safety',
    estimated_minutes: 45, exam_domain_weight: 0.20,
    topic_list: ['Preventive maintenance schedules', 'Alarm response procedures', 'Emergency procedures', 'Cylinder handling and storage', 'Manifold maintenance', 'Zone valve testing', 'Outlet testing — flow and pressure', 'Contractor qualifications'],
  },
];
