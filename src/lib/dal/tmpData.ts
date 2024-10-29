import { writable } from 'svelte/store'

export const indexPopupID = writable<string>('')

export enum SidebarTabs {
    TABLES,
    RELATIONS,
    ENUMS
}

export const sidebarTab = writable<SidebarTabs>(SidebarTabs.TABLES)
