import type { Status } from '../types/task';

const LABELS: Record<Status, string> = {
    todo: '할 일',
    'in-progress': '진행 중',
    done: '완료',
};

const STYLE_MAP: Record<Status, string> = {
    todo: 'status-badge status-badge-todo',
    'in-progress': 'status-badge status-badge-in-progress',
    done: 'status-badge status-badge-done',
};

interface StatusBadgeProps {
    status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    return <span className={STYLE_MAP[status]}>{LABELS[status]}</span>;
}
