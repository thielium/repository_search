import { act, HookResult, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import axios, { CancelTokenStatic } from 'axios';
import { useRepositoryQuery, UseRepositoryQueryValues } from './useRepositoryQuery';

jest.mock('lodash/debounce', () => (_: unknown) => _);
jest.mock('axios');

describe('useRepositoryQuery', () => {
  const originalAlert = window.alert;
  beforeEach(() => {
    axios.CancelToken = ({
      source: jest.fn(() => ({ token: 'cancel-token', cancel: jest.fn() })),
    } as unknown) as CancelTokenStatic;
    (axios.get as jest.Mock).mockResolvedValue({ data: { items: [], total_count: 0 } });
    window.alert = jest.fn();
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockReset();
    window.alert = originalAlert;
  });

  it('updates query', async () => {
    let result: HookResult<UseRepositoryQueryValues> = {} as HookResult<UseRepositoryQueryValues>;

    await act(async () => {
      const { result: hookResult } = renderHook(() => useRepositoryQuery());
      result = hookResult;
    });

    expect(result.current.pagingInfo).toMatchInlineSnapshot(`
      Object {
        "page": 1,
        "query": "",
        "totalCount": 0,
      }
    `);

    await act(async () => {
      result.current.updateQuery('test');
    });

    expect(result.current.pagingInfo).toMatchInlineSnapshot(`
      Object {
        "page": 1,
        "query": "test",
        "totalCount": 0,
      }
    `);
  });

  it('updates page', async () => {
    let result: HookResult<UseRepositoryQueryValues> = {} as HookResult<UseRepositoryQueryValues>;

    await act(async () => {
      const { result: hookResult } = renderHook(() => useRepositoryQuery());
      result = hookResult;
    });

    expect(result.current.pagingInfo).toMatchInlineSnapshot(`
      Object {
        "page": 1,
        "query": "",
        "totalCount": 0,
      }
    `);

    await act(async () => {
      result.current.updatePage(1);
    });

    expect(result.current.pagingInfo).toMatchInlineSnapshot(`
      Object {
        "page": 1,
        "query": "",
        "totalCount": 0,
      }
    `);
  });

  it('fetches data', async () => {
    let renderHookResult: RenderHookResult<
      unknown,
      UseRepositoryQueryValues
    > = {} as RenderHookResult<unknown, UseRepositoryQueryValues>;

    await act(async () => {
      const hookResult = renderHook(() => useRepositoryQuery());
      renderHookResult = hookResult;
    });

    await act(async () => {
      renderHookResult.result.current.updateQuery('test');
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect((axios.get as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "https://api.github.com/search/repositories?page=1&per_page=10&q=test",
          Object {
            "cancelToken": "cancel-token",
          },
        ],
      ]
    `);
  });

  it('correctly manages loading state', async () => {
    let renderHookResult: RenderHookResult<
      unknown,
      UseRepositoryQueryValues
    > = {} as RenderHookResult<unknown, UseRepositoryQueryValues>;
    let delayedResolve: (value?: unknown) => void;
    const delay = new Promise((resolve) => {
      delayedResolve = () => resolve({ data: { items: [], total_count: 0 } });
    });
    (axios.get as jest.Mock).mockReturnValue(delay);

    await act(async () => {
      const hookResult = renderHook(() => useRepositoryQuery());
      renderHookResult = hookResult;
    });

    await act(async () => {
      renderHookResult.result.current.updateQuery('test');
    });

    expect(renderHookResult.result.current.isFetchingRepos).toBe(true);

    await act(async () => {
      delayedResolve();
    });

    await act(async () => {
      renderHookResult.rerender();
    });

    expect(renderHookResult.result.current.isFetchingRepos).toBe(false);
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

    it('displays an alert when there is an error', async () => {
      let renderHookResult: RenderHookResult<
        unknown,
        UseRepositoryQueryValues
      > = {} as RenderHookResult<unknown, UseRepositoryQueryValues>;

      (axios.get as jest.Mock).mockRejectedValue('Error');

      await act(async () => {
        const hookResult = renderHook(() => useRepositoryQuery());
        renderHookResult = hookResult;
      });

      await act(async () => {
        renderHookResult.result.current.updateQuery('test');
      });

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect((window.alert as jest.Mock).mock.calls).toMatchInlineSnapshot(`
        Array [
          Array [
            "There was an error retrieving repositories. Please try again later.",
          ],
        ]
      `);
    });
  });
});
