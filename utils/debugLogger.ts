
// Simple global logger for debugging on mobile
export const debugLogs: string[] = (() => {
    try {
        const saved = localStorage.getItem('debug_logs');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
})();

const listeners: (() => void)[] = [];

export const logDebug = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    debugLogs.push(logMessage);

    // Keep only last 50 logs to avoid issues
    if (debugLogs.length > 50) debugLogs.shift();

    try {
        localStorage.setItem('debug_logs', JSON.stringify(debugLogs));
    } catch (e) {
        // Silently fail if localStorage is full or disabled
    }

    listeners.forEach(l => l());
};

export const subscribeToLogs = (listener: () => void) => {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
};
