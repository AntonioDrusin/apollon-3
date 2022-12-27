import './App.css';
import {
    createHashRouter, generatePath,
    RouterProvider,
} from "react-router-dom";
import Home, {homeLoader} from "./home/Home"
import Visualizer, {visualizerLoader} from "./visualizer/Visualizer";
import Controller, {controllerLoader} from "./controller/Controller";
import { HashRouter } from "react-router-dom";
export default App;


const router = createHashRouter([
    {path: "visualizer", element: <Visualizer/>, loader: visualizerLoader},
    {path: "controller", element: <Controller/>, loader: controllerLoader},
    {path: "/", element: <Home/>, loader: homeLoader},
]);

console.log(generatePath("visualizer"));

function App() {
    return (
        <RouterProvider router={router}/>
    );
}
