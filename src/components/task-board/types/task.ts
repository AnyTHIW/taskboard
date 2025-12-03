export type Status = 'todo' | 'in-progress' | 'done';
export type Filter = Status | 'all';
export type SortKey =
    | 'createdAtDesc'
    | 'createdAtAsc'
    | 'titleAsc'
    | 'titleDesc'
    | 'priorityHighFirst'
    | 'priorityLowFirst';
export type Theme = 'light' | 'dark';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: Status;
    createdAt: string;
    tags?: string[];
    priority?: Priority;
}

export interface NewTaskInput {
    title: string;
    description?: string;
    tags?: string[];
    priority?: Priority;
}

export interface UpdateTaskInput {
    id: number;
    title?: string;
    description?: string;
    tags?: string[];
    priority?: Priority;
    status?: Status;
}
