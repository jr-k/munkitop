import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import * as S from './styled';

export const PAGE_SIZE_OPTIONS = [30, 60, 150, 500, 1000] as const;
const DEFAULT_PAGE_SIZE = 60;
const PAGINATION_VISIBLE_AFTER = PAGE_SIZE_OPTIONS[0];

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type PaginationControlsProps = {
    page: number;
    pageCount: number;
    pageSize: PageSize;
    total: number;
    from: number;
    to: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: PageSize) => void;
};

type PaginationOptions = {
    key?: string;
    syncUrl?: boolean;
};

function readUrlPage(param: string): number {
    if (typeof window === 'undefined') {
        return 1;
    }

    const page = Number(new URLSearchParams(window.location.search).get(param));

    return Number.isInteger(page) && page > 0 ? page : 1;
}

function readUrlPageSize(param: string): PageSize {
    if (typeof window === 'undefined') {
        return DEFAULT_PAGE_SIZE;
    }

    const pageSize = Number(new URLSearchParams(window.location.search).get(param));

    return (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
        ? pageSize as PageSize
        : DEFAULT_PAGE_SIZE;
}

export function usePagination<T>(items: T[], { key, syncUrl = true }: PaginationOptions = {}) {
    const pageParam = key ? `${key}_page` : 'page';
    const limitParam = key ? `${key}_limit` : 'limit';
    const resetAfterMount = useRef(false);
    const [page, setPage] = useState(() => readUrlPage(pageParam));
    const [pageSize, setPageSize] = useState<PageSize>(() => readUrlPageSize(limitParam));
    const shouldPaginate = items.length > PAGINATION_VISIBLE_AFTER;
    const pageCount = shouldPaginate ? Math.max(1, Math.ceil(items.length / pageSize)) : 1;
    const boundedPage = Math.min(page, pageCount);
    const start = shouldPaginate ? (boundedPage - 1) * pageSize : 0;
    const paginatedItems = useMemo(
        () => (shouldPaginate ? items.slice(start, start + pageSize) : items),
        [items, pageSize, shouldPaginate, start],
    );

    useEffect(() => {
        if (!resetAfterMount.current) {
            resetAfterMount.current = true;
            return;
        }

        setPage(1);
    }, [items.length, pageSize]);

    useEffect(() => {
        if (page > pageCount) {
            setPage(pageCount);
        }
    }, [page, pageCount]);

    useEffect(() => {
        if (!syncUrl || typeof window === 'undefined' || !shouldPaginate) {
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set(pageParam, String(boundedPage));
        url.searchParams.set(limitParam, String(pageSize));
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }, [boundedPage, limitParam, pageParam, pageSize, shouldPaginate, syncUrl]);

    useEffect(() => {
        if (!syncUrl || typeof window === 'undefined') {
            return;
        }

        function syncFromUrl() {
            setPage(readUrlPage(pageParam));
            setPageSize(readUrlPageSize(limitParam));
        }

        window.addEventListener('popstate', syncFromUrl);

        return () => window.removeEventListener('popstate', syncFromUrl);
    }, [limitParam, pageParam, syncUrl]);

    return {
        page: boundedPage,
        pageCount,
        pageSize,
        total: items.length,
        from: items.length === 0 ? 0 : start + 1,
        to: shouldPaginate ? Math.min(start + pageSize, items.length) : items.length,
        items: paginatedItems,
        setPage,
        setPageSize,
        shouldPaginate,
    };
}

export default function PaginationControls({
    page,
    pageCount,
    pageSize,
    total,
    from,
    to,
    onPageChange,
    onPageSizeChange,
}: PaginationControlsProps) {
    const { t } = useI18n();

    if (total <= PAGINATION_VISIBLE_AFTER) {
        return null;
    }

    return (
        <S.PaginationBar>
            <S.Meta>{t('pagination.range', { from, to, total })}</S.Meta>
            <S.Controls>
                <S.LimitLabel>
                    {t('pagination.limit')}
                    <S.Select
                        value={pageSize}
                        onChange={(event) => onPageSizeChange(Number(event.target.value) as PageSize)}
                    >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </S.Select>
                </S.LimitLabel>
                <S.PageButton
                    type="button"
                    disabled={page <= 1}
                    aria-label={t('pagination.previous')}
                    title={t('pagination.previous')}
                    onClick={() => onPageChange(page - 1)}
                >
                    <span aria-hidden="true">‹</span>
                </S.PageButton>
                <S.Meta>{t('pagination.page', { page, pageCount })}</S.Meta>
                <S.PageButton
                    type="button"
                    disabled={page >= pageCount}
                    aria-label={t('pagination.next')}
                    title={t('pagination.next')}
                    onClick={() => onPageChange(page + 1)}
                >
                    <span aria-hidden="true">›</span>
                </S.PageButton>
            </S.Controls>
        </S.PaginationBar>
    );
}
