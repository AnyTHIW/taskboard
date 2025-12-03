interface FilterButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export default function FilterButton({ label, active, onClick }: FilterButtonProps) {
    return (
        <button onClick={onClick} className={`btn-filter ${active ? 'btn-filter-active' : 'btn-filter-inactive'}`}>
            {label}
        </button>
    );
}
