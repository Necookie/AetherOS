import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { useBrowserStore } from '../../../stores/browserStore';
import AddressBar from './AddressBar';

interface ToolbarProps {
    activeTabId: string | null;
    focusTrigger: number;
    onNavigate: (input: string) => void;
}

export default function Toolbar({ activeTabId, focusTrigger, onNavigate }: ToolbarProps) {
    const tabsById = useBrowserStore(s => s.tabsById);
    const back = useBrowserStore(s => s.back);
    const forward = useBrowserStore(s => s.forward);
    const reload = useBrowserStore(s => s.reload);

    const tab = activeTabId ? tabsById[activeTabId] : null;
    const canGoBack = tab ? tab.backStack.length > 0 : false;
    const canGoForward = tab ? tab.forwardStack.length > 0 : false;

    const navBtnClass = (enabled: boolean) =>
        `p-1.5 rounded-lg transition-colors ${enabled ? 'text-gray-600 hover:bg-gray-200/60 active:scale-95' : 'text-gray-300 cursor-default'}`;

    return (
        <div className="flex items-center gap-1 px-2 py-1.5 bg-white/50 backdrop-blur border-b border-gray-200/40">
            {/* Navigation */}
            <button className={navBtnClass(canGoBack)} onClick={() => activeTabId && canGoBack && back(activeTabId)} disabled={!canGoBack}>
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button className={navBtnClass(canGoForward)} onClick={() => activeTabId && canGoForward && forward(activeTabId)} disabled={!canGoForward}>
                <ChevronRight className="w-4 h-4" />
            </button>
            <button className={navBtnClass(!!activeTabId)} onClick={() => activeTabId && reload(activeTabId)}>
                <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Address Bar */}
            <AddressBar
                displayUrl={tab?.displayUrl || ''}
                onSubmit={onNavigate}
                focusTrigger={focusTrigger}
            />
        </div>
    );
}
