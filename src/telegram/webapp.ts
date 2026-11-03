type TelegramWebApp = {
  ready: () => void
  expand: () => void
  isExpanded?: boolean
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  themeParams?: {
    bg_color?: string
    secondary_bg_color?: string
  }
}

type TelegramWindow = Window & {
  Telegram?: { WebApp?: TelegramWebApp }
}

export function readWebApp(target: TelegramWindow = window): TelegramWebApp | null {
  const webApp = target.Telegram?.WebApp
  if (!webApp || typeof webApp.ready !== 'function' || typeof webApp.expand !== 'function') return null
  return webApp
}

const draculaChrome = '#282a36'

export function bindTelegram(webApp: TelegramWebApp | null = readWebApp()): void {
  if (!webApp) return
  webApp.ready()
  if (webApp.isExpanded !== true) webApp.expand()
  if (typeof webApp.setBackgroundColor === 'function') webApp.setBackgroundColor(draculaChrome)
  if (typeof webApp.setHeaderColor === 'function') webApp.setHeaderColor(draculaChrome)
}
