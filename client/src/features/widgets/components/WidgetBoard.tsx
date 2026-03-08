import ClockWidget from './ClockWidget'
import SystemStatsWidget from './SystemStatsWidget'
import WeatherWidget from './WeatherWidget'

export default function WidgetBoard() {
    return (
        <aside
            className="pointer-events-auto absolute right-3 top-3 z-10 w-[min(21rem,calc(100%-1.5rem))] space-y-2 md:right-5 md:top-5 md:w-[19rem]"
            aria-label="Desktop widgets"
        >
            <ClockWidget />
            <WeatherWidget />
            <SystemStatsWidget />
        </aside>
    )
}
