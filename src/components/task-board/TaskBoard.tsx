'use client';

import { useEffect, useMemo, useState } from 'react';

type Status = 'todo' | 'in-progress' | 'done';
type Filter = Status | 'all';
type SortKey = 'createdAtDesc' | 'createdAtAsc' | 'titleAsc' | 'titleDesc';
type Theme = 'light' | 'dark';

interface Task {
    id: number;
    title: string;
    description?: string;
    status: Status;
    createdAt: string;
}

const initialTasks: Task[] = [
    {
        id: 1,
        title: '예시1 포트폴리오 기획 정리',
        description: '어떤 웹앱을 만들지 간단히 적어보기',
        status: 'todo',
        createdAt: new Date().toISOString(),
    },
    {
        id: 2,
        title: '예시2 Task Board 기본 UI 만들기',
        description: '리스트, 추가 폼, 필터 버튼',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
    },
    {
        id: 3,
        title: '예시3 Vercel 배포 테스트',
        description: '배포 경험까지 만들어두기',
        status: 'done',
        createdAt: new Date().toISOString(),
    },
];

export default function TaskBoard() {
    const [theme, setTheme] = useState<Theme>('light');

    const [tasks, setTasks] = useState<Task[]>(() => {
        const stored = window.localStorage.getItem('taskData');
        if (!stored) return initialTasks;

        try {
            const parsed = JSON.parse(stored) as Task[];
            return Array.isArray(parsed) ? parsed : initialTasks;
        } catch {
            return initialTasks;
        }
    });

    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('createdAtDesc');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // 초기 테마 설정
    useEffect(() => {
        const stored = window.localStorage.getItem('theme');
        const initial: Theme =
            stored === 'light' || stored === 'dark' ? stored : 'light';

        setTheme(initial);
        document.documentElement.classList.toggle('dark', initial === 'dark');
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';
            document.documentElement.classList.toggle('dark', next === 'dark');
            window.localStorage.setItem('theme', next);
            return next;
        });
    };

    const updateTasks = (updater: (prev: Task[]) => Task[]) => {
        setTasks((prev) => {
            const next = updater(prev);
            window.localStorage.setItem('taskData', JSON.stringify(next));
            return next;
        });
    };

    const handleAddTask = () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        const newTask: Task = {
            id: Date.now(),
            title: trimmedTitle,
            description: description.trim() || undefined,
            status: 'todo',
            createdAt: new Date().toISOString(),
        };

        updateTasks((prev) => [newTask, ...prev]);
        setTitle('');
        setDescription('');
    };

    const handleChangeStatus = (id: number, status: Status) => {
        updateTasks((prev) =>
            prev.map((task) => (task.id === id ? { ...task, status } : task))
        );
    };

    const handleDeleteTask = (id: number) => {
        updateTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const filteredAndSortedTasks = useMemo(() => {
        let result = [...tasks];

        if (filter !== 'all') {
            result = result.filter((task) => task.status === filter);
        }

        const keyword = search.trim().toLowerCase();
        if (keyword) {
            result = result.filter((task) => {
                const titleText = task.title.toLowerCase();
                const descText = (task.description || '').toLowerCase();
                return (
                    titleText.includes(keyword) || descText.includes(keyword)
                );
            });
        }

        result.sort((a, b) => {
            if (sortKey === 'createdAtDesc')
                return +new Date(b.createdAt) - +new Date(a.createdAt);
            if (sortKey === 'createdAtAsc')
                return +new Date(a.createdAt) - +new Date(b.createdAt);
            if (sortKey === 'titleAsc')
                return a.title.localeCompare(b.title, 'ko');
            if (sortKey === 'titleDesc')
                return b.title.localeCompare(a.title, 'ko');
            return 0;
        });

        return result;
    }, [tasks, filter, search, sortKey]);

    const totalCount = tasks.length;
    const todoCount = tasks.filter((t) => t.status === 'todo').length;
    const inProgressCount = tasks.filter(
        (t) => t.status === 'in-progress'
    ).length;
    const doneCount = tasks.filter((t) => t.status === 'done').length;

    const handleKeyDownOnEnter = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask();
        }
    };

    return (
        <main className="app-root">
            <div className="app-container">
                <header className="app-header">
                    <div>
                        <h1 className="app-header-title">Simple Task Board</h1>
                        <p className="app-header-subtitle">
                            공부, 개인 프로젝트, 취업 준비 작업들을 한 곳에서
                            관리하는 간단한 작업 보드입니다.
                        </p>
                    </div>

                    <div className="app-header-right">
                        <div className="flex flex-wrap gap-2 text-xs md:text-[13px]">
                            <div className="flex justify-start gap-2">
                                <StatusChip label="전체" count={totalCount} />
                            </div>
                            <div className="flex justify-start gap-2">
                                <StatusChip label="할 일" count={todoCount} />
                                <StatusChip
                                    label="진행 중"
                                    count={inProgressCount}
                                />
                                <StatusChip label="완료" count={doneCount} />
                            </div>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="btn-theme-toggle"
                        >
                            {theme === 'dark'
                                ? '☀️ 라이트 모드'
                                : '🌙 다크 모드'}
                        </button>
                    </div>
                </header>

                {/* 검색 & 정렬 */}
                <section className="card card-toolbar">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                🔍
                            </span>
                            <input
                                className="input-search"
                                placeholder="작업 제목 또는 설명으로 검색하기"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs md:text-sm">
                        <span className="whitespace-nowrap text-slate-400 dark:text-slate-500">
                            정렬:
                        </span>
                        <select
                            className="input-default px-2 py-1 text-xs md:text-sm"
                            value={sortKey}
                            onChange={(e) =>
                                setSortKey(e.target.value as SortKey)
                            }
                        >
                            <option value="createdAtDesc">최신 순</option>
                            <option value="createdAtAsc">오래된 순</option>
                            <option value="titleAsc">제목 오름차순</option>
                            <option value="titleDesc">제목 내림차순</option>
                        </select>
                    </div>
                </section>

                {/* 새 작업 추가 */}
                <section className="card card-body mb-8">
                    <h2 className="mb-3 text-base font-semibold md:text-lg">
                        새 작업 추가
                    </h2>
                    <div className="space-y-3">
                        <input
                            className="input-default"
                            placeholder="제목을 입력하세요 (예: 포트폴리오용 프로젝트 기획)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDownOnEnter}
                        />
                        <textarea
                            className="input-default"
                            placeholder="설명을 선택적으로 입력하세요 (Enter: 추가, Shift+Enter: 줄바꿈)"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDownOnEnter}
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Enter로 바로 추가할 수 있어요.</span>
                            <button
                                onClick={handleAddTask}
                                className="btn-primary"
                            >
                                추가하기
                            </button>
                        </div>
                    </div>
                </section>

                {/* 필터 */}
                <section className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        상태 필터:
                    </span>
                    <FilterButton
                        label="전체"
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    />
                    <FilterButton
                        label="할 일"
                        active={filter === 'todo'}
                        onClick={() => setFilter('todo')}
                    />
                    <FilterButton
                        label="진행 중"
                        active={filter === 'in-progress'}
                        onClick={() => setFilter('in-progress')}
                    />
                    <FilterButton
                        label="완료"
                        active={filter === 'done'}
                        onClick={() => setFilter('done')}
                    />
                    <span className="ml-auto text-xs text-slate-400">
                        표시 {filteredAndSortedTasks.length}개 / 전체{' '}
                        {totalCount}개
                    </span>
                </section>

                {/* 리스트 */}
                <section className="space-y-3">
                    {filteredAndSortedTasks.length === 0 ? (
                        <div className="empty-state">
                            조건에 해당하는 작업이 없습니다.
                            <br />
                            위에서 새 작업을 추가하거나, 검색/필터를
                            확인해보세요.
                        </div>
                    ) : (
                        filteredAndSortedTasks.map((task) => (
                            <article key={task.id} className="task-card">
                                <div className="mt-1">
                                    <StatusBadge status={task.status} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold">
                                        {task.title}
                                    </h3>
                                    {task.description && (
                                        <p className="text-slate-700 dark:text-slate-300">
                                            {task.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        생성일:{' '}
                                        {new Date(
                                            task.createdAt
                                        ).toLocaleString('ko-KR')}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                handleChangeStatus(
                                                    task.id,
                                                    'todo'
                                                )
                                            }
                                            className="task-btn"
                                        >
                                            할 일
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleChangeStatus(
                                                    task.id,
                                                    'in-progress'
                                                )
                                            }
                                            className="task-btn"
                                        >
                                            진행 중
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleChangeStatus(
                                                    task.id,
                                                    'done'
                                                )
                                            }
                                            className="task-btn"
                                        >
                                            완료
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="self-start text-xs text-slate-500 hover:text-red-400"
                                >
                                    삭제
                                </button>
                            </article>
                        ))
                    )}
                </section>
            </div>
        </main>
    );
}

function FilterButton({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`btn-filter ${active ? 'btn-filter-active' : 'btn-filter-inactive'}`}
        >
            {label}
        </button>
    );
}

function StatusBadge({ status }: { status: Status }) {
    const labelMap: Record<Status, string> = {
        todo: '할 일',
        'in-progress': '진행 중',
        done: '완료',
    };

    const styleMap: Record<Status, string> = {
        todo: 'status-badge status-badge-todo',
        'in-progress': 'status-badge status-badge-in-progress',
        done: 'status-badge status-badge-done',
    };

    return <span className={styleMap[status]}>{labelMap[status]}</span>;
}

function StatusChip({ label, count }: { label: string; count: number }) {
    return (
        <span className="status-chip">
            <span>{label}</span>
            <span className="status-chip-count">{count}</span>
        </span>
    );
}
