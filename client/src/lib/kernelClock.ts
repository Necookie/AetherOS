// Deterministic kernel clock — no Date.now(), uses performance.now()
// which is relative to page load and thus deterministic within a session.

export const kernelClock = {
    now: (): number => performance.now(),
};

// Convenience alias for new code
export const getKernelTime = kernelClock.now;
