import type { Task, UpdateTaskInput, Status } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    onUpdate: (input: UpdateTaskInput) => void;
    onDelete: (id: number) => void;
    onChangeStatus: (id: number, status: Status) => void;
}

export default function TaskList({ tasks, onUpdate, onDelete, onChangeStatus }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <section className="space-y-3">
                <div className="empty-state">
                    조건에 해당하는 작업이 없습니다.
                    <br />
                    위에서 새 작업을 추가하거나, 검색/필터를 확인해보세요.
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-3">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onChangeStatus={onChangeStatus}
                />
            ))}
        </section>
    );
}
