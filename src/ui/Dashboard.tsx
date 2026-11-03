import type { ReactNode } from 'react'
import { displayAmount } from '../calc/display.ts'
import type { SignalState } from '../calc/signals.ts'
import type { CardModel, PriceLine } from './dashboardModel.ts'
import { faNumber, faTime } from './format.ts'

export type DashboardStatus =
  | { kind: 'loading' }
  | { kind: 'offline' }
  | { kind: 'error' }
  | { kind: 'empty' }
  | { kind: 'ready'; cards: CardModel[] }

const chip: Record<SignalState, string> = {
  BUY: 'border-[var(--green)] text-[var(--green)]',
  SELL: 'border-[var(--red)] text-[var(--red)]',
  NOT_BUY: 'border-[var(--orange)] text-[var(--orange)]',
  DATA_UNAVAILABLE: 'border-[var(--muted)] text-[var(--muted)]',
  STALE_DATA: 'border-[var(--orange)] text-[var(--orange)]',
  SOURCE_CONFLICT: 'border-[var(--purple)] text-[var(--purple)]',
}

export function Dashboard({ status, onRetry }: { status: DashboardStatus; onRetry: () => void }) {
  return (
    <main className="app-shell mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="mb-5">
        <h1 className="text-[1.65rem] font-semibold leading-tight text-balance">طلا و دلار</h1>
        <p className="mt-2 max-w-[38ch] text-sm leading-6 text-[var(--muted)]">
          این عددها خروجی فرمول هستند، نه توصیه خرید یا قیمت قطعی معامله.
        </p>
      </header>
      <div className="flex flex-1 flex-col gap-3">
        <StatusBlock status={status} onRetry={onRetry} />
      </div>
      <footer className="mt-6 text-xs leading-6 text-[var(--muted)]">
        قیمت تومان با نام و پیوند NerkhAra نشان داده می‌شود. این نمایش حقی روی دادهٔ TGJU و Bonbast نمی‌دهد.
      </footer>
    </main>
  )
}

function StatusBlock({ status, onRetry }: { status: DashboardStatus; onRetry: () => void }) {
  if (status.kind === 'loading') {
    return (
      <section role="status" className="flex flex-col gap-3">
        <p>در حال دریافت قیمت</p>
        <Skeleton />
        <Skeleton />
        <Retry onRetry={onRetry} />
      </section>
    )
  }
  if (status.kind === 'offline') {
    return (
      <Notice title="آفلاین" role="status">
        اتصال نیست. قیمت تازه‌ای گرفته نمی‌شود.
        <Retry onRetry={onRetry} />
      </Notice>
    )
  }
  if (status.kind === 'error') {
    return (
      <Notice title="خطا" role="alert">
        دریافت قیمت ناموفق بود.
        <Retry onRetry={onRetry} />
      </Notice>
    )
  }
  if (status.kind === 'empty') {
    return (
      <Notice title="خالی" role="status">
        قیمتی برای نمایش نرسید.
        <Retry onRetry={onRetry} />
      </Notice>
    )
  }
  return (
    <>
      {status.cards.map((card) => (
        <article key={card.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className={`rounded-full border px-3 py-1 text-sm font-semibold ${chip[card.state]}`}>{card.stateLabel}</p>
          </div>
          <p className="mt-3 text-base leading-7">{card.message}</p>
          {card.threshold !== null && (
            <p className="num mt-3 text-2xl font-semibold tracking-tight text-[var(--cyan)]">
              {faNumber(card.threshold)}
            </p>
          )}
          {card.percent !== null && (
            <p className="num mt-1 text-sm text-[var(--muted)]">فاصله بازار از آستانه: {faNumber(card.percent)} درصد</p>
          )}
          <p className="mt-3 whitespace-pre-line text-xs leading-6 text-[var(--muted)]">{card.formula}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {card.lines.map((line) => (
              <PriceRow key={`${line.label}-${line.source}`} line={line} />
            ))}
          </ul>
        </article>
      ))}
      <Retry onRetry={onRetry} />
    </>
  )
}

function PriceRow({ line }: { line: PriceLine }) {
  return (
    <li className="rounded-xl bg-[var(--inset)] px-3 py-3 text-sm leading-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium">{line.label}</p>
        <p className="num text-base font-semibold">{faNumber(displayAmount(line.price))}</p>
      </div>
      <p className="text-[var(--muted)]">{line.unit}</p>
      <p className="text-[var(--muted)]">منبع: {line.source}</p>
      <p className="text-[var(--muted)]">زمان: {faTime(line.time)}</p>
      {line.attribution !== null && (
        <a className="text-[var(--cyan)] underline decoration-[var(--line)] underline-offset-4" href={line.attribution.url}>
          {line.attribution.text}
        </a>
      )}
    </li>
  )
}

function Notice({ title, role, children }: { title: string; role: 'status' | 'alert'; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4" role={role}>
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{children}</div>
    </section>
  )
}

function Skeleton() {
  return <div className="h-36 animate-pulse rounded-2xl bg-[var(--surface)]" />
}

function Retry({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      className="mt-2 w-full rounded-xl bg-[var(--purple)] px-3 py-3 text-sm font-semibold text-[#282a36]"
      type="button"
      onClick={onRetry}
    >
      تلاش دوباره
    </button>
  )
}
