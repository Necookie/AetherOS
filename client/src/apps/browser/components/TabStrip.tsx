import { Plus, X } from 'lucide-react';
import { useBrowserStore } from '../../../stores/browserStore';

export default function TabStrip() {
    const tabOrder = useBrowserStore(s => s.tabOrder);
    const tabsById = useBrowserStore(s => s.tabsById);
    const activeTabId = useBrowserStore(s => s.activeTabId);
    const setActiveTab = useBrowserStore(s => s.setActiveTab);
    const closeTab = useBrowserStore(s => s.closeTab);
    const newTab = useBrowserStore(s => s.newTab);

    return (
        <div className="flex h-9 select-none items-end overflow-x-auto border-b border-hairline bg-parchment pl-1 pr-1"
            style={{ scrollbarWidth: 'none' }}
        >
            {tabOrder.map(tabId => {
                const tab = tabsById[tabId];
                if (!tab) return null;
                const isActive = tabId === activeTabId;

                return (
                    <div
                        key={tabId}
                        onClick={() => setActiveTab(tabId)}
                        className={`group relative flex h-[30px] min-w-[100px] max-w-[180px] shrink-0 cursor-pointer items-center gap-1.5 rounded-t-lg px-3 text-xs transition-colors
                            ${isActive
                                ? 'z-10 border border-b-0 border-hairline bg-canvas text-ink'
                                : 'bg-transparent text-ink-muted-48 hover:bg-canvas hover:text-ink-muted'
                            }
                        `}
                        style={{ marginBottom: isActive ? '-1px' : '0' }}
                    >
                        {/* Mode dot */}
                        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${tab.mode === 'external' ? 'bg-warning' :
                                tab.mode === 'embed' ? 'bg-success' :
                                    'bg-primary'
                            }`} />

                        {/* Title */}
                        <span className="truncate flex-1">{tab.title || 'New Tab'}</span>

                        {/* Close */}
                        <button
                            onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                            className="rounded-sm p-0.5 opacity-0 transition-opacity hover:bg-hairline group-hover:opacity-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}

            {/* New Tab Button */}
            <button
                onClick={() => newTab()}
                className="ml-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-ink-muted-48 transition-colors hover:bg-canvas hover:text-ink"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
