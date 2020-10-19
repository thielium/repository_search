import React, { useCallback } from 'react';
import { PAGE_SIZE } from '../common/Constants';

interface PaginingInfoDisplayProps {
  page: number;
  updatePage: (newValue: number) => void;
  totalCount: number;
}

/**
 * Displays and updates the paging info.
 */
export const PagingInfoDisplay: React.FC<PaginingInfoDisplayProps> = ({
  page,
  updatePage,
  totalCount,
}) => {
  const decrementPage = useCallback(() => updatePage(page - 1), [updatePage, page]);
  const incrementPage = useCallback(() => updatePage(page + 1), [updatePage, page]);

  const numberPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasMore = page < numberPages;

  return (
    <>
      <button type="button" disabled={page <= 1} onClick={decrementPage}>
        Previous Page
      </button>
      {page}
      <button type="button" disabled={!hasMore} onClick={incrementPage}>
        Next Page
      </button>
      of {numberPages}
    </>
  );
};
