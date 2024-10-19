import { writable } from 'svelte/store'

/**
 * Exceptions for drawing multi-col indices (ie. still draw these, even if conditions don't meet)
 * Table Name -> { Set(IndexIndex) }
 */
export const multiColIndexExceptions = writable<Record<string, Set<number>>>({})
export const indexPopupID = writable<string>('')
