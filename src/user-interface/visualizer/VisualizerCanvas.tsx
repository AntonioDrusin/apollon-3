import React, {useEffect, useMemo, useRef} from "react";
import {Register} from "../../Register";

export function visualizerLoader() {
    return null;
}

// Wait for resizing to settle before reloading the visualizer at the new size.
const RESIZE_DEBOUNCE_MS = 400;

export function VisualizerCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const receiver = useMemo(() => Register.screenLinkReceiver, []);

    useEffect(() => {
        const container = containerRef.current!;
        const width = Math.round(container.clientWidth);
        const height = Math.round(container.clientHeight);
        receiver.linkVisualizer(width, height, container);

        // Avoid a white flash while the page reloads.
        const previousBackground = document.body.style.background;
        document.body.style.background = "black";

        // Visualizers are sized at construction, so reload to rebuild them at the new size.
        let timer: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (Math.round(container.clientWidth) !== width || Math.round(container.clientHeight) !== height) {
                    window.location.reload();
                }
            }, RESIZE_DEBOUNCE_MS);
        };
        window.addEventListener("resize", onResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", onResize);
            document.body.style.background = previousBackground;
        };
    }, [receiver, containerRef]);

    return <div ref={containerRef} style={{position: "fixed", inset: 0, overflow: "hidden"}}></div>
}
