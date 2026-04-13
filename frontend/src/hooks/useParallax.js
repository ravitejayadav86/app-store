import { useState, useEffect } from 'react';

/**
 * useParallax Hook
 * Returns x and y offsets based on mouse position relative to the center of the viewport.
 * Scaling factor determines the intensity of the "weightless" drift.
 */
export default function useParallax(factor = 15) {
    const [offsets, setOffsets] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            // Get percentage from center (-0.5 to 0.5)
            const x = (e.clientX / innerWidth) - 0.5;
            const y = (e.clientY / innerHeight) - 0.5;
            
            setOffsets({
                x: x * factor,
                y: y * factor
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [factor]);

    return offsets;
}
