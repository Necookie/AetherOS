import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ClockWidget from './components/ClockWidget'
import WeatherWidget from './components/WeatherWidget'
import SystemStatsWidget from './components/SystemStatsWidget'
import WidgetBoard from './components/WidgetBoard'

describe('Widgets suite', () => {
    it('renders ClockWidget with formatted time and date', () => {
        const html = renderToStaticMarkup(createElement(ClockWidget))
        expect(html).toContain('Local Time')
        expect(html).toContain('tabular-nums')
    })

    it('renders WeatherWidget with temperature and metrics', () => {
        const html = renderToStaticMarkup(createElement(WeatherWidget))
        expect(html).toContain('Weather')
        expect(html).toContain('Humidity')
        expect(html).toContain('Wind')
    })

    it('renders SystemStatsWidget with telemetry metrics', () => {
        const html = renderToStaticMarkup(createElement(SystemStatsWidget))
        expect(html).toContain('System Telemetry')
        expect(html).toContain('CPU')
        expect(html).toContain('Memory')
        expect(html).toContain('Network')
    })

    it('renders WidgetBoard with all widgets when open', () => {
        const html = renderToStaticMarkup(createElement(WidgetBoard, { isOpen: true }))
        expect(html).toContain('Widgets')
        expect(html).toContain('Local Time')
        expect(html).toContain('Weather')
        expect(html).toContain('System Telemetry')
    })

    it('renders collapsed widget button when closed', () => {
        const html = renderToStaticMarkup(createElement(WidgetBoard, { isOpen: false }))
        expect(html).toContain('Show widgets')
    })
})
