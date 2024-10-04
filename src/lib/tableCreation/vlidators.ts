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
