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
        summary: 'Open a clean document and start writing blocks immediately.',
        category: 'Writing',
        highlights: ['Block editor', 'No setup'],
        record: {
            title: 'Untitled document',
            body: '',
        },
    }),
    defineTemplate('docs', 'project-brief', {
        title: 'Project Brief',
        summary: 'A concise kickoff document for goals, scope, risks, and delivery plan.',
        category: 'Planning',
        highlights: ['Objectives', 'Scope', 'Risks', 'Milestones'],
        record: {
            title: 'Project brief',
            body: [
                '# Project brief',
                '',
                '## Objective',
                'What problem are we solving, and for whom?',
                '',
                '## Success metrics',
                '- ',
                '- ',
                '',
                '## Scope',
                '- In scope:',
                '- Out of scope:',
                '',
                '## Dependencies',
                '- Team:',
                '- Systems:',
                '',
                '## Risks',
                '- ',
                '',
                '## Milestones',
                '- Kickoff:',
                '- Review:',
                '- Launch:',
            ].join('\n'),
            attachments: ['/home/user/Documents/readme.txt'],
        },
    }),
    defineTemplate('docs', 'meeting-readout', {
        title: 'Meeting Readout',
        summary: 'Capture context, decisions, owners, and follow-up actions after a session.',
        category: 'Operations',
        highlights: ['Attendees', 'Decisions', 'Action items'],
        record: {
            title: 'Meeting readout',
            body: [
                '# Meeting readout',
                '',
                '## Context',
                'Purpose of the meeting and the current situation.',
                '',
                '## Attendees',
                '- ',
                '',
                '## Decisions',
                '- ',
                '',
                '## Open questions',
                '- ',
                '',
                '## Action items',
                '- [ ] Owner / next step',
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
