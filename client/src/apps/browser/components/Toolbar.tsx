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
        `rounded-md p-1.5 transition-colors ${enabled ? 'text-slate-300 hover:bg-slate-700/80 active:scale-95' : 'cursor-default text-slate-600'}`;

    return (
        <div className="flex items-center gap-1 border-b border-slate-700 bg-slate-900/80 px-2 py-1.5">
            <button className={navBtnClass(canGoBack)} onClick={() => activeTabId && canGoBack && back(activeTabId)} disabled={!canGoBack}>
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button className={navBtnClass(canGoForward)} onClick={() => activeTabId && canGoForward && forward(activeTabId)} disabled={!canGoForward}>
                <ChevronRight className="w-4 h-4" />
            </button>
            <button className={navBtnClass(!!activeTabId)} onClick={() => activeTabId && reload(activeTabId)}>
                <RotateCw className="w-3.5 h-3.5" />
            </button>
            <AddressBar
                displayUrl={tab?.displayUrl || ''}
                onSubmit={onNavigate}
                focusTrigger={focusTrigger}
            />
        </div>
    );
}
