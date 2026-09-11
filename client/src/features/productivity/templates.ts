import type { ProductivityAppId, ProductivityTemplate, ProductivityTemplateRecord } from './types'

function defineTemplate(
    appId: ProductivityAppId,
    id: string,
    template: Omit<ProductivityTemplate, 'appId' | 'id'>,
): ProductivityTemplate {
    return {
        ...template,
        appId,
        id,
    }
}

function createBoardBody(columns: Array<{ id: string; title: string; cards: Array<{ id: string; title: string; description: string }> }>) {
    return JSON.stringify({ columns }, null, 2)
}

const PRODUCTIVITY_TEMPLATES: ProductivityTemplate[] = [
    defineTemplate('notes', 'blank-note', {
        title: 'Blank Note',
        summary: 'Start from a clean page for fast capture and free-form notes.',
        category: 'Quick capture',
        highlights: ['Lightweight', 'Fast scratchpad'],
        record: {
            title: 'Untitled note',
            body: '',
        },
    }),
    defineTemplate('notes', 'lecture-notes', {
        title: 'Lecture Notes',
        summary: 'Structured note with summary, key concepts, and follow-up questions.',
        category: 'Learning',
        highlights: ['Class summary', 'Key takeaways', 'Questions to revisit'],
        record: {
            title: 'Lecture notes',
            body: [
                'Course:',
                'Session date:',
                '',
                'Summary',
                '- Main topic:',
                '- Why it matters:',
                '',
                'Key concepts',
                '- ',
                '- ',
                '- ',
                '',
                'Examples',
                '- ',
                '',
                'Questions to revisit',
                '- ',
                '',
                'Next action',
                '- Review supporting material and summarize key gaps.',
            ].join('\n'),
        },
    }),
    defineTemplate('notes', 'personal-checklist', {
        title: 'Personal Checklist',
        summary: 'A daily note for errands, habits, and quick follow-through.',
        category: 'Personal',
        highlights: ['Morning focus', 'Errands', 'End-of-day reset'],
        record: {
            title: 'Today checklist',
            body: [
                'Top priorities',
                '- [ ] ',
                '- [ ] ',
                '',
                'Errands',
                '- [ ] ',
                '',
                'Personal reminders',
                '- [ ] ',
                '',
                'Wrap-up',
                '- [ ] Prep tomorrow',
            ].join('\n'),
        },
    }),
    defineTemplate('docs', 'blank-doc', {
        title: 'Blank Document',
        summary: 'Clean, distraction-free document canvas ready for your thoughts.',
        category: 'Writing',
        highlights: ['Distraction-free', 'Instant capture'],
        record: {
            title: 'Untitled document',
            body: '# Untitled Document\n\nStart writing your document here...',
        },
    }),
    defineTemplate('docs', 'project-brief', {
        title: 'Project Proposal',
        summary: 'Comprehensive executive proposal for project scope, objectives, timeline, and ownership.',
        category: 'Planning',
        highlights: ['Executive summary', 'Objectives & scope', 'Milestone checklist'],
        record: {
            title: 'Project Proposal & Scope',
            body: [
                '# Project Proposal & Scope',
                '',
                '## Executive Summary',
                'A high-impact initiative designed to streamline core operating workflows, accelerate product delivery, and unify system ergonomics across teams.',
                '',
                '## Problem Statement',
                'Current fragmented tooling introduces cognitive friction, inconsistent design patterns, and slow cross-functional alignment.',
                '',
                '## Objectives & Success Metrics',
                '- Reduce document review turnaround time by 35% across engineering and product teams.',
                '- Establish a unified, accessible design language compliant with the system visual standards.',
                '- Achieve 99.9% uptime with zero unsaved draft data loss.',
                '',
                '## Scope of Work',
                '- In Scope: Core document authoring engine, rich formatting ribbon, structured templates, and filesystem integration.',
                '- Out of Scope: Real-time multi-cursor external collaboration (scheduled for Phase 2).',
                '',
                '## Milestones & Deliverables',
                '- [x] Phase 1: Requirements gathering and visual design specification',
                '- [x] Phase 2: Core typography and rich-text engine integration',
                '- [ ] Phase 3: Template library and export pipelines',
                '- [ ] Phase 4: Production release and team enablement',
                '',
                '## Key Stakeholders & Ownership',
                '- Product Lead: Alex Morgan',
                '- Technical Lead: Jordan Chen',
                '- Design Lead: Sam Rivera',
            ].join('\n'),
            attachments: ['/home/user/Documents/readme.txt'],
        },
    }),
    defineTemplate('docs', 'prd-spec', {
        title: 'Product Requirements (PRD)',
        summary: 'Structured specification for product goals, user personas, functional requirements, and launch gates.',
        category: 'Product',
        highlights: ['User personas', 'Functional specs', 'Launch checklist'],
        record: {
            title: 'Product Requirement Document',
            body: [
                '# Product Requirement Document (PRD)',
                '',
                '## 1. Overview',
                '- Target Release: v2.4',
                '- Status: In Review',
                '- Author: Product Management Team',
                '',
                '## 2. Problem & Opportunity',
                'Users require a distraction-free, professional word processor that respects desktop OS ergonomics and seamlessly persists documents to local storage.',
                '',
                '## 3. User Personas & Goals',
                '- The Technical Writer: Needs clean typography, instant markdown interoperability, and keyboard shortcuts.',
                '- The Project Manager: Needs structured templates, checklist tracking, and fast export options.',
                '',
                '## 4. Functional Requirements',
                '- Rich text formatting: Headings (H1–H3), bold, italic, underline, strikethrough, code, and alignment.',
                '- Checklists: Interactive task items with instant visual state toggling.',
                '- Autosave & Recovery: Zero-friction background persistence with conflict detection.',
                '',
                '## 5. Release Checklist',
                '- [x] UX Review and design system alignment',
                '- [ ] Performance testing on large documents (>50k words)',
                '- [ ] Accessibility audit for keyboard navigation and screen readers',
                '- [ ] Final QA sign-off',
            ].join('\n'),
        },
    }),
    defineTemplate('docs', 'meeting-readout', {
        title: 'Meeting Notes & Actions',
        summary: 'Professional record of discussion context, key decisions reached, and owner action items.',
        category: 'Operations',
        highlights: ['Discussion notes', 'Decisions reached', 'Action checklist'],
        record: {
            title: 'Team Sync & Decision Record',
            body: [
                '# Team Sync & Decision Record',
                '',
                '## Meeting Details',
                '- Date & Time: Monday, 10:00 AM – 10:45 AM',
                '- Facilitator: Engineering Lead',
                '- Attendees: Product Management, Core Architecture, UX Design',
                '',
                '## Objectives',
                'Align on architecture specifications, review open milestone blockers, and commit to sprint deliverable dates.',
                '',
                '## Discussion & Insights',
                '- System design tokens have been consolidated to match the canonical Apple-inspired design language.',
                '- Performance benchmarks show instant render times for long-form documents.',
                '- Feedback from beta users indicates high demand for curated, structured starter templates.',
                '',
                '## Key Decisions',
                '- Adopted centralized typography and elevation rules across all productivity apps.',
                '- Confirmed delivery schedule for the quarterly system update.',
                '',
                '## Action Items',
                '- [ ] Finalize document export pipeline for Markdown and Plaintext',
                '- [ ] Update team documentation and style guidelines',
                '- [ ] Conduct end-to-end regression testing before release',
            ].join('\n'),
        },
    }),
    defineTemplate('docs', 'weekly-report', {
        title: 'Weekly Status Report',
        summary: 'Executive weekly status digest covering key highlights, deliverables, blockers, and next priorities.',
        category: 'Reports',
        highlights: ['Executive summary', 'Shipped deliverables', 'Next week priorities'],
        record: {
            title: 'Weekly Status Report',
            body: [
                '# Weekly Status Report',
                '',
                '## Executive Summary',
                'Strong progress across core objectives this week with major milestone deliverables completed ahead of schedule.',
                '',
                '## Key Highlights & Achievements',
                '- Completed redesign of the document editor with full design system alignment.',
                '- Implemented new high-fidelity starter templates for product and operations teams.',
                '- Achieved 100% test pass rate across all productivity suites.',
                '',
                '## Work in Progress',
                '- Fine-tuning typography scale and margins for optimal reading ergonomics.',
                '- Adding automated filesystem backup for active documents.',
                '',
                '## Blockers & Risks',
                '- None currently identified. All dependencies remain on track.',
                '',
                '## Next Week Priorities',
                '- [ ] Deploy updated release candidate to staging environment',
                '- [ ] Collect user feedback on document template ergonomics',
                '- [ ] Benchmark memory footprint during intensive multi-tab editing',
            ].join('\n'),
        },
    }),
    defineTemplate('boards', 'blank-board', {
        title: 'Blank Board',
        summary: 'Start from a clean kanban board with the core workflow in place.',
        category: 'Planning',
        highlights: ['To do', 'In progress', 'Done'],
        record: {
            title: 'Untitled board',
            body: createBoardBody([
                { id: 'todo', title: 'To Do', cards: [] },
                { id: 'doing', title: 'In Progress', cards: [] },
                { id: 'done', title: 'Done', cards: [] },
            ]),
        },
    }),
    defineTemplate('boards', 'kanban-sprint', {
        title: 'Kanban Sprint Board',
        summary: 'Opinionated sprint board with ready-made lanes for execution and review.',
        category: 'Delivery',
        highlights: ['Backlog grooming', 'Active sprint', 'QA handoff'],
        record: {
            title: 'Sprint board',
            body: createBoardBody([
                {
                    id: 'backlog',
                    title: 'Backlog',
                    cards: [
                        { id: 'scope', title: 'Lock sprint scope', description: 'Confirm goals, non-goals, and carryover work.' },
                    ],
                },
                {
                    id: 'ready',
                    title: 'Ready',
                    cards: [
                        { id: 'brief', title: 'Draft project brief', description: 'Sync details with [[docs:project-brief]].' },
                    ],
                },
                {
                    id: 'doing',
                    title: 'In Progress',
                    cards: [
                        { id: 'build', title: 'Ship implementation', description: 'Track blockers and handoff notes here.' },
                    ],
                },
                {
                    id: 'review',
                    title: 'Review',
                    cards: [],
                },
                {
                    id: 'done',
                    title: 'Done',
                    cards: [],
                },
            ]),
        },
    }),
    defineTemplate('boards', 'personal-week', {
        title: 'Personal Weekly Board',
        summary: 'A simple weekly organizer for chores, errands, and momentum.',
        category: 'Personal',
        highlights: ['This week', 'Waiting on', 'Finished'],
        record: {
            title: 'Weekly board',
            body: createBoardBody([
                {
                    id: 'this-week',
                    title: 'This Week',
                    cards: [
                        { id: 'focus', title: 'Pick three focus items', description: 'Keep this list short and realistic.' },
                    ],
                },
                {
                    id: 'today',
                    title: 'Today',
                    cards: [],
                },
                {
                    id: 'waiting',
                    title: 'Waiting On',
                    cards: [],
                },
                {
                    id: 'finished',
                    title: 'Finished',
                    cards: [],
                },
            ]),
        },
    }),
]

const DEFAULT_TEMPLATE_IDS: Record<ProductivityAppId, string> = {
    notes: 'blank-note',
    docs: 'blank-doc',
    boards: 'blank-board',
}

export function getProductivityTemplates(appId: ProductivityAppId) {
    return PRODUCTIVITY_TEMPLATES.filter((template) => template.appId === appId)
}

export function getProductivityTemplate(appId: ProductivityAppId, templateId: string) {
    return PRODUCTIVITY_TEMPLATES.find((template) => template.appId === appId && template.id === templateId) ?? null
}

export function getDefaultProductivityTemplate(appId: ProductivityAppId) {
    const templateId = DEFAULT_TEMPLATE_IDS[appId]
    return getProductivityTemplate(appId, templateId) ?? getProductivityTemplates(appId)[0] ?? null
}

export function createTemplateRecord(template: ProductivityTemplate): ProductivityTemplateRecord {
    return {
        title: template.record.title,
        body: template.record.body,
        attachments: [...(template.record.attachments ?? [])],
    }
}
