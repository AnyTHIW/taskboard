'use client';

import { useEffect, useMemo, useState } from 'react';

type Status = 'todo' | 'in-progress' | 'done';
type Filter = Status | 'all';
type SortKey = 'createdAtDesc' | 'createdAtAsc' | 'titleAsc' | 'titleDesc' | 'priorityHighFirst' | 'priorityLowFirst';
type Theme = 'light' | 'dark';
type Priority = 'low' | 'medium' | 'high';

interface Task {
    id: number;
    title: string;
    description?: string;
    status: Status;
    createdAt: string;
    tags?: string[];
    priority?: Priority;
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

    const [tags, setTags] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');

    // 수정 중인 태그, 우선순위
    const [editTags, setEditTags] = useState('');
    const [editPriority, setEditPriority] = useState<Priority>('medium');

    // 수정 중인 태스크 id (없으면 null)
    const [editingId, setEditingId] = useState<number | null>(null);

    // 수정용 제목/설명
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // 필터링용 태그
    const [tagFilter, setTagFilter] = useState('');

    // 초기 다크/라이트모드 설정
    useEffect(() => {
        const stored = window.localStorage.getItem('theme');
        const initial: Theme = stored === 'light' || stored === 'dark' ? stored : 'light';

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
            tags: tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
            priority,
        };

        updateTasks((prev) => [newTask, ...prev]);
        setTitle('');
        setDescription('');
        setTags('');
        setPriority('medium');
    };

    const handleChangeStatus = (id: number, status: Status) => {
        updateTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
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
                return titleText.includes(keyword) || descText.includes(keyword);
            });
        }

        if (tagFilter.trim()) {
            const keyword = tagFilter.trim().toLowerCase();
            result = result.filter((task) => task.tags?.some((tag) => tag.toLowerCase().includes(keyword)));
        }

        result.sort((a, b) => {
            if (sortKey === 'createdAtDesc') return +new Date(b.createdAt) - +new Date(a.createdAt);
            if (sortKey === 'createdAtAsc') return +new Date(a.createdAt) - +new Date(b.createdAt);
            if (sortKey === 'titleAsc') return a.title.localeCompare(b.title, 'ko');
            if (sortKey === 'titleDesc') return b.title.localeCompare(a.title, 'ko');
            if (sortKey === 'priorityHighFirst') {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.priority ?? 'medium'] - order[b.priority ?? 'medium'];
            }
            if (sortKey === 'priorityLowFirst') {
                const order = { low: 0, medium: 1, high: 2 };
                return order[a.priority ?? 'medium'] - order[b.priority ?? 'medium'];
            }
            return 0;
        });

        return result;
    }, [tasks, filter, tagFilter, search, sortKey]);

    const totalCount = tasks.length;
    const todoCount = tasks.filter((t) => t.status === 'todo').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
    const doneCount = tasks.filter((t) => t.status === 'done').length;

    const handleKeyDownOnEnter = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask();
        }
    };

    // 수정 시작
    const handleStartEdit = (task: Task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description ?? '');
        setEditTags(task.tags?.join(', ') ?? ''); // ← 쉼표로 합치기
        setEditPriority(task.priority ?? 'medium'); // ← 기본값 medium
    };

    // 수정 저장
    const handleSaveEdit = () => {
        if (editingId === null) return;

        const trimmedTitle = editTitle.trim();
        if (!trimmedTitle) return;

        const parsedTags = editTags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        updateTasks((prev) =>
            prev.map((task) =>
                task.id === editingId
                    ? {
                          ...task,
                          title: trimmedTitle,
                          description: editDescription.trim() || undefined,
                          tags: parsedTags,
                          priority: editPriority,
                      }
                    : task
            )
        );

        setEditingId(null);
        setEditTitle('');
        setEditDescription('');
        setEditTags('');
        setEditPriority('medium');
    };

    // 수정 취소
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
        setEditDescription('');
        setEditTags('');
        setEditPriority('medium');
    };

    // 앱 RETURN
    return (
        <main className="app-root">
            <div className="app-container">
                <header className="app-header">
                    <div>
                        <h1 className="app-header-title">Simple Task Board</h1>
                        <p className="app-header-subtitle">
                            공부, 개인 프로젝트, 취업 준비 작업들을 한 곳에서 관리하는 간단한 작업 보드입니다.
                        </p>
                    </div>

                    {/* <div className="app-header-right"> */}
                    <div className="app-header-right flex flex-col-reverse gap-3 md:flex-row md:items-center">
                        <div className="flex flex-wrap gap-2 text-xs md:text-[13px]">
                            <div className="flex justify-start gap-2">
                                <StatusChip label="전체" count={totalCount} />
                            </div>
                            <div className="flex justify-start gap-2">
                                <StatusChip label="할 일" count={todoCount} />
                                <StatusChip label="진행 중" count={inProgressCount} />
                                <StatusChip label="완료" count={doneCount} />
                            </div>
                        </div>

                        <button onClick={toggleTheme} className="btn-theme-toggle">
                            {theme === 'dark' ? '☀️ 라이트 모드' : '🌙 다크 모드'}
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

                    <div className="mt-2 flex items-center gap-2 text-xs md:mt-0 md:text-sm">
                        <span className="whitespace-nowrap text-slate-400 dark:text-slate-500">정렬:</span>
                        <select
                            className="input-default px-2 py-1 text-xs md:text-sm"
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                        >
                            <option value="createdAtDesc">최신 순</option>
                            <option value="createdAtAsc">오래된 순</option>
                            <option value="titleAsc">제목 오름차순</option>
                            <option value="titleDesc">제목 내림차순</option>
                            <option value="priorityHighFirst">우선순위 높은순</option>
                            <option value="priorityLowFirst">우선순위 낮은순</option>
                        </select>
                    </div>
                </section>

                {/* 새 작업 추가 */}
                <section className="card mb-8 p-4">
                    <h2 className="mb-3 text-base font-semibold md:text-lg">새 작업 추가</h2>
                    <div className="space-y-3">
                        <input
                            className="input-default"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDownOnEnter}
                        />
                        <textarea
                            className="input-default"
                            placeholder="설명을 입력하세요 (Enter: 추가)"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDownOnEnter}
                        />

                        {/* 태그 입력 */}
                        <input
                            className="input-default"
                            placeholder="태그를 쉼표로 구분해서 입력 (예: 공부, React, 포트폴리오)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            onKeyDown={handleKeyDownOnEnter}
                        />

                        {/* 우선순위 선택 */}
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
                            <button onClick={handleAddTask} className="btn-primary">
                                추가하기
                            </button>
                        </div>
                    </div>
                </section>

                {/* 필터 */}
                <section className="mb-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">상태 필터:</span>
                        <FilterButton
                            label="전체"
                            active={filter === 'all'}
                            onClick={() => {
                                handleCancelEdit();
                                setFilter('all');
                            }}
                        />
                        <FilterButton
                            label="할 일"
                            active={filter === 'todo'}
                            onClick={() => {
                                handleCancelEdit();
                                setFilter('todo');
                            }}
                        />
                        <FilterButton
                            label="진행 중"
                            active={filter === 'in-progress'}
                            onClick={() => {
                                handleCancelEdit();
                                setFilter('in-progress');
                            }}
                        />
                        <FilterButton
                            label="완료"
                            active={filter === 'done'}
                            onClick={() => {
                                handleCancelEdit();
                                setFilter('done');
                            }}
                        />
                        <span className="ml-auto text-xs text-slate-400">
                            표시 {filteredAndSortedTasks.length}개 / 전체 {totalCount}개
                        </span>
                    </div>

                    {/* 태그 필터 */}
                    <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">태그 필터:</span>
                        <input
                            className="input-default"
                            placeholder="태그로 필터 (예: React)"
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                        />
                    </div>
                </section>

                {/* 리스트 */}
                <section className="space-y-3">
                    {filteredAndSortedTasks.length === 0 ? (
                        <div className="empty-state">
                            조건에 해당하는 작업이 없습니다.
                            <br />
                            위에서 새 작업을 추가하거나, 검색/필터를 확인해보세요.
                        </div>
                    ) : (
                        filteredAndSortedTasks.map((task) => {
                            const isEditing = task.id === editingId;

                            return (
                                <article key={task.id} className="task-card">
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
                                                {/* 평상시 표시 */}
                                                <h3 className="font-semibold">{task.title}</h3>
                                                {task.description && (
                                                    <p className="text-slate-700 dark:text-slate-300">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {task.tags?.map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    우선순위:{' '}
                                                    {task.priority === 'high'
                                                        ? '🔥 높음'
                                                        : task.priority === 'medium'
                                                          ? '⚡ 보통'
                                                          : '🌱 낮음'}
                                                </p>
                                            </>
                                        )}{' '}
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            생성일: {new Date(task.createdAt).toLocaleString('ko-KR')}
                                        </p>
                                        {!isEditing && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleChangeStatus(task.id, 'todo')}
                                                    className="task-btn"
                                                >
                                                    할 일
                                                </button>
                                                <button
                                                    onClick={() => handleChangeStatus(task.id, 'in-progress')}
                                                    className="task-btn"
                                                >
                                                    진행 중
                                                </button>
                                                <button
                                                    onClick={() => handleChangeStatus(task.id, 'done')}
                                                    className="task-btn"
                                                >
                                                    완료
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="text-xs text-emerald-400 hover:text-emerald-300"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-xs text-slate-500 hover:text-slate-300"
                                                >
                                                    취소
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleStartEdit(task)}
                                                    className="text-xs text-slate-400 hover:text-slate-200"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="text-xs text-slate-500 hover:text-red-400"
                                                >
                                                    삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>
            </div>
        </main>
    );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`btn-filter ${active ? 'btn-filter-active' : 'btn-filter-inactive'}`}>
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
