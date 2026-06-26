type QueueItem = {
    endpoint: string
    method: 'POST' | 'PUT' | 'DELETE'
    body: unknown
}

const queue: QueueItem[] = []

export const syncQueue = {
    add: (item: QueueItem) => {
        queue.push(item)
    },

    flush: async () => {
        while (queue.length > 0) {
            const item = queue[0]
            try {
                await fetch(item.endpoint, {
                    method: item.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.body),
                })
                queue.shift()
            } catch {
                break
            }
        }
    },

    getQueue: () => queue,
}

window.addEventListener('online', () => {
    syncQueue.flush()
})