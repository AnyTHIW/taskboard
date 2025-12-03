import type { Task, Filter } from '../types/task';

interface FilterOptions {
    statusFilter: Filter;
    search: string;
    tagFilter: string;
}

export function filterTasks(tasks: Task[], options: FilterOptions): Task[] {
    const { statusFilter, search, tagFilter } = options;
    let result = [...tasks];

    if (statusFilter !== 'all') {
        result = result.filter((task) => task.status === statusFilter);
    }

    const keyword = search.trim().toLowerCase();
    if (keyword) {
        result = result.filter((task) => {
            const titleText = task.title.toLowerCase();
            const descText = (task.description || '').toLowerCase();
            return titleText.includes(keyword) || descText.includes(keyword);
        });
    }

    if (tagFilter.trim()) {
        const tagKeyword = tagFilter.trim().toLowerCase();
        result = result.filter((task) => task.tags?.some((tag) => tag.toLowerCase().includes(tagKeyword)));
    }

    return result;
}
