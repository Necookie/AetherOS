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
        <div className="flex h-9 select-none items-end overflow-x-auto border-b border-slate-700/90 bg-slate-900/90 pl-1 pr-1"
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
                        className={`group relative flex items-center gap-1.5 px-3 h-[30px] max-w-[180px] min-w-[100px] rounded-t-lg text-xs cursor-pointer transition-all duration-100 shrink-0
                            ${isActive
                                ? 'z-10 border border-b-0 border-slate-700 bg-slate-800 text-slate-100 shadow-sm'
                                : 'bg-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                            }
                        `}
                        style={{ marginBottom: isActive ? '-1px' : '0' }}
                    >
                        {/* Mode dot */}
                        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${tab.mode === 'external' ? 'bg-amber-400' :
                                tab.mode === 'embed' ? 'bg-emerald-400' :
                                    'bg-indigo-400'
                            }`} />

                        {/* Title */}
                        <span className="truncate flex-1">{tab.title || 'New Tab'}</span>

                        {/* Close */}
                        <button
                            onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                            className="rounded p-0.5 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}

            {/* New Tab Button */}
            <button
                onClick={() => newTab()}
                className="ml-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
