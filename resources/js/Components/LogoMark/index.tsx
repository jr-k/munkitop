type LogoMarkProps = {
    size?: number;
    color?: string;
    logoUrl?: string | null;
};

export default function LogoMark({ size = 34, color = '#111827', logoUrl = null }: LogoMarkProps) {
    if (logoUrl) {
        return (
            <span
                aria-hidden="true"
                style={{
                    borderRadius: Math.round(size * 0.28),
                    display: 'inline-block',
                    flex: '0 0 auto',
                    height: size,
                    overflow: 'hidden',
                    width: size,
                }}
            >
                <img
                    alt=""
                    src={logoUrl}
                    style={{
                        display: 'block',
                        height: '100%',
                        objectFit: 'contain',
                        width: '100%',
                    }}
                />
            </span>
        );
    }

    return (
        <svg aria-hidden="true" height={size} viewBox="0 0 64 64" width={size}>
            <rect fill={color} height="64" rx="18" width="64" />
            <g fill="#ffffff" transform="translate(-3.2 0)">
                <path d="M39.6 9.1c-2.8.4-5.9 2.3-7.6 4.8-1.6 2.3-2.3 5.1-1.9 7.6 2.8.1 5.6-1.5 7.6-3.7 1.7-2.1 2.8-5.3 1.9-8.7Z" />
                <path d="M46.7 34.7c0-6 4.8-8.9 5.1-9.1-2.8-4.1-7.1-4.8-8.5-4.8-3.6-.4-6.9 2.1-8.7 2.1-1.9 0-4.5-2.1-7.5-2-3.9 0-7.5 2.3-9.5 5.7-4 7.1-1.1 17.5 2.8 23.2 1.9 2.8 4.1 5.7 7.2 5.6 2.9-.1 4-1.9 7.5-1.9s4.5 1.9 7.5 1.7c3.2 0 5.1-2.7 6.9-5.5 1.5-2 2.5-4.3 3.2-6.7-4.1-1.6-6-4.8-6-8.3Z" />
            </g>
        </svg>
    );
}
