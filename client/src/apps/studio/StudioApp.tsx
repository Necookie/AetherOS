import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    Box,
    Braces,
    Check,
    ChevronDown,
    ChevronRight,
    Circle,
    Code2,
    FileCode2,
    FileJson,
    Folder,
    GitBranch,
    PanelBottomClose,
    PanelBottomOpen,
    Play,
    Plus,
    Search,
    Settings2,
    X,
} from 'lucide-react'
import Window from '../../components/system/Window'
import { useWindowStore } from '../../stores/windowStore'

type StudioFile = {
    name: string
    language: string
    content: string
    icon: 'tsx' | 'css' | 'json'
}

const STARTER_FILES: Record<string, StudioFile> = {
    'src/App.tsx': {
        name: 'App.tsx',
        language: 'TypeScript React',
        icon: 'tsx',
        content: `import { useState } from 'react'
import './styles.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="workspace">
      <p className="eyebrow">Aether Studio</p>
      <h1>Build something precise.</h1>
      <button onClick={() => setCount(count + 1)}>
        Iteration {count}
      </button>
    </main>
  )
}`,
    },
    'src/styles.css': {
        name: 'styles.css',
        language: 'CSS',
        icon: 'css',
        content: `:root {
  color: #17202a;
  background: #f3f5f7;
  font-family: system-ui, sans-serif;
}

.workspace {
  max-width: 720px;
  margin: 12vh auto;
  padding: 48px;
}

.eyebrow { color: #0066cc; }
button { border-radius: 999px; }`,
    },
    'package.json': {
        name: 'package.json',
        language: 'JSON',
        icon: 'json',
        content: `{
  "name": "aether-project",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^18.2.0"
  }
}`,
    },
}

const FILE_ORDER = ['src/App.tsx', 'src/styles.css', 'package.json']

function FileGlyph({ kind }: { kind: StudioFile['icon'] }) {
    if (kind === 'json') return <FileJson className="h-3.5 w-3.5 text-[#d6b46a]" />
    if (kind === 'css') return <Braces className="h-3.5 w-3.5 text-[#6ca4cf]" />
    return <FileCode2 className="h-3.5 w-3.5 text-[#79b8a3]" />
}

function diagnosticsFor(file: StudioFile) {
    const diagnostics: Array<{ line: number; message: string; level: 'hint' | 'warning' }> = []
    file.content.split('\n').forEach((line, index) => {
        if (line.includes('any')) diagnostics.push({ line: index + 1, message: 'Prefer a specific type over any.', level: 'warning' })
        if (line.length > 88) diagnostics.push({ line: index + 1, message: 'Line exceeds 88 characters.', level: 'hint' })
        if (line.includes('console.log')) diagnostics.push({ line: index + 1, message: 'Console statement can be removed before release.', level: 'hint' })
    })
    return diagnostics
}

export default function StudioApp({ id }: { id: string }) {
    const isFocused = useWindowStore((state) => Boolean(state.windows[id]?.state.isFocused))
    const [files, setFiles] = useState(STARTER_FILES)
    const [activePath, setActivePath] = useState('src/App.tsx')
    const [tabs, setTabs] = useState(['src/App.tsx', 'src/styles.css'])
    const [dirty, setDirty] = useState<Set<string>>(new Set())
    const [panelOpen, setPanelOpen] = useState(true)
    const [panelTab, setPanelTab] = useState<'console' | 'problems'>('console')
    const [running, setRunning] = useState(false)
    const [logs, setLogs] = useState(['Ready. Press Run to compile the workspace.'])
    const [folderOpen, setFolderOpen] = useState(true)
    const [searchOpen, setSearchOpen] = useState(false)
    const [query, setQuery] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const activeFile = files[activePath]
    const diagnostics = useMemo(() => diagnosticsFor(activeFile), [activeFile])
    const lines = activeFile.content.split('\n')

    const openFile = (path: string) => {
        setActivePath(path)
        setTabs((current) => current.includes(path) ? current : [...current, path])
        window.setTimeout(() => textareaRef.current?.focus(), 0)
    }

    const closeTab = (path: string) => {
        if (tabs.length === 1) return
        const index = tabs.indexOf(path)
        const nextTabs = tabs.filter((tab) => tab !== path)
        setTabs(nextTabs)
        if (activePath === path) setActivePath(nextTabs[Math.max(0, index - 1)])
    }

    const updateContent = (content: string) => {
        setFiles((current) => ({ ...current, [activePath]: { ...current[activePath], content } }))
        setDirty((current) => new Set(current).add(activePath))
    }

    const save = useCallback(() => {
        setDirty((current) => {
            const next = new Set(current)
            next.delete(activePath)
            return next
        })
    }, [activePath])

    const run = useCallback(() => {
        if (running) return
        setRunning(true)
        setPanelOpen(true)
        setPanelTab('console')
        setLogs(['› aether-project@0.1.0 build', '› tsc && vite build', ''])
        window.setTimeout(() => {
            setRunning(false)
            setLogs((current) => [...current, `✓ ${Object.keys(files).length} modules transformed`, '✓ built in 428ms', '', 'Preview ready on aether://localhost'])
        }, 650)
    }, [files, running])

    useEffect(() => {
        if (!isFocused) return undefined
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault()
                save()
            }
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                run()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isFocused, run, save])

    const addScratchFile = () => {
        let suffix = 1
        let path = `src/scratch-${suffix}.tsx`
        while (files[path]) {
            suffix += 1
            path = `src/scratch-${suffix}.tsx`
        }
        const nextFile: StudioFile = { name: `scratch-${suffix}.tsx`, language: 'TypeScript React', icon: 'tsx', content: `export function Idea() {\n  return <div>New idea</div>\n}\n` }
        setFiles((current) => ({ ...current, [path]: nextFile }))
        setTabs((current) => [...current, path])
        setActivePath(path)
        setDirty((current) => new Set(current).add(path))
    }

    const visiblePaths = [...FILE_ORDER.filter((path) => files[path]), ...Object.keys(files).filter((path) => !FILE_ORDER.includes(path))]
        .filter((path) => !query || path.toLowerCase().includes(query.toLowerCase()) || files[path].content.toLowerCase().includes(query.toLowerCase()))

    return (
        <Window id={id} title="Aether Studio">
            <div className="flex h-full min-h-0 flex-col bg-[#171a1f] font-sans text-[#dce1e7]">
                <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#20242a] px-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0066cc] text-white"><Code2 className="h-4 w-4" /></div>
                        <div><p className="text-xs font-semibold leading-none">aether-project</p><p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#9ca6b1]">Local workspace</p></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setPanelOpen((value) => !value)} className="rounded-md p-2 text-[#8f99a5] transition-colors hover:bg-white/5 hover:text-white active:scale-95" aria-label="Toggle bottom panel">{panelOpen ? <PanelBottomClose className="h-4 w-4" /> : <PanelBottomOpen className="h-4 w-4" />}</button>
                        <button onClick={run} disabled={running} className="inline-flex items-center gap-2 rounded-full bg-[#0066cc] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-60"><Play className={`h-3.5 w-3.5 fill-current ${running ? 'animate-pulse' : ''}`} />{running ? 'Building' : 'Run'}</button>
                    </div>
                </header>

                <div className="flex min-h-0 flex-1">
                    <nav className="flex w-11 shrink-0 flex-col items-center border-r border-white/[0.07] bg-[#1b1f24] py-2" aria-label="Studio sections">
                        <button onClick={() => setSearchOpen(false)} className={`relative my-0.5 p-2.5 transition-colors ${!searchOpen ? 'text-white' : 'text-[#707a86] hover:text-white'}`} aria-label="Explorer"><FileCode2 className="h-5 w-5" />{!searchOpen && <span className="absolute -left-0.5 inset-y-1 w-0.5 bg-[#4c9fe8]" />}</button>
                        <button onClick={() => setSearchOpen(true)} className={`relative my-0.5 p-2.5 transition-colors ${searchOpen ? 'text-white' : 'text-[#707a86] hover:text-white'}`} aria-label="Search"><Search className="h-5 w-5" />{searchOpen && <span className="absolute -left-0.5 inset-y-1 w-0.5 bg-[#4c9fe8]" />}</button>
                        <button className="my-0.5 p-2.5 text-[#707a86] hover:text-white" aria-label="Source control"><GitBranch className="h-5 w-5" /></button>
                        <button className="my-0.5 p-2.5 text-[#707a86] hover:text-white" aria-label="Extensions"><Box className="h-5 w-5" /></button>
                        <button className="mt-auto p-2.5 text-[#707a86] hover:text-white" aria-label="Settings"><Settings2 className="h-5 w-5" /></button>
                    </nav>

                    <aside className="w-48 shrink-0 border-r border-white/[0.07] bg-[#20242a]">
                        <div className="flex h-10 items-center justify-between px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9ca6b1]"><span>{searchOpen ? 'Search' : 'Explorer'}</span>{!searchOpen && <button onClick={addScratchFile} className="rounded p-1 hover:bg-white/5" aria-label="New file"><Plus className="h-3.5 w-3.5" /></button>}</div>
                        {searchOpen ? (
                            <div className="px-2"><input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Search workspace" className="w-full rounded-md border border-white/10 bg-[#171a1f] px-2.5 py-2 text-xs outline-none placeholder:text-[#69737e] focus:border-[#4c9fe8]" /><p className="px-1 pt-3 text-[10px] text-[#9ca6b1]">{visiblePaths.length} files matched</p></div>
                        ) : (
                            <button onClick={() => setFolderOpen((value) => !value)} className="flex w-full items-center gap-1 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#c2c8cf] hover:bg-white/[0.035]">{folderOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}<Folder className="h-3.5 w-3.5 text-[#7d8995]" /> aether-project</button>
                        )}
                        {(searchOpen || folderOpen) && <div className="mt-1">
                            {visiblePaths.map((path) => <button key={path} onClick={() => openFile(path)} className={`flex w-full items-center gap-2 py-1.5 pr-2 text-left text-xs transition-colors ${activePath === path ? 'bg-[#2b3037] text-white' : 'text-[#aeb6bf] hover:bg-white/[0.035]'}`} style={{ paddingLeft: path.startsWith('src/') ? 28 : 15 }}><FileGlyph kind={files[path].icon} /><span className="min-w-0 flex-1 truncate">{files[path].name}</span>{dirty.has(path) && <Circle className="h-2 w-2 fill-[#73a9d9] text-[#73a9d9]" />}</button>)}
                        </div>}
                    </aside>

                    <section className="flex min-w-0 flex-1 flex-col">
                        <nav className="flex h-9 shrink-0 overflow-x-auto border-b border-white/[0.07] bg-[#1b1f24]" aria-label="Open files">
                            {tabs.map((path) => (
                                <div
                                    key={path}
                                    className={`group flex min-w-32 max-w-48 items-center border-r border-white/[0.07] text-xs ${activePath === path ? 'border-t-2 border-t-[#4c9fe8] bg-[#171a1f] text-white' : 'border-t-2 border-t-transparent bg-[#20242a] text-[#8d97a2]'}`}
                                >
                                    <button
                                        type="button"
                                        aria-pressed={activePath === path}
                                        onClick={() => setActivePath(path)}
                                        className="flex min-w-0 flex-1 items-center gap-2 self-stretch pl-3 text-left"
                                    >
                                        <FileGlyph kind={files[path].icon} />
                                        <span className="min-w-0 flex-1 truncate">{files[path].name}</span>
                                    </button>
                                    {dirty.has(path) ? (
                                        <Circle className="mr-2 h-2 w-2 shrink-0 fill-current" aria-label="Unsaved changes" />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => closeTab(path)}
                                            className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-white/10 focus-visible:opacity-100 group-hover:opacity-100"
                                            aria-label={`Close ${files[path].name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </nav>
                        <div className="flex h-7 shrink-0 items-center gap-1 border-b border-white/[0.05] px-3 text-[10px] text-[#9ca6b1]"><span>aether-project</span><ChevronRight className="h-2.5 w-2.5" /><span>{activePath.replace('/', '  ›  ')}</span></div>

                        <div className="relative flex min-h-0 flex-1 bg-[#171a1f] font-mono text-[13px] leading-6">
                            <div className="w-12 shrink-0 select-none overflow-hidden border-r border-white/[0.035] py-3 pr-3 text-right text-[#8f99a5]" aria-hidden>{lines.map((_, index) => <div key={index}>{index + 1}</div>)}</div>
                            <textarea ref={textareaRef} value={activeFile.content} onChange={(event) => updateContent(event.target.value)} onKeyDown={(event) => {
                                if (event.key === 'Tab') {
                                    event.preventDefault()
                                    const start = event.currentTarget.selectionStart
                                    const end = event.currentTarget.selectionEnd
                                    updateContent(`${activeFile.content.slice(0, start)}  ${activeFile.content.slice(end)}`)
                                    window.requestAnimationFrame(() => { if (textareaRef.current) textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2 })
                                }
                            }} spellCheck={false} className="min-h-0 flex-1 resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-[#d6dbe1] outline-none caret-[#70b7f1] selection:bg-[#24527a]" aria-label={`Editing ${activeFile.name}`} />
                        </div>

                        {panelOpen && <div className="h-36 shrink-0 border-t border-white/[0.08] bg-[#1b1f24]">
                            <div className="flex h-8 items-center gap-5 border-b border-white/[0.05] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f8994]"><button onClick={() => setPanelTab('console')} className={`h-full border-b-2 ${panelTab === 'console' ? 'border-[#4c9fe8] text-[#dce1e7]' : 'border-transparent'}`}>Console</button><button onClick={() => setPanelTab('problems')} className={`flex h-full items-center gap-1.5 border-b-2 ${panelTab === 'problems' ? 'border-[#4c9fe8] text-[#dce1e7]' : 'border-transparent'}`}>Problems {diagnostics.length > 0 && <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px]">{diagnostics.length}</span>}</button></div>
                            <div className="h-[calc(100%-2rem)] overflow-y-auto px-4 py-2 font-mono text-[11px] leading-5 text-[#aeb6bf]">{panelTab === 'console' ? logs.map((log, index) => <div key={`${log}-${index}`} className={log.startsWith('✓') ? 'text-[#79b89b]' : ''}>{log || '\u00a0'}</div>) : diagnostics.length ? diagnostics.map((diagnostic) => <div key={`${diagnostic.line}-${diagnostic.message}`} className="flex gap-3"><span className={diagnostic.level === 'warning' ? 'text-[#d6b46a]' : 'text-[#6ca4cf]'}>{diagnostic.level === 'warning' ? '▲' : '●'}</span><span>{diagnostic.message}</span><span className="ml-auto text-[#65707b]">{activeFile.name}:{diagnostic.line}</span></div>) : <div className="flex items-center gap-2 text-[#79b89b]"><Check className="h-3.5 w-3.5" /> No problems detected</div>}</div>
                        </div>}
                    </section>
                </div>

                <footer className="flex h-6 shrink-0 items-center justify-between bg-[#005bb8] px-2.5 text-[10px] text-white">
                    <div className="flex items-center gap-3"><span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> main*</span><span className="hidden sm:inline">0 errors</span><span className="hidden sm:inline">{diagnostics.length} hints</span></div>
                    <div className="flex items-center gap-3"><span>Ln 1, Col 1</span><span>Spaces: 2</span><span>{activeFile.language}</span></div>
                </footer>
            </div>
        </Window>
    )
}
