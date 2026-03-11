/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * Unit tests for shared hooks (useAsync, useDebounce) from xenolexia-typescript.
 */

import {act, renderHook} from '@testing-library/react-native';

import {useAsync, useDebounce} from '@hooks';

describe('useAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has initial state: data null, not loading, no error', () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const {result} = renderHook(() => useAsync(fn));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('execute runs async function and sets data on success', async () => {
    const value = {id: 1};
    const fn = jest.fn().mockResolvedValue(value);
    const {result} = renderHook(() => useAsync(fn));

    await act(async () => {
      await result.current.execute();
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(value);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading true while executing', async () => {
    let resolve: (v: string) => void;
    const promise = new Promise<string>(r => {
      resolve = r;
    });
    const fn = jest.fn().mockReturnValue(promise);
    const {result} = renderHook(() => useAsync(fn));

    act(() => {
      result.current.execute();
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolve!('done');
      await promise;
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('sets error and null data on failure', async () => {
    const err = new Error('fail');
    const fn = jest.fn().mockRejectedValue(err);
    const {result} = renderHook(() => useAsync(fn));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(err);
    expect(result.current.isLoading).toBe(false);
  });

  it('reset clears data, error, and loading', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const {result} = renderHook(() => useAsync(fn));

    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe('ok');

    act(() => {
      result.current.reset();
    });
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const {result} = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('updates to new value after delay', () => {
    const {result, rerender} = renderHook(
      ({value, delay}: {value: string; delay: number}) => useDebounce(value, delay),
      {initialProps: {value: 'first', delay: 500}}
    );
    expect(result.current).toBe('first');

    rerender({value: 'second', delay: 500});
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('second');
  });

  it('cancels previous timer when value changes again before delay', () => {
    const {result, rerender} = renderHook(
      ({value, delay}: {value: string; delay: number}) => useDebounce(value, delay),
      {initialProps: {value: 'a', delay: 500}}
    );

    rerender({value: 'b', delay: 500});
    rerender({value: 'c', delay: 500});

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('c');
  });
});
