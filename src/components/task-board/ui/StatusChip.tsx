interface StatusChipProps {
    label: string;
    count: number;
}

export default function StatusChip({ label, count }: StatusChipProps) {
    return (
        <span className="status-chip">
            <span>{label}</span>
            <span className="status-chip-count">{count}</span>
        </span>
    );
}
