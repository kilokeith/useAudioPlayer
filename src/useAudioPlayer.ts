import { useCallback, useEffect, useReducer, useRef } from "react"
import {
    initStateFromHowl,
    reducer as audioStateReducer
} from "./audioPlayerState"
import { useHowlEventSync } from "./useHowlEventSync"
import { HowlInstanceManager } from "./HowlInstanceManager"
import { AudioPlayer, LoadArguments } from "./types"

export const useAudioPlayer = (): AudioPlayer => {
    const howlManager = useRef<HowlInstanceManager | null>(null)
    function getHowlManager() {
        if (howlManager.current !== null) {
            return howlManager.current
        }

        const manager = new HowlInstanceManager()
        howlManager.current = manager
        return manager
    }

    const [state, dispatch] = useHowlEventSync(
        getHowlManager(),
        useReducer(
            audioStateReducer,
            getHowlManager().getHowl(),
            initStateFromHowl
        )
    )

    useEffect(() => {
        // stop/delete the sound object when the hook unmounts
        return () => {
            getHowlManager().destroyHowl()
        }
    }, [])

    const load = useCallback((...[src, options = {}]: LoadArguments) => {
        const howl = getHowlManager().createHowl({
            src,
            ...options
        })

        dispatch({ type: "START_LOAD", howl })

        return howl
    }, [])

    const seek = useCallback((seconds: number) => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.seek(seconds)
    }, [])

    const getPosition = useCallback(() => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return 0
        }

        return howl.seek() ?? 0
    }, [])

    const play = useCallback(() => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.play()
    }, [])

    const pause = useCallback(() => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.pause()
    }, [])

    const togglePlayPause = useCallback(() => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        if (state.playing) {
            howl.pause()
        } else {
            howl.play()
        }
    }, [state])

    const stop = useCallback(() => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.stop()
    }, [])

    const fade = useCallback((from: number, to: number, duration: number) => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.fade(from, to, duration)
    }, [])

    const setRate = useCallback((speed: number) => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.rate(speed)
    }, [])

    const setVolume = useCallback((vol: number) => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.volume(vol)
    }, [])

    const mute = useCallback((muteOnOff: boolean) => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        howl.mute(muteOnOff)
    }, [])

    const loop = useCallback((loopOnOff: boolean) => {
        const howl = getHowlManager().getHowl()
        if (howl === undefined) {
            return
        }

        // this differs from the implementation in useGlobalAudioPlayer which needs to broadcast the action to itself and all other instances of the hook
        // maybe these two behaviors could be abstracted with one interface in the future
        dispatch({ type: "ON_LOOP", howl, toggleValue: loopOnOff })
    }, [])

    const getHowl = useCallback(() => {
        return getHowlManager().getHowl()
    }, [])

    return {
        ...state,
        load,
        seek,
        getPosition,
        getHowl,
        play,
        pause,
        togglePlayPause,
        stop,
        mute,
        fade,
        setRate,
        setVolume,
        loop
    }
}
