import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '../debounce'

describe('debounce', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('does not fire before the delay elapses', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)
    debounced('a')
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()
  })

  it('fires exactly once after the delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)
    debounced('a')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('coalesces rapid calls and fires with the last args', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)
    debounced('a')
    debounced('b')
    debounced('c')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('resets the timer when called again before delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)
    debounced('a')
    vi.advanceTimersByTime(200)
    debounced('b')
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('b')
  })

  it('fires again after a full gap between calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)
    debounced('first')
    vi.advanceTimersByTime(300)
    debounced('second')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenNthCalledWith(1, 'first')
    expect(fn).toHaveBeenNthCalledWith(2, 'second')
  })
})
