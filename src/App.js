import './App.css';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Home, {homeLoader} from "./home/Home"
import Visualizer, {visualizerLoader} from "./visualizer/Visualizer";
import Controller, {controllerLoader} from "./controller/Controller";

export default App;


const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>,
        loader: homeLoader,
    },
    { path: "visualizer", element: <Visualizer/>, loader: visualizerLoader},
    { path: "controller", element: <Controller/>, loader: controllerLoader}
]);

function App() {
    return (
        <RouterProvider router={router}/>
    );
}
