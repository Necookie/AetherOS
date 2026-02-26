// Custom timestamp to adhere to deterministic philosophy
let monotonicCounter = 1000000;

export const kernelClock = {
    /**
     * Returns a deterministic timestamp.
     * Guaranteed to increase sequentially per call.
     * Completely avoids Date.now()
     */
    now: (): number => {
        // In a more integrated version, we could subscribe to the kernel worker ticks.
        // For now, this fallback monotonic counter meets the requirement of no Date.now()
        // and ensuring predictable sequential operations.
        monotonicCounter++;
        return monotonicCounter;
    }
};
