type LogoMarkProps = {
    size?: number;
};

export default function LogoMark({ size = 34 }: LogoMarkProps) {
    return (
        <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 48 48" width={size}>
            <rect fill="#111827" height="48" rx="14" width="48" />
            <path
                d="M29.7 6.8c-2.1.3-4.4 1.7-5.7 3.6-1.2 1.7-1.7 3.8-1.4 5.7 2.1.1 4.2-1.1 5.7-2.8 1.3-1.6 2.1-4 1.4-6.5Z"
                fill="#ffffff"
            />
            <path
                d="M35 26c0-4.5 3.6-6.7 3.8-6.8-2.1-3.1-5.3-3.6-6.4-3.6-2.7-.3-5.2 1.6-6.5 1.6-1.4 0-3.4-1.6-5.6-1.5-2.9 0-5.6 1.7-7.1 4.3-3 5.3-.8 13.1 2.1 17.4 1.4 2.1 3.1 4.3 5.4 4.2 2.2-.1 3-1.4 5.6-1.4s3.4 1.4 5.6 1.3c2.4 0 3.8-2 5.2-4.1 1.1-1.5 1.9-3.2 2.4-5-3.1-1.2-4.5-3.6-4.5-6.4Z"
                fill="#ffffff"
            />
        </svg>
    );
}
