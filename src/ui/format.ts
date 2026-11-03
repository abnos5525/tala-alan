const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function faNumber(value: string): string {
  const negative = value.startsWith('-')
  const raw = negative ? value.slice(1) : value
  const [whole, fraction] = raw.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '٬')
  const text = fraction === undefined ? grouped : `${grouped}.${fraction}`
  const shown = text.replace(/\d/g, (digit) => faDigits[Number(digit)] ?? digit)
  return negative ? `−${shown}` : shown
}

export function faTime(iso: string): string {
  const parsed = Date.parse(iso)
  if (Number.isNaN(parsed)) return iso
  return new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}
