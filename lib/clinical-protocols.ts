export interface ProtocolOption {
  label: string;
  nextId: string;
}

export interface ProtocolNode {
  id: string;
  message: string;
  options?: ProtocolOption[];
  searchQuery?: string;
  isEnd?: boolean;
}

export const clinicalProtocols: Record<string, ProtocolNode> = {
  root: {
    id: 'root',
    message: 'Hello! I am your MediLens clinical assistant. What seems to be bothering you today?',
    options: [
      { label: 'Fever', nextId: 'fever_start' },
      { label: 'Headache', nextId: 'headache_start' },
      { label: 'Cold & Cough', nextId: 'cold_start' },
      { label: 'Stomach Ache', nextId: 'stomach_start' },
      { label: 'Allergies', nextId: 'allergy_start' },
    ]
  },
  
  // FEVER PATH
  fever_start: {
    id: 'fever_start',
    message: 'I understand. How long have you been experiencing this fever?',
    options: [
      { label: '1-2 days (Mild)', nextId: 'fever_mild' },
      { label: 'More than 3 days', nextId: 'consult_doctor' }
    ]
  },
  fever_mild: {
    id: 'fever_mild',
    message: 'For mild, short-term fever, antipyretics are commonly recommended to reduce temperature and body ache. Here are some clinical matches from our database:',
    searchQuery: 'Paracetamol',
    isEnd: true
  },

  // HEADACHE PATH
  headache_start: {
    id: 'headache_start',
    message: 'Sorry to hear that. What best describes your headache?',
    options: [
      { label: 'Throbbing / Migraine', nextId: 'headache_migraine' },
      { label: 'Tension / Stress', nextId: 'headache_tension' },
      { label: 'Sinus pressure', nextId: 'headache_sinus' }
    ]
  },
  headache_migraine: {
    id: 'headache_migraine',
    message: 'Migraines often require specific NSAIDs or Triptans. Here are some common clinical formulations:',
    searchQuery: 'Naproxen',
    isEnd: true
  },
  headache_tension: {
    id: 'headache_tension',
    message: 'Tension headaches can usually be managed with standard analgesics (pain relievers).',
    searchQuery: 'Ibuprofen',
    isEnd: true
  },
  headache_sinus: {
    id: 'headache_sinus',
    message: 'Sinus headaches are often treated with decongestants or antihistamines.',
    searchQuery: 'Cetirizine',
    isEnd: true
  },

  // COLD & COUGH PATH
  cold_start: {
    id: 'cold_start',
    message: 'Is your cough dry, or are you experiencing chest congestion with mucus?',
    options: [
      { label: 'Dry Cough', nextId: 'cough_dry' },
      { label: 'Wet / Mucus Cough', nextId: 'cough_wet' }
    ]
  },
  cough_dry: {
    id: 'cough_dry',
    message: 'Antitussives (cough suppressants) are generally used for dry, irritating coughs. Here are some formulations:',
    searchQuery: 'Dextromethorphan',
    isEnd: true
  },
  cough_wet: {
    id: 'cough_wet',
    message: 'For a wet cough, expectorants help thin and loosen mucus so it can be cleared.',
    searchQuery: 'Ambroxol',
    isEnd: true
  },

  // STOMACH ACHE PATH
  stomach_start: {
    id: 'stomach_start',
    message: 'Stomach issues can be tricky. What type of discomfort is it?',
    options: [
      { label: 'Acidity / Heartburn', nextId: 'stomach_acid' },
      { label: 'Cramps / Spasms', nextId: 'stomach_cramps' }
    ]
  },
  stomach_acid: {
    id: 'stomach_acid',
    message: 'Proton pump inhibitors (PPIs) or antacids are commonly used to reduce stomach acid.',
    searchQuery: 'Pantoprazole',
    isEnd: true
  },
  stomach_cramps: {
    id: 'stomach_cramps',
    message: 'Antispasmodic medications are often prescribed to relax the smooth muscles of the gut.',
    searchQuery: 'Mebeverine',
    isEnd: true
  },

  // ALLERGY PATH
  allergy_start: {
    id: 'allergy_start',
    message: 'What kind of allergic reaction are you experiencing?',
    options: [
      { label: 'Runny Nose / Sneezing', nextId: 'allergy_nasal' },
      { label: 'Skin Rash / Itching', nextId: 'allergy_skin' }
    ]
  },
  allergy_nasal: {
    id: 'allergy_nasal',
    message: 'Second-generation antihistamines are highly effective for allergic rhinitis without causing too much drowsiness.',
    searchQuery: 'Levocetirizine',
    isEnd: true
  },
  allergy_skin: {
    id: 'allergy_skin',
    message: 'Antihistamines are commonly used to block the allergic response causing skin irritation.',
    searchQuery: 'Fexofenadine',
    isEnd: true
  },

  // GENERIC DOCTOR WARNING
  consult_doctor: {
    id: 'consult_doctor',
    message: 'Given the severity or duration of your symptoms, I strongly advise consulting a healthcare professional for an accurate diagnosis.',
    isEnd: true
  }
};
