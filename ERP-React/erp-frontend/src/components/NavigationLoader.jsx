
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./NavigationLoader.css";

export default function NavigationLoader() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Initial page load par loader mat dikhayein
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setLoading(true);

        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [location.pathname, location.search]);

    if (!loading) return null;

    return (
        <div className="navigation-progress" role="progressbar" aria-label="Loading page">
            <div className="navigation-progress-bar" />
        </div>
    );
}
