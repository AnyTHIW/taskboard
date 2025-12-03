import type { Task, Priority } from '../types/task';

const STORAGE_KEY = 'taskData';

const initialTasks: Task[] = [
    {
        id: 1,
        title: '예시1 포트폴리오 기획 정리',
        description: '어떤 웹앱을 만들지 간단히 적어보기',
        status: 'todo',
        createdAt: new Date().toISOString(),
        tags: ['포폴'],
        priority: 'low',
    },
    {
        id: 2,
        title: '예시2 Task Board 기본 UI 만들기',
        description: '리스트, 추가 폼, 필터 버튼',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        priority: 'high',
    },
    {
        id: 3,
        title: '예시3 Vercel 배포 테스트',
        description: '배포 경험까지 만들어두기',
        status: 'done',
        createdAt: new Date().toISOString(),
        tags: ['태그1', '태그2'],
        priority: 'medium',
    },
];

function normalizeTags(raw: unknown): string[] | undefined {
    if (Array.isArray(raw)) {
        return raw.map((t) => String(t)).filter(Boolean);
    }

    if (typeof raw === 'string') {
        return raw
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }

    return undefined;
}

function normalizePriority(raw: unknown): Priority | undefined {
    if (raw === 'low' || raw === 'medium' || raw === 'high') {
        return raw;
    }
    return undefined;
}

export function loadTasks(): Task[] {
    if (typeof window === 'undefined') {
        return initialTasks;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialTasks;

    try {
        const parsed = JSON.parse(stored) as unknown;
        if (!Array.isArray(parsed)) return initialTasks;

        return parsed.map((item) => {
            const t = item as Partial<Task>;
            return {
                id: typeof t.id === 'number' ? t.id : Date.now(),
                title: t.title ?? '(제목 없음)',
                description: t.description || undefined,
                status: t.status ?? 'todo',
                createdAt: t.createdAt ?? new Date().toISOString(),
                tags: normalizeTags(t.tags),
                priority: normalizePriority(t.priority),
            };
        });
    } catch {
        return initialTasks;
    }
}

export function saveTasks(tasks: Task[]) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
