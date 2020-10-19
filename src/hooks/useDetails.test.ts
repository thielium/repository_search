import { act, HookResult, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import { Commit, Fork, Owner } from '../common/Types';
import { useDetails, UseDetailsValues } from './useDetails';

jest.mock('lodash/debounce', () => (_: unknown) => _);
jest.mock('axios');

const commits: Commit[] = [
  {
    author: {
      login: 'alogin',
    },
  },
  {
    author: {
      login: 'alogin',
    },
  },
  {
    author: {
      login: 'anotherlogin',
    },
  },
];

const forks: Fork[] = [
  {
    owner: {
      login: 'anotherlogin',
      url: 'http://anotherlogin.url',
    },
  },
];

const owner: Owner = {
  bio: 'my bio',
};

describe('useDetails', () => {
  const originalAlert = window.alert;
  beforeEach(() => {
    window.alert = jest.fn();
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockReset();
    window.alert = originalAlert;
  });

  it('correctly merges data', async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: commits })
      .mockResolvedValueOnce({ data: forks })
      .mockResolvedValueOnce({ data: owner });

    let result: HookResult<UseDetailsValues> = {} as HookResult<UseDetailsValues>;

    await act(async () => {
      const { result: hookResult } = renderHook(() =>
        useDetails({ commitsUrl: 'http://url1.com', forksUrl: 'http://url2.com' }),
      );
      result = hookResult;
    });

    await act(async () => {
      result.current.fetchDetails();
    });

    expect((window.alert as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "
                Last three commits by: alogin, anotherlogin
                Last fork: anotherlogin
                Last Bio: my bio
              ",
        ],
      ]
    `);
  });

  it('handles fetching state appropriately', async () => {
    let delayedResolve: (
      value?: { data: Commit[] } | PromiseLike<{ data: Commit[] }> | undefined,
    ) => void;
    const delayedPromise = new Promise<{ data: Commit[] }>((resolve) => {
      delayedResolve = resolve;
    });
    (axios.get as jest.Mock)
      .mockResolvedValueOnce(delayedPromise)
      .mockResolvedValueOnce({ data: forks })
      .mockResolvedValueOnce({ data: owner });

    let result: HookResult<UseDetailsValues> = {} as HookResult<UseDetailsValues>;

    await act(async () => {
      const { result: hookResult } = renderHook(() =>
        useDetails({ commitsUrl: 'http://url1.com', forksUrl: 'http://url2.com' }),
      );
      result = hookResult;
    });

    expect(result.current.isFetchingDetails).toBe(false);

    await act(async () => {
      result.current.fetchDetails();
    });

    expect(result.current.isFetchingDetails).toBe(true);

    await act(async () => {
      delayedResolve({ data: commits });
    });

    expect(result.current.isFetchingDetails).toBe(false);
  });

  describe('Error cases', () => {
    // Keeps the log clean when running the tests
    const originalError = window.console.error;
    beforeAll(() => {
      window.console.error = jest.fn();
    });

    afterAll(() => {
      window.console.error = originalError;
    });

    it('handles rejected requests', async () => {
      (axios.get as jest.Mock).mockRejectedValue('Error');

      let result: HookResult<UseDetailsValues> = {} as HookResult<UseDetailsValues>;

      await act(async () => {
        const { result: hookResult } = renderHook(() =>
          useDetails({ commitsUrl: 'http://url1.com', forksUrl: 'http://url2.com' }),
        );
        result = hookResult;
      });

      await act(async () => {
        result.current.fetchDetails();
      });

      expect((window.alert as jest.Mock).mock.calls).toMatchInlineSnapshot(`
        Array [
          Array [
            "There was an error getting committer information",
          ],
        ]
      `);
    });
  });
});
