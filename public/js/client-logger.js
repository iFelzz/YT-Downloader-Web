// Client logging helper
async function logClient(message, level = 'info', details = {}) {
    try {
        await fetch('/api/client-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, level, details })
        });
    } catch (e) {
        console.error('Failed to send client log', e);
    }
}
