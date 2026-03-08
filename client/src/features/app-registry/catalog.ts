import type { RegistryAppMetadata } from './types'

export const APP_REGISTRY_CATALOG: RegistryAppMetadata[] = [
    {
        id: 'appstore',
        title: 'App Store',
        summary: 'Browse and manage AetherOS apps and updates.',
        category: 'system',
        iconId: 'appstore',
        launchable: true,
        releases: [
            {
                version: '1.1.0',
                dependencies: [],
                changelog: 'Improved package dependency diagnostics and update orchestration.',
            },
            {
                version: '1.0.0',
                dependencies: [],
                changelog: 'Initial package browsing and install lifecycle support.',
            },
        ],
    },
    {
        id: 'browser',
        title: 'Aether Browser',
        summary: 'Web browsing workspace with tabbed sessions.',
        category: 'system',
        iconId: 'browser',
        launchable: true,
        releases: [
            {
                version: '1.3.0',
                dependencies: [],
                changelog: 'Performance improvements and hardened embed policies.',
            },
            {
                version: '1.2.0',
                dependencies: [],
                changelog: 'Improved tab handling and address validation.',
            },
        ],
    },
    {
        id: 'explorer',
        title: 'File Manager',
        summary: 'Browse and manage virtual files and folders.',
        category: 'system',
        iconId: 'explorer',
        launchable: true,
        releases: [
            {
                version: '1.1.0',
                dependencies: [],
                changelog: 'Improved directory tree and metadata views.',
            },
            {
                version: '1.0.0',
                dependencies: [],
                changelog: 'Baseline file system browsing capabilities.',
            },
        ],
    },
    {
        id: 'term',
        title: 'Terminal',
        summary: 'Developer shell with command runtime integration.',
        category: 'developer',
        iconId: 'term',
        launchable: true,
        releases: [
            {
                version: '1.2.0',
                dependencies: [],
                changelog: 'Command runtime stability updates and parsing fixes.',
            },
            {
                version: '1.1.0',
                dependencies: [],
                changelog: 'Extended command support and improved output buffering.',
            },
        ],
    },
    {
        id: 'taskmgr',
        title: 'Task Manager',
        summary: 'Inspect running processes and system metrics.',
        category: 'system',
        iconId: 'taskmgr',
        launchable: true,
        releases: [
            {
                version: '1.1.0',
                dependencies: [],
                changelog: 'Refined process metrics and polling cadence.',
            },
            {
                version: '1.0.0',
                dependencies: [],
                changelog: 'Core process listing and control surface.',
            },
        ],
    },
    {
        id: 'settings',
        title: 'Settings',
        summary: 'Configure desktop, accessibility, and behavior.',
        category: 'system',
        iconId: 'settings',
        launchable: true,
        releases: [
            {
                version: '1.1.0',
                dependencies: [],
                changelog: 'Expanded accessibility checks and personalization options.',
            },
            {
                version: '1.0.0',
                dependencies: [],
                changelog: 'Initial settings control center.',
            },
        ],
    },
    {
        id: 'notes',
        title: 'Notes',
        summary: 'Quick capture workspace for local notes.',
        category: 'productivity',
        iconId: 'notes',
        launchable: true,
        releases: [
            {
                version: '2.0.0',
                dependencies: [{ appId: 'explorer', range: '>=1.1.0 <2.0.0' }],
                changelog: 'Shared productivity workspace with autosave and cross-link previews.',
            },
            {
                version: '1.0.0',
                dependencies: [{ appId: 'explorer', range: '>=1.0.0 <2.0.0' }],
                changelog: 'Initial text capture and autosave support.',
            },
        ],
    },
    {
        id: 'docs',
        title: 'Docs',
        summary: 'Rich text authoring workspace for structured documents.',
        category: 'productivity',
        iconId: 'docs',
        launchable: true,
        releases: [
            {
                version: '1.0.0',
                dependencies: [
                    { appId: 'explorer', range: '>=1.1.0 <2.0.0' },
                    { appId: 'notes', range: '>=2.0.0 <3.0.0' },
                ],
                changelog: 'Rich text editing with shared draft autosave and linked references.',
            },
        ],
    },
    {
        id: 'boards',
        title: 'Boards',
        summary: 'Kanban planning boards integrated with notes and docs.',
        category: 'productivity',
        iconId: 'boards',
        launchable: true,
        releases: [
            {
                version: '1.0.0',
                dependencies: [
                    { appId: 'explorer', range: '>=1.1.0 <2.0.0' },
                    { appId: 'notes', range: '>=2.0.0 <3.0.0' },
                ],
                changelog: 'Column-based task boards with cross-app linking and autosave drafts.',
            },
        ],
    },
    {
        id: 'mail',
        title: 'Mail',
        summary: 'Unified inbox with offline queue simulation.',
        category: 'productivity',
        iconId: 'mail',
        launchable: false,
        releases: [
            {
                version: '2.1.0',
                dependencies: [
                    { appId: 'browser', range: '>=1.3.0 <2.0.0' },
                    { appId: 'notes', range: '>=1.2.0 <2.0.0' },
                ],
                changelog: 'Compose drafts and cross-linking with notes.',
            },
            {
                version: '2.0.0',
                dependencies: [
                    { appId: 'browser', range: '>=1.2.0 <2.0.0' },
                    { appId: 'notes', range: '>=1.0.0 <2.0.0' },
                ],
                changelog: 'Inbox model with simulated sync states.',
            },
        ],
    },
    {
        id: 'devtools',
        title: 'DevTools Pack',
        summary: 'Diagnostics and profiling bundle for app developers.',
        category: 'developer',
        iconId: 'devtools',
        launchable: false,
        releases: [
            {
                version: '0.9.0',
                dependencies: [
                    { appId: 'term', range: '>=1.2.0 <2.0.0' },
                    { appId: 'taskmgr', range: '>=1.1.0 <2.0.0' },
                ],
                changelog: 'Preview release with runtime profiler primitives.',
            },
        ],
    },
]

export const PREINSTALLED_APP_IDS = ['appstore', 'browser', 'explorer', 'notes', 'docs', 'boards', 'term', 'taskmgr', 'settings'] as const
