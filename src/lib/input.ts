export type AnyInputEvent = MouseEvent | KeyboardEvent

function isKBEvt(e: AnyInputEvent): e is KeyboardEvent {
    return !!(e as KeyboardEvent).key
}

export type InputHandler = (e: AnyInputEvent) => void

function inputHandlerFactory(h: InputHandler): InputHandler {
    return (e) => {
        if (isKBEvt(e) && !['Enter', 'Space', ' '].includes(e.key)) return

        e.preventDefault()
        h(e)
    }
}

export function inputAction(n: GlobalEventHandlers, d: InputHandler): void {
    const h = inputHandlerFactory(d)

    n.onclick = h
    n.onkeydown = h

    return
}
