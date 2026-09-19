// Comprehensive Directory of Medical Specializations across Indian & International Healthcare Systems

export const MEDICAL_SPECIALTY_GROUPS = [
  {
    category: 'Primary & Family Healthcare',
    specialties: [
      { name: 'General Physician', label: 'General Physician (Internal Medicine)', query: 'General Physician' },
      { name: 'Family Physician', label: 'Family Physician / General Practitioner', query: 'Family Physician' },
      { name: 'Pediatrician', label: 'Pediatrician (Child Healthcare & Vaccinations)', query: 'Pediatrician' },
      { name: 'Geriatrician', label: 'Geriatrician (Elderly Care & Aging)', query: 'Geriatrician' },
    ],
  },
  {
    category: 'Cardiology & Vascular Systems',
    specialties: [
      { name: 'Cardiologist', label: 'Cardiologist (Heart Care, ECG & Hypertension)', query: 'Cardiologist' },
      { name: 'Cardiothoracic Surgeon', label: 'Cardiothoracic Surgeon (Heart & Bypass Surgery)', query: 'Cardiothoracic Surgeon' },
      { name: 'Vascular Surgeon', label: 'Vascular Surgeon (Blood Vessels & Veins)', query: 'Vascular Surgeon' },
    ],
  },
  {
    category: 'Dermatology & Cosmetology',
    specialties: [
      { name: 'Dermatologist', label: 'Dermatologist (Skin, Hair, Acne & Allergies)', query: 'Dermatologist' },
      { name: 'Trichologist', label: 'Trichologist (Hair Loss & Scalp Specialist)', query: 'Trichologist' },
      { name: 'Cosmetologist', label: 'Cosmetologist / Aesthetic Physician', query: 'Cosmetologist' },
      { name: 'Plastic Surgeon', label: 'Plastic & Reconstructive Surgeon', query: 'Plastic Surgeon' },
    ],
  },
  {
    category: 'Orthopedics & Musculoskeletal',
    specialties: [
      { name: 'Orthopedic Surgeon', label: 'Orthopedic Surgeon (Bone, Joint & Fractures)', query: 'Orthopedic Surgeon' },
      { name: 'Spine Surgeon', label: 'Spine Surgeon (Back & Disc Surgery)', query: 'Spine Surgeon' },
      { name: 'Rheumatologist', label: 'Rheumatologist (Arthritis & Autoimmune Diseases)', query: 'Rheumatologist' },
      { name: 'Physiotherapist', label: 'Physiotherapist & Physical Rehab Specialist', query: 'Physiotherapist' },
      { name: 'Sports Medicine Specialist', label: 'Sports Medicine Specialist', query: 'Sports Medicine Specialist' },
    ],
  },
  {
    category: "Women's Health & Obstetrics",
    specialties: [
      { name: 'Gynecologist & Obstetrician', label: 'Gynecologist & Obstetrician (OB-GYN / Maternity)', query: 'Gynecologist' },
      { name: 'Infertility Specialist', label: 'Infertility & IVF Specialist', query: 'Infertility Specialist' },
      { name: 'Neonatologist', label: 'Neonatologist (Newborn Intensive Care / NICU)', query: 'Neonatologist' },
    ],
  },
  {
    category: 'Neurology, Brain & Mental Health',
    specialties: [
      { name: 'Neurologist', label: 'Neurologist (Brain, Nerves, Stroke & Epilepsy)', query: 'Neurologist' },
      { name: 'Neurosurgeon', label: 'Neurosurgeon (Brain & Spine Neurosurgery)', query: 'Neurosurgeon' },
      { name: 'Psychiatrist', label: 'Psychiatrist (Mental Health, Anxiety & Depression)', query: 'Psychiatrist' },
      { name: 'Clinical Psychologist', label: 'Clinical Psychologist / Psychotherapist', query: 'Clinical Psychologist' },
    ],
  },
  {
    category: 'Eyes, ENT & Dental Healthcare',
    specialties: [
      { name: 'Ophthalmologist', label: 'Ophthalmologist (Eye Specialist & Cataract Surgeon)', query: 'Ophthalmologist' },
      { name: 'ENT Specialist', label: 'ENT Specialist (Otolaryngologist - Ear, Nose, Throat)', query: 'ENT Specialist' },
      { name: 'Dentist', label: 'Dentist & Dental Surgeon (Teeth & Gums)', query: 'Dentist' },
      { name: 'Orthodontist', label: 'Orthodontist (Braces & Teeth Aligners)', query: 'Orthodontist' },
      { name: 'Oral & Maxillofacial Surgeon', label: 'Oral & Maxillofacial Surgeon', query: 'Maxillofacial Surgeon' },
    ],
  },
  {
    category: 'Gastroenterology, Liver & Nephrology',
    specialties: [
      { name: 'Gastroenterologist', label: 'Gastroenterologist (Stomach, Digestion & Acid Reflux)', query: 'Gastroenterologist' },
      { name: 'Hepatologist', label: 'Hepatologist (Liver, Cirrhosis & Jaundice)', query: 'Hepatologist' },
      { name: 'Nephrologist', label: 'Nephrologist (Kidney Diseases & Dialysis)', query: 'Nephrologist' },
      { name: 'Urologist', label: 'Urologist (Kidney Stones, Urinary & Prostate)', query: 'Urologist' },
    ],
  },
  {
    category: 'Pulmonology, Endocrine & Oncology',
    specialties: [
      { name: 'Pulmonologist', label: 'Pulmonologist / Chest Physician (Lungs, Asthma & COPD)', query: 'Pulmonologist' },
      { name: 'Endocrinologist', label: 'Endocrinologist & Diabetologist (Diabetes & Thyroid)', query: 'Endocrinologist' },
      { name: 'Medical Oncologist', label: 'Medical Oncologist (Cancer Specialist & Chemotherapy)', query: 'Oncologist' },
      { name: 'Surgical Oncologist', label: 'Surgical Oncologist (Cancer Surgeries)', query: 'Surgical Oncologist' },
      { name: 'Hematologist', label: 'Hematologist (Blood Disorders, Anemia & Leukemia)', query: 'Hematologist' },
    ],
  },
  {
    category: 'General Surgery & Critical Care',
    specialties: [
      { name: 'General Surgeon', label: 'General Surgeon (Laparoscopy, Hernia & Appendicitis)', query: 'General Surgeon' },
      { name: 'Emergency Medicine Specialist', label: 'Emergency Medicine & Trauma Specialist', query: 'Emergency Medicine' },
      { name: 'Critical Care Specialist', label: 'Critical Care Specialist (ICU Intensivist)', query: 'Critical Care Specialist' },
      { name: 'Anesthesiologist', label: 'Anesthesiologist & Pain Management Physician', query: 'Anesthesiologist' },
    ],
  },
  {
    category: 'Diagnostics & AYUSH Medicine',
    specialties: [
      { name: 'Radiologist', label: 'Radiologist (X-Ray, Ultrasound, CT Scan & MRI)', query: 'Radiologist' },
      { name: 'Pathologist', label: 'Pathologist (Clinical Pathology & Lab Diagnostics)', query: 'Pathologist' },
      { name: 'Ayurvedic Physician', label: 'Ayurvedic Physician (BAMS / MD Ayurveda)', query: 'Ayurvedic Physician' },
      { name: 'Homeopathic Physician', label: 'Homeopathic Physician (BHMS / MD Homeopathy)', query: 'Homeopathic Physician' },
      { name: 'Clinical Nutritionist', label: 'Clinical Nutritionist & Dietitian', query: 'Nutritionist' },
    ],
  },
];

// Flat array of all distinct specialty names
export const ALL_SPECIALTIES_FLAT = MEDICAL_SPECIALTY_GROUPS.flatMap((group) =>
  group.specialties.map((s) => s.name)
);

// Top specialties featured in the website footer with direct routing links
export const TOP_FOOTER_SPECIALTIES = [
  { name: 'Cardiology (Heart Care)', query: 'Cardiologist' },
  { name: 'Dermatology (Skin & Hair)', query: 'Dermatologist' },
  { name: 'General Medicine (Family Care)', query: 'General Physician' },
  { name: 'Pediatrics (Child Healthcare)', query: 'Pediatrician' },
  { name: 'Orthopedics (Bone & Joints)', query: 'Orthopedic Surgeon' },
  { name: 'Neurology (Brain & Nerves)', query: 'Neurologist' },
  { name: "Gynecology (Women's Health)", query: 'Gynecologist' },
  { name: 'Dentistry (Dental Care)', query: 'Dentist' },
];
