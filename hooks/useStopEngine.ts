import { useEffect, useMemo, useState } from "react";
import { detectLiveStops } from "@/lib/liveEventEngine";

export function useStopEngine(
    traccarTrackers: any[],
    initialStops: any[] = []
) {
    const [stops, setStops] = useState(initialStops);
    const [liveStops, setLiveStops] = useState<any[]>([]);

    useEffect(() => {
        const detected = detectLiveStops(
            traccarTrackers,
            liveStops
        );

        setLiveStops(detected);
    }, [traccarTrackers]);

    const allStops = useMemo(
        () => [...stops, ...liveStops],
        [stops, liveStops]
    );

    return {
        stops,
        setStops,
        liveStops,
        setLiveStops,
        allStops,
    };
}