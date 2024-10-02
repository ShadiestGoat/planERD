export type InputEvent = MouseEvent | KeyboardEvent

function isKBEvt(e: InputEvent): e is KeyboardEvent {
    return !!(e as KeyboardEvent).key
}

export type InputHandler = (e: InputEvent) => void

export function inputHandlerFactory(h: InputHandler): InputHandler {
    return (e) => {
        if (isKBEvt(e) && !['Enter', 'Space', ' '].includes(e.key)) return

        e.preventDefault()
        h(e)
    }
}