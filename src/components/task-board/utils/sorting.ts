import type { Task, SortKey, Priority } from '../types/task';

const PRIORITY_ORDER_HIGH_FIRST: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
};

const PRIORITY_ORDER_LOW_FIRST: Record<Priority, number> = {
    low: 0,
    medium: 1,
    high: 2,
};

export function sortTasks(tasks: Task[], sortKey: SortKey): Task[] {
    const result = [...tasks];

    result.sort((a, b) => {
        if (sortKey === 'createdAtDesc') {
            return +new Date(b.createdAt) - +new Date(a.createdAt);
        }
        if (sortKey === 'createdAtAsc') {
            return +new Date(a.createdAt) - +new Date(b.createdAt);
        }
        if (sortKey === 'titleAsc') {
            return a.title.localeCompare(b.title, 'ko');
        }
        if (sortKey === 'titleDesc') {
            return b.title.localeCompare(a.title, 'ko');
        }
        if (sortKey === 'priorityHighFirst') {
            const aKey = PRIORITY_ORDER_HIGH_FIRST[(a.priority ?? 'medium') as Priority];
            const bKey = PRIORITY_ORDER_HIGH_FIRST[(b.priority ?? 'medium') as Priority];
            return aKey - bKey;
        }
        if (sortKey === 'priorityLowFirst') {
            const aKey = PRIORITY_ORDER_LOW_FIRST[(a.priority ?? 'medium') as Priority];
            const bKey = PRIORITY_ORDER_LOW_FIRST[(b.priority ?? 'medium') as Priority];
            return aKey - bKey;
        }
        return 0;
    });

    return result;
}
