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
                        className={`group relative flex h-[30px] min-w-[105px] max-w-[190px] shrink-0 cursor-pointer items-center gap-1.5 rounded-t-lg px-3 text-xs transition-all active:scale-[0.99]
                            ${isActive
                                ? 'z-10 border border-b-0 border-hairline bg-canvas font-semibold text-ink shadow-xs'
                                : 'bg-transparent text-ink-muted-48 hover:bg-canvas/60 hover:text-ink-muted'
                            }
                        `}
                        style={{ marginBottom: isActive ? '-1px' : '0' }}
                    >
                        {isActive && (
                            <span className="absolute -top-[1px] inset-x-2 h-[2px] rounded-full bg-primary" />
                        )}

                        {/* Mode dot */}
                        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${tab.mode === 'external' ? 'bg-warning' :
                                tab.mode === 'embed' ? 'bg-success' :
                                    'bg-primary'
                            }`} />

                        {/* Title */}
                        <span className="truncate flex-1 font-medium">{tab.title || 'New Tab'}</span>

                        {/* Close */}
                        <button
                            onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-black/10 hover:text-danger group-hover:opacity-100"
                            aria-label={`Close ${tab.title || 'tab'}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}

            {/* New Tab Button */}
            <button
                onClick={() => newTab()}
                className="ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-ink-muted-48 transition-all hover:bg-canvas hover:text-primary active:scale-95"
                aria-label="Open new browser tab"
                title="New Tab"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
