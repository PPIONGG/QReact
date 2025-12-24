import React, { ReactNode, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current && isVisible) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current?.getBoundingClientRect();

            let top = triggerRect.top - 8; // Default above
            let left = triggerRect.left + triggerRect.width / 2;

            if (tooltipRect) {
                // Calculate centered position
                let calculatedLeft = left - tooltipRect.width / 2;

                // Boundary detection (viewport edges)
                const padding = 10; // Minimum distance from screen edge
                const viewportWidth = window.innerWidth;

                // Clamp left
                if (calculatedLeft < padding) {
                    calculatedLeft = padding;
                }
                // Clamp right
                else if (calculatedLeft + tooltipRect.width > viewportWidth - padding) {
                    calculatedLeft = viewportWidth - tooltipRect.width - padding;
                }

                left = calculatedLeft;
            }

            setCoords({ top, left });
        }
    };

    // Initial position on hover
    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Initial rough position before we have tooltip dimensions
            setCoords({
                top: rect.top - 8,
                left: rect.left + rect.width / 2
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    // Refine position once tooltip is rendered and we know its width
    useLayoutEffect(() => {
        if (isVisible) {
            updatePosition();
            // Optional: Add resize listener if needed, but for tooltips usually not critical
        }
    }, [isVisible]);

    return (
        <div
            ref={triggerRef}
            className={`relative ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isVisible && createPortal(
                <div
                    ref={tooltipRef}
                    className="fixed z-[9999] w-max max-w-[200px] sm:max-w-xs p-2 bg-gray-800 text-white text-sm rounded shadow-lg pointer-events-none break-words"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: 'translateY(-100%)' // Only translate Y, X is handled manually
                    }}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};
