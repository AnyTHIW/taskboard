import { useState } from 'react';
import type { Task, Priority, UpdateTaskInput, Status } from '../types/task';
import StatusBadge from './StatusBadge';

interface TaskItemProps {
    task: Task;
    onUpdate: (input: UpdateTaskInput) => void;
    onDelete: (id: number) => void;
    onChangeStatus: (id: number, status: Status) => void;
}

const PRIORITY_LABEL_KO: Record<Priority, string> = {
    high: '🔥 높음',
    medium: '⚡ 보통',
    low: '🌱 낮음',
};

export default function TaskItem({ task, onUpdate, onDelete, onChangeStatus }: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description ?? '');
    const [editTags, setEditTags] = useState(task.tags?.join(', ') ?? '');
    const [editPriority, setEditPriority] = useState<Priority>(task.priority ?? 'medium');

    const handleStartEdit = () => {
        setEditTitle(task.title);
        setEditDescription(task.description ?? '');
        setEditTags(task.tags?.join(', ') ?? '');
        setEditPriority(task.priority ?? 'medium');
        setIsEditing(true);
    };

    const handleSave = () => {
        const trimmed = editTitle.trim();
        if (!trimmed) return;

        const parsedTags = editTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

        onUpdate({
            id: task.id,
            title: trimmed,
            description: editDescription.trim() || undefined,
            tags: parsedTags,
            priority: editPriority,
        });

        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditTitle(task.title);
        setEditDescription(task.description ?? '');
        setEditTags(task.tags?.join(', ') ?? '');
        setEditPriority(task.priority ?? 'medium');
    };

    return (
        <article className="task-card">
            <div className="mt-1">
                <StatusBadge status={task.status} />
            </div>

            <div className="flex-1 space-y-1">
                {isEditing ? (
                    <>
                        <input
                            className="input-default mb-2 text-sm font-semibold"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                        />
                        <textarea
                            className="input-default mb-2 text-sm"
                            rows={3}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="설명을 선택적으로 입력하세요"
                        />
                        <input
                            className="input-default mb-2 text-sm"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            placeholder="태그를 쉼표로 구분해서 입력 (예: 공부, React)"
                        />
                        <select
                            className="input-default mb-2 text-sm"
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                        >
                            <option value="low">낮음</option>
                            <option value="medium">보통</option>
                            <option value="high">높음</option>
                        </select>
                    </>
                ) : (
                    <>
                        <h3 className="font-semibold">{task.title}</h3>
                        {task.description && <p className="text-slate-700 dark:text-slate-300">{task.description}</p>}

                        <div className="mt-2 flex flex-wrap gap-1">
                            {task.tags?.map((tag, i) => (
                                <span key={i} className="tag-badge">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            우선순위: {PRIORITY_LABEL_KO[(task.priority ?? 'medium') as Priority]}
                        </p>
                    </>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500">
                    생성일: {new Date(task.createdAt).toLocaleString('ko-KR')}
                </p>

                {!isEditing && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        <button onClick={() => onChangeStatus(task.id, 'todo')} className="task-btn">
                            할 일
                        </button>
                        <button onClick={() => onChangeStatus(task.id, 'in-progress')} className="task-btn">
                            진행 중
                        </button>
                        <button onClick={() => onChangeStatus(task.id, 'done')} className="task-btn">
                            완료
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="text-xs text-emerald-400 hover:text-emerald-300">
                            저장
                        </button>
                        <button onClick={handleCancel} className="text-xs text-slate-500 hover:text-slate-300">
                            취소
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={handleStartEdit} className="text-xs text-slate-400 hover:text-slate-200">
                            수정
                        </button>
                        <button onClick={() => onDelete(task.id)} className="text-xs text-slate-500 hover:text-red-400">
                            삭제
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}
