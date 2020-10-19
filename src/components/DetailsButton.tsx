import React from 'react';
import { useDetails } from '../hooks/useDetails';

interface DetailsButtonProps {
  commitsUrl: string;
  forksUrl: string;
}

/**
 * Button for retrieving and displaying details on a repository row.
 */
export const DetailsButton: React.FC<DetailsButtonProps> = ({ commitsUrl, forksUrl }) => {
  const { isFetchingDetails, fetchDetails } = useDetails({ commitsUrl, forksUrl });

  return (
    <button type="button" disabled={isFetchingDetails} onClick={fetchDetails}>
      Details
    </button>
  );
};
