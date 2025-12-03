'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTasks } from './hooks/useTasks';
import type { Filter, SortKey, Theme, Status } from './types/task';
import { filterTasks } from './utils/filtering';
import { sortTasks } from './utils/sorting';
import TaskAddForm from './ui/TaskAddForm';
import TaskList from './ui/TaskList';
import StatusChip from './ui/StatusChip';
import FilterButton from './ui/FilterButton';

export default function TaskBoard() {
    const { tasks, addTask, updateTask, deleteTask, changeStatus } = useTasks();

    const [theme, setTheme] = useState<Theme>('light');
    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('createdAtDesc');
    const [tagFilter, setTagFilter] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stored = window.localStorage.getItem('theme');
        const initial: Theme = stored === 'light' || stored === 'dark' ? stored : 'light';

        setTheme(initial);
        document.documentElement.classList.toggle('dark', initial === 'dark');
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next: Theme = prev === 'dark' ? 'light' : 'dark';

            document.documentElement.classList.toggle('dark', next === 'dark');
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('theme', next);
            }

            return next;
        });
    };

    const filteredAndSortedTasks = useMemo(() => {
        const filtered = filterTasks(tasks, {
            statusFilter: filter,
            search,
            tagFilter,
        });

        return sortTasks(filtered, sortKey);
    }, [tasks, filter, search, tagFilter, sortKey]);

    const totalCount = tasks.length;
    const todoCount = tasks.filter((t) => t.status === 'todo').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
    const doneCount = tasks.filter((t) => t.status === 'done').length;

    const handleFilterClick = (nextFilter: Filter) => {
        setFilter(nextFilter);
    };

    const handleChangeStatus = (id: number, status: Status) => {
        changeStatus(id, status);
    };

    return (
        <main className="app-root">
            <div className="app-container">
                <header className="app-header relative">
                    <div className="flex w-full flex-col gap-3 md:gap-4">
                        <div>
                            <h1 className="app-header-title">Simple Task Board</h1>
                            <p className="app-header-subtitle">
                                공부, 개인 프로젝트, 취업 준비 작업들을 한 곳에서 관리하는 간단한 작업 보드입니다.
                            </p>
                        </div>

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
                    </div>

                    <div className="absolute right-0 top-0 flex flex-col items-center gap-1">
                        <div className="light-source" />
                        <button onClick={toggleTheme} className="btn-theme-toggle">
                            {theme === 'dark' ? '☀️' : '🌙'}
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
                <TaskAddForm onAdd={addTask} />

                {/* 필터 */}
                <section className="mb-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">상태 필터:</span>

                        <FilterButton label="전체" active={filter === 'all'} onClick={() => handleFilterClick('all')} />
                        <FilterButton
                            label="할 일"
                            active={filter === 'todo'}
                            onClick={() => handleFilterClick('todo')}
                        />
                        <FilterButton
                            label="진행 중"
                            active={filter === 'in-progress'}
                            onClick={() => handleFilterClick('in-progress')}
                        />
                        <FilterButton
                            label="완료"
                            active={filter === 'done'}
                            onClick={() => handleFilterClick('done')}
                        />

                        <span className="ml-auto text-xs text-slate-400">
                            표시 {filteredAndSortedTasks.length}개 / 전체 {totalCount}개
                        </span>
                    </div>

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
                <TaskList
                    tasks={filteredAndSortedTasks}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onChangeStatus={handleChangeStatus}
                />
            </div>
        </main>
    );
}
