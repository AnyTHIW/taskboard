import dynamic from "next/dynamic";

const TaskBoard = dynamic(
    () => import("@@@/components/task-board/TaskBoard"),
    { ssr: false }
);

export default function HomePage() {
    return <TaskBoard />;
}
