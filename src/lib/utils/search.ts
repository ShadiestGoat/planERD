export function fuzzySearch(q: string, data: string[]): string[] {
    if (!q) return data

    return data.filter((cur) => {
        let i = 0

        // fuzzy search bitches
        for (const l of q) {
            const j = cur.indexOf(l, i)
            if (j == -1) {
                return false
            }

            i = j
        }

        return true
    })
}
