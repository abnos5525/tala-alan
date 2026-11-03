import { expect, test } from 'vitest'
import { bindTelegram, readWebApp } from './webapp.ts'

test('does nothing when the official script is absent', () => {
  expect(readWebApp({} as Window)).toBeNull()
  expect(() => bindTelegram(null)).not.toThrow()
})

test('calls ready and expand and does not read initData', () => {
  const calls: string[] = []
  const webApp = {
    ready: () => calls.push('ready'),
    expand: () => calls.push('expand'),
    isExpanded: false,
    setBackgroundColor: (color: string) => calls.push(`bg:${color}`),
    setHeaderColor: (color: string) => calls.push(`header:${color}`),
    themeParams: { bg_color: '#112233', secondary_bg_color: '#445566' },
    initData: 'must-not-be-read',
  }
  bindTelegram(webApp)
  expect(calls).toEqual(['ready', 'expand', 'bg:#282a36', 'header:#282a36'])
})
