export const summary = {
  balance: 12840,
  income: 5400,
  actualExpenses: 3260,
  plannedExpenses: 1780,
  savingsRate: 22.5,
  committedProjects: 2200
};

export const categories = [
  { name: 'Logement', budget: 1250, spent: 1150, pct: 92 },
  { name: 'Alimentation', budget: 600, spent: 418, pct: 70 },
  { name: 'Transport', budget: 350, spent: 246, pct: 70 },
  { name: 'Épargne', budget: 900, spent: 900, pct: 100 },
  { name: 'Assurance', budget: 280, spent: 220, pct: 79 }
];

export const transactions = [
  { date: '18 Sep', label: 'Loyer mensuel', category: 'Logement', type: 'Dépense réelle', amount: -1150, status: 'Payé' },
  { date: '17 Sep', label: 'Salaire', category: 'Revenus', type: 'Entrée', amount: 4200, status: 'Reçu' },
  { date: '14 Sep', label: 'Courses', category: 'Alimentation', type: 'Dépense réelle', amount: -148, status: 'Payé' },
  { date: '12 Sep', label: 'Assurance santé', category: 'Assurance', type: 'Dépense réelle', amount: -220, status: 'Payé' },
  { date: '10 Sep', label: 'Projet studio photo', category: 'Projet', type: 'Allocation projet', amount: -600, status: 'Réservé' }
];

export const planned = [
  { label: 'Internet maison', due: '24 Sep 2026', recurrence: 'Mensuelle', amount: 95, confidence: 'Confirmé' },
  { label: 'Épargne automatique', due: '28 Sep 2026', recurrence: 'Mensuelle', amount: 500, confidence: 'Confirmé' },
  { label: 'Entretien véhicule', due: '10 Oct 2026', recurrence: 'Trimestrielle', amount: 260, confidence: 'Estimé' },
  { label: 'Renouvellement assurance', due: '18 Nov 2026', recurrence: 'Annuelle', amount: 420, confidence: 'Estimé' }
];

export const projects = [
  { name: 'Studio photo', target: 5000, allocated: 2200, spent: 600, deadline: 'Déc. 2026' },
  { name: 'Fonds d’urgence', target: 4000, allocated: 2450, spent: 0, deadline: 'Mars 2027' },
  { name: 'Voyage', target: 1800, allocated: 650, spent: 0, deadline: 'Juin 2027' }
];
