import axios from 'axios';
import debounce from 'lodash/debounce';
import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  DEBOUNCE_INTERVAL,
  GITHUB_REPO_BASE_URL,
  PAGE_SIZE,
  DEFAULT_PAGE,
  DEFAULT_QUERY,
  DEFAULT_TOTAL_COUNT,
} from '../common/Constants';
import { RepositoryRow, RepositorySearchResponse } from '../common/Types';

interface PagingInfo {
  page: number;
  totalCount: number;
  query: string;
}

export interface UseRepositoryQueryValues {
  updateQuery: (query: string) => void;
  updatePage: (query: number) => void;
  pagingInfo: PagingInfo;
  rows: RepositoryRow[];
  isFetchingRepos: boolean;
}

/**
 * Hook which exposes functions for retrieving repository data.
 */
export const useRepositoryQuery: () => UseRepositoryQueryValues = () => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [totalCount, setTotalCount] = useState(DEFAULT_TOTAL_COUNT);
  const [rows, setRows] = useState<RepositoryRow[]>([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);

  const cancelSourceRef = useRef(axios.CancelToken.source());

  const updateData = useCallback(
    async ({ query: requestedQuery, page: requestedPage }: { query: string; page: number }) => {
      try {
        if (requestedQuery === '') {
          setRows([]);
          setPage(DEFAULT_PAGE);
          setQuery(DEFAULT_QUERY);
          setTotalCount(DEFAULT_TOTAL_COUNT);
          return;
        }

        const repoUrl = new URL(GITHUB_REPO_BASE_URL);
        repoUrl.searchParams.set('page', `${requestedPage}`);
        repoUrl.searchParams.set('per_page', `${PAGE_SIZE}`);
        repoUrl.searchParams.set('q', requestedQuery);

        // Ensure we are only ever listening to one request at a time, so we don't
        // run the risk of an old request updating our state.
        cancelSourceRef.current.cancel();
        cancelSourceRef.current = axios.CancelToken.source();
        const cancelToken = cancelSourceRef.current.token;

        const { data } = await axios.get<RepositorySearchResponse>(repoUrl.href, { cancelToken });

        setRows(data.items);
        setTotalCount(data.total_count);
      } catch (e) {
        if (e && e.constructor && e.constructor.name === 'Cancel') {
          // We just canceled the request, no need to take further action
          return;
        }
        window.console.error(e);
        alert('There was an error retrieving repositories. Please try again later.');
      } finally {
        setIsFetchingRepos(false);
      }
    },
    [],
  );

  const debouncedFetchData = useCallback(debounce(updateData, DEBOUNCE_INTERVAL), [updateData]);

  useEffect(() => {
    setIsFetchingRepos(true);
    debouncedFetchData({ query, page });
  }, [query, page, debouncedFetchData]);

  const pagingInfo = useMemo<PagingInfo>(() => ({ page, query, totalCount }), [
    page,
    query,
    totalCount,
  ]);

  return { updateQuery: setQuery, updatePage: setPage, pagingInfo, rows, isFetchingRepos };
};
