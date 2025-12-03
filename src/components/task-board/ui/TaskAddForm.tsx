import { useState, type KeyboardEvent } from 'react';
import type { NewTaskInput, Priority } from '../types/task';

interface TaskAddFormProps {
    onAdd: (input: NewTaskInput) => void;
}

export default function TaskAddForm({ onAdd }: TaskAddFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');

    const handleAdd = () => {
        const trimmed = title.trim();
        if (!trimmed) return;

        const tagArray = tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

        onAdd({
            title: trimmed,
            description,
            tags: tagArray,
            priority,
        });

        setTitle('');
        setDescription('');
        setTags('');
        setPriority('medium');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <section className="card mb-8 p-4">
            <h2 className="mb-3 text-base font-semibold md:text-lg">새 작업 추가</h2>
            <div className="space-y-3">
                <input
                    className="input-default"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <textarea
                    className="input-default"
                    placeholder="설명을 입력하세요 (Enter: 추가)"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <input
                    className="input-default"
                    placeholder="태그를 쉼표로 구분해서 입력 (예: 공부, React, 포트폴리오)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <select
                    className="input-default"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                </select>

                <div className="flex justify-between text-xs text-slate-500">
                    <span>Enter로 바로 추가할 수 있어요.</span>
                    <button onClick={handleAdd} className="btn-primary">
                        추가하기
                    </button>
                </div>
            </div>
        </section>
    );
}
