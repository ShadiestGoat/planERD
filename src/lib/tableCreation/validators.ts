import type { Index } from '$lib/types'

type ValidationFunc = (v: string) => boolean

export function validateNoSpaces(v: string): boolean {
    return v.length > 0 && !v.includes(' ')
}

function validateBase(existing: string[]): ValidationFunc {
    return (v) => {
        if (!validateNoSpaces(v)) {
            return false
        }

        return !existing.includes(v)
    }
}

// TODO: Reserved keywords
export const validateColName = validateBase
export const validateTableName = validateBase

export function mkValidateMultiColIndex(
    indices: Index[] | undefined,
    i: number
): (v: string[]) => boolean {
    if (!indices) return (v) => v.length < 2

    const tmp = [...indices]
    tmp.splice(i, 1)
    const cache = tmp.map((v) => new Set(v.colNames))

    return (v) => {
        if (v.length < 2) return false

        const s = new Set(v)

        for (const cs of cache) {
            if (cs.symmetricDifference(s).size == 0) {
                return false
            }
        }

        return true
    }
}
