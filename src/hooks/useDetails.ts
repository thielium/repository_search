import axios from 'axios';
import uniq from 'lodash/uniq';
import { useCallback, useState } from 'react';
import template from 'url-template';
import { Commit, Fork, Owner } from '../common/Types';
import { NO_BIO_PROVIDED, UNKNOWN_AUTHOR } from '../common/Constants';

export interface UseDetailsArgs {
  commitsUrl: string;
  forksUrl: string;
}

export interface UseDetailsValues {
  isFetchingDetails: boolean;
  fetchDetails: () => void;
}

const extractCommitters = (commits: Commit[]) =>
  uniq(
    commits.slice(0, 3).map((committer: Commit) => committer?.author?.login ?? UNKNOWN_AUTHOR),
  ).join(', ');

const extractBio = (x: Owner) => x.bio || NO_BIO_PROVIDED;

/**
 * Hook for retrieving, and managing the state, surrounding fetching details for
 * a repository row.
 */
export const useDetails: ({ commitsUrl, forksUrl }: UseDetailsArgs) => UseDetailsValues = ({
  commitsUrl,
  forksUrl,
}) => {
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const fetchDetails = useCallback(async () => {
    setIsFetchingDetails(true);
    try {
      const commitsUrlExpanded = template.parse(commitsUrl).expand({});
      const forksUrlExpanded = template.parse(forksUrl).expand({});
      const [{ data: committers }, { data: forks }] = await Promise.all([
        axios.get<Commit[]>(commitsUrlExpanded),
        axios.get<Fork[]>(forksUrlExpanded),
      ]);
      const { data: owner } = await axios.get(forks[0].owner.url);
      const content = `
          Last three commits by: ${extractCommitters(committers)}
          Last fork: ${forks && forks[0] && forks[0].owner.login}
          Last Bio: ${extractBio(owner)}
        `;
      window.alert(content);
    } catch (e) {
      alert('There was an error getting committer information');
      window.console.error(e);
    } finally {
      setIsFetchingDetails(false);
    }
  }, [commitsUrl, forksUrl]);

  return { fetchDetails, isFetchingDetails };
};
