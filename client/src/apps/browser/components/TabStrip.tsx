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
        <div className="flex items-end bg-white/30 backdrop-blur border-b border-gray-200/50 h-9 pl-1 pr-1 overflow-x-auto select-none"
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
                                ? 'bg-white/80 text-gray-800 border border-b-0 border-gray-200/60 shadow-sm z-10'
                                : 'bg-transparent text-gray-500 hover:bg-white/40 hover:text-gray-700'
                            }
                        `}
                        style={{ marginBottom: isActive ? '-1px' : '0' }}
                    >
                        {/* Mode dot */}
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tab.mode === 'external' ? 'bg-amber-400' :
                                tab.mode === 'embed' ? 'bg-green-400' :
                                    'bg-indigo-400'
                            }`} />

                        {/* Title */}
                        <span className="truncate flex-1">{tab.title || 'New Tab'}</span>

                        {/* Close */}
                        <button
                            onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200/60 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}

            {/* New Tab Button */}
            <button
                onClick={() => newTab()}
                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/40 text-gray-400 hover:text-gray-600 transition-colors ml-0.5 flex-shrink-0"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
