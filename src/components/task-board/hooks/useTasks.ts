'use client';

import { useState } from 'react';
import type { NewTaskInput, Task, UpdateTaskInput, Status } from '../types/task';
import { loadTasks, saveTasks } from '../utils/storage';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

    const setAndSave = (updater: (prev: Task[]) => Task[]) => {
        setTasks((prev) => {
            const next = updater(prev);
            saveTasks(next);
            return next;
        });
    };

    const addTask = (input: NewTaskInput) => {
        const trimmedTitle = input.title.trim();
        if (!trimmedTitle) return;

        const newTask: Task = {
            id: Date.now(),
            title: trimmedTitle,
            description: input.description?.trim() || undefined,
            status: 'todo',
            createdAt: new Date().toISOString(),
            tags: input.tags?.filter(Boolean),
            priority: input.priority ?? 'medium',
        };

        setAndSave((prev) => [newTask, ...prev]);
    };

    const updateTask = (input: UpdateTaskInput) => {
        const { id, ...rest } = input;

        setAndSave((prev) =>
            prev.map((task) =>
                task.id === id
                    ? {
                          ...task,
                          ...(rest.title !== undefined && { title: rest.title }),
                          ...(rest.description !== undefined && {
                              description: rest.description || undefined,
                          }),
                          ...(rest.tags !== undefined && { tags: rest.tags }),
                          ...(rest.priority !== undefined && { priority: rest.priority }),
                          ...(rest.status !== undefined && { status: rest.status as Status }),
                      }
                    : task
            )
        );
    };

    const deleteTask = (id: number) => {
        setAndSave((prev) => prev.filter((task) => task.id !== id));
    };

    const changeStatus = (id: number, status: Status) => {
        updateTask({ id, status });
    };

    return {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        changeStatus,
    };
}
