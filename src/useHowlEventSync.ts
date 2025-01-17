import {
    Dispatch,
    ReducerAction,
    ReducerState,
    useCallback,
    useEffect,
    useRef
} from "react"
import {
    Action,
    AudioPlayerState,
    AudioEvent,
    reducer
} from "./audioPlayerState"
import { HowlInstanceManager } from "./HowlInstanceManager"
import { HowlErrorCallback } from "howler"

export function useHowlEventSync(
    howlManager: HowlInstanceManager,
    [state, dispatch]: [AudioPlayerState, Dispatch<Action>]
): [ReducerState<typeof reducer>, Dispatch<ReducerAction<typeof reducer>>] {
    const onLoad = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_LOAD", howl })
    }, [dispatch, howlManager])

    const onError: HowlErrorCallback = useCallback(
        (_: number, errorCode: unknown) => {
            dispatch({ type: "ON_ERROR", message: errorCode as string })
        },
        [dispatch]
    )

    const onPlay = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_PLAY", howl })
    }, [dispatch, howlManager])

    const onPause = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_PAUSE", howl })
    }, [dispatch, howlManager])

    const onEnd = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_END", howl })
    }, [dispatch, howlManager])

    const onStop = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_STOP", howl })
    }, [dispatch, howlManager])

    const onMute = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_MUTE", howl })
    }, [dispatch, howlManager])

    const onVolume = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_VOLUME", howl })
    }, [dispatch, howlManager])

    const onRate = useCallback(() => {
        const howl = howlManager.getHowl()
        dispatch({ type: "ON_RATE", howl })
    }, [dispatch, howlManager])

    useEffect(() => {
        return () => {
            const howl = howlManager.getHowl()
            // howl?.off("load", onLoad)
            howl?.off("loaderror", onError)
            howl?.off("playerror", onError)
            howl?.off("play", onPlay)
            howl?.off("pause", onPause)
            howl?.off("end", onEnd)
            howl?.off("stop", onStop)
            howl?.off("mute", onMute)
            howl?.off("volume", onVolume)
            howl?.off("rate", onRate)
        }
    }, [])

    // using ref bc we don't want identity of dispatch function to change
    // see talk: https://youtu.be/nUzLlHFVXx0?t=1558
    const wrappedDispatch = useRef((action: Action) => {
        if (action.type === "START_LOAD") {
            const { howl } = action as AudioEvent
            // set up event listening
            howl.once("load", onLoad)
            howl.on("loaderror", onError)
            howl.on("playerror", onError)
            howl.on("play", onPlay)
            howl.on("pause", onPause)
            howl.on("end", onEnd)
            howl.on("stop", onStop)
            howl.on("mute", onMute)
            howl.on("volume", onVolume)
            howl.on("rate", onRate)
        }

        dispatch(action)
    })

    return [state, wrappedDispatch.current]
}
