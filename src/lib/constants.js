export const CATEGORIES = [
  { id: 'chirie', label: 'Chirie/Utilități', icon: '🏠', color: '#6366f1' },
  { id: 'mancare', label: 'Mâncare/Grocery', icon: '🛒', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: 'abonamente', label: 'Abonamente', icon: '📱', color: '#8b5cf6' },
  { id: 'divertisment', label: 'Divertisment', icon: '🎬', color: '#ec4899' },
  { id: 'sanatate', label: 'Sănătate', icon: '💊', color: '#10b981' },
  { id: 'investitii', label: 'Investiții/Economii', icon: '📈', color: '#06b6d4' },
  { id: 'altele', label: 'Altele', icon: '📦', color: '#94a3b8' },
]

export const MONTHS = [
  'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
  'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'
]

export const PAYMENT_TYPES = ['Card', 'Cash', 'Transfer', 'Investiție']

export const BT_CATEGORY_RULES = {
  'Chirie/Utilități': ['chirie','enel','electrica','engie','gaz','apa','digi','orange','vodafone','telekom','utilit','intretinere','asociat'],
  'Mâncare/Grocery': ['kaufland','lidl','mega image','carrefour','penny','profi','selgros','metro','restaurant','pizza','mcdonalds','kfc','bolt food','glovo','tazz','market','supermarket'],
  'Transport': ['petrom','mol','rompetrol','omv','lukoil','benzin','bolt','uber','stb','metrorex','cfr','parcare','rovinieta'],
  'Abonamente': ['netflix','spotify','youtube','apple','google','microsoft','adobe','amazon','hbo','abonament','subscript','chatgpt','openai'],
  'Divertisment': ['cinema','teatru','concert','bar','club','pub','cafenea','starbucks','bilete','fitness','gym'],
  'Sănătate': ['farmacie','catena','sensiblu','help net','dona','spital','clinica','medic','doctor','dentist','analize','laborator'],
  'Investiții/Economii': ['investit','broker','tradeville','degiro','etf','fond','depozit','economii','savings'],
}

export function detectCategory(description) {
  const desc = description.toLowerCase()
  for (const [cat, keywords] of Object.entries(BT_CATEGORY_RULES)) {
    if (keywords.some(kw => desc.includes(kw))) return cat
  }
  return 'Altele'
}
