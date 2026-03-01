export const fmt = (n) =>
  new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(n || 0)

export const MONTHS = [
  'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
  'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'
]

export const PAYMENT_TYPES = ['Card', 'Cash', 'Transfer', 'Altul']

export const WIDGET_META = {
  kpi_venit:         { label: 'Venit Total',          size: 'kpi' },
  kpi_cheltuieli:    { label: 'Cheltuieli Totale',     size: 'kpi' },
  kpi_economii:      { label: 'Economii Totale',       size: 'kpi' },
  kpi_rata_economii: { label: 'Rata Economii',         size: 'kpi' },
  kpi_tranzactii:    { label: 'Nr. Tranzactii',        size: 'kpi' },
  kpi_cea_mai_mare:  { label: 'Cea Mai Mare Chelt.',   size: 'kpi' },
  chart_venit_chelt: { label: 'Venit vs Cheltuieli',   size: 'wide' },
  chart_categorii:   { label: 'Cheltuieli Categorii',  size: 'normal' },
  chart_economii:    { label: 'Economii Lunare',       size: 'wide' },
  list_recente:      { label: 'Tranzactii Recente',    size: 'normal' },
}
