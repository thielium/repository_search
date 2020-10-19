import React, { useCallback } from 'react';
import { useRepositoryQuery } from '../hooks/useRepositoryQuery';
import { NoResults } from './NoResults';
import { PagingInfoDisplay } from './PagingInfoDisplay';
import { QueryBox } from './QueryBox';
import { ResultsLoading } from './ResultsLoading';
import { Table } from './Table';
import { WelcomeMessage } from './WelcomeMessage';

/**
 * Main display for the repository search appliaction.
 */
export const App: React.FC = () => {
  const { rows, isFetchingRepos, updateQuery, updatePage, pagingInfo } = useRepositoryQuery();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ currentTarget: { value } }) => {
      updateQuery(value);
    },
    [updateQuery],
  );

  return (
    <>
      <QueryBox onChange={onChange} value={pagingInfo.query} />
      {pagingInfo.totalCount > 0 && (
        <PagingInfoDisplay
          page={pagingInfo.page}
          totalCount={pagingInfo.totalCount}
          updatePage={updatePage}
        />
      )}
      {isFetchingRepos && !rows.length ? (
        <ResultsLoading />
      ) : !rows.length && !!pagingInfo.query ? (
        <NoResults />
      ) : !rows.length && !pagingInfo.query ? (
        <WelcomeMessage />
      ) : (
        <Table rows={rows} />
      )}
    </>
  );
};
