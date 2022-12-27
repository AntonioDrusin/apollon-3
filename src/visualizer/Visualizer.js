import "./Visualizer.css"

import {useState} from "react"

export function visualizerLoader() {
    return null;
}

export default function Visualizer() {

    const value = JSON.parse(localStorage.getItem('controls')) || {};
    const [width, setWidth] = useState(value.width);

    const localStorageUpdated = () => {
        const value = JSON.parse(localStorage.getItem('controls')) || {};
        setWidth(value.width);
    };


    window.addEventListener('storage', localStorageUpdated);

    // Initialize from current values
    return (
        <div className="Visualizer">
            <h1>Visualizer {width}</h1>
        </div>
    );
}