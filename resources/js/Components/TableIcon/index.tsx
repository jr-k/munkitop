type TableIconProps = {
    name: 'delete' | 'download' | 'edit' | 'manifest';
};

export default function TableIcon({ name }: TableIconProps) {
    const paths = {
        delete: (
            <>
                <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z" />
                <path d="M6 9h12l-1 12H7L6 9Z" />
                <path d="M10 12v6M14 12v6" />
            </>
        ),
        download: (
            <>
                <path d="M12 3v11" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 19h14" />
            </>
        ),
        edit: (
            <>
                <path d="M4 20h4l11-11-4-4L4 16v4Z" />
                <path d="m13 7 4 4" />
            </>
        ),
        manifest: (
            <>
                <path d="M7 3h7l4 4v14H7V3Z" />
                <path d="M14 3v5h4" />
                <path d="M10 12h5M10 16h5" />
            </>
        ),
    };

    return (
        <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                {paths[name]}
            </g>
        </svg>
    );
}
