export const EXAM_BLUEPRINTS = {
  APPRENTICE: {
    totalQuestions: 50, timeMinutes: 75, passPercent: 70,
    domains: [
      { moduleNumber: 1, name: 'Plumbing Fundamentals', weight: 0.25, questions: 13 },
      { moduleNumber: 2, name: 'IPC/UPC Code Basics', weight: 0.20, questions: 10 },
      { moduleNumber: 3, name: 'Water Supply Piping', weight: 0.20, questions: 10 },
      { moduleNumber: 4, name: 'DWV Piping and Venting', weight: 0.20, questions: 10 },
      { moduleNumber: 5, name: 'Safety and Tools', weight: 0.15, questions: 7 },
    ]
  },
  JOURNEYMAN: {
    totalQuestions: 80, timeMinutes: 120, passPercent: 70,
    domains: [
      { moduleNumber: 1, name: 'Advanced Code Application', weight: 0.25, questions: 20 },
      { moduleNumber: 2, name: 'Gas Piping Systems', weight: 0.20, questions: 16 },
      { moduleNumber: 3, name: 'Water Heater Systems', weight: 0.20, questions: 16 },
      { moduleNumber: 4, name: 'Backflow Prevention', weight: 0.15, questions: 12 },
      { moduleNumber: 5, name: 'Fixture Installation', weight: 0.10, questions: 8 },
      { moduleNumber: 6, name: 'Troubleshooting and Repair', weight: 0.10, questions: 8 },
    ]
  },
  MASTER: {
    totalQuestions: 100, timeMinutes: 150, passPercent: 75,
    domains: [
      { moduleNumber: 1, name: 'System Design and Engineering', weight: 0.30, questions: 30 },
      { moduleNumber: 2, name: 'Commercial and Specialty Systems', weight: 0.25, questions: 25 },
      { moduleNumber: 3, name: 'Business and Code Administration', weight: 0.20, questions: 20 },
      { moduleNumber: 4, name: 'Advanced Materials and Methods', weight: 0.25, questions: 25 },
    ]
  },
  MEDICAL_GAS: {
    totalQuestions: 60, timeMinutes: 90, passPercent: 75,
    domains: [
      { moduleNumber: 1, name: 'Medical Gas Systems Overview', weight: 0.25, questions: 15 },
      { moduleNumber: 2, name: 'Brazing and Installation', weight: 0.30, questions: 18 },
      { moduleNumber: 3, name: 'Testing and Verification', weight: 0.25, questions: 15 },
      { moduleNumber: 4, name: 'Maintenance and Safety', weight: 0.20, questions: 12 },
    ]
  },
};
