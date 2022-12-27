import "./Home.css"

export function homeLoader() {
    return null;
}

export default function Home() {
    return (
        <div className="Home">
            <div>
                <h1>Caschetto Visualizer</h1>
                <p>
                    Use the <a href="/#/visualizer" target="_blank" rel="noopener noreferrer">visualizer</a> link to show the window with the graphics.
                </p>
                <p>
                    Use the <a href="/#/controller" target="_blank" rel="noopener noreferrer">controller</a> to show the controls.
                </p>
            </div>
        </div>
    );
}