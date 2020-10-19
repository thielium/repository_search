import React from 'react';
import { RepositoryRow } from '../common/Types';
import { DetailsButton } from './DetailsButton';

interface TableProps {
  rows: RepositoryRow[];
}

/**
 * Table of query results.
 */
export const Table: React.FC<TableProps> = ({ rows }) => (
  <table>
    <thead>
      <tr>
        <td>Name</td>
        <td>Owner</td>
        <td>Stars</td>
        <td>Details</td>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row.node_id}>
          <td>
            <a href={row.html_url}>{row.name}</a>
          </td>
          <td>{row.owner.login}</td>
          <td>{row.stargazers_count}</td>

          <td>
            <DetailsButton commitsUrl={row.commits_url} forksUrl={row.forks_url} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
