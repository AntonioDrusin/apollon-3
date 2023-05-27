import React from "react";
import {Curves} from "../../link/Curves";

export interface CurveProps {
    color: string;
    curve?: Curves;
}

function baseStyle(color: string): any {
    return {
        stroke: color,
        fillRule: "nonzero",
        fillOpacity: "0.0",
        strokeWidth: 2,
        vectorEffect: "non-scaling-stroke",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        color: "inherit"
    };
}


const Paths: { [key in Curves]: string } = {
    sigmoid: "M 20 480 C 400 480 100 20 480 20",
    reverse_gamma: "M 20 20 C 20 250 250 480 480 480",
    gamma: "M 20 480 C 250 480 480 250 480 20",
    linear: "M 20 480 480 20",
    reverse_linear: "M 20 20 480 480",
    reverse_sigmoid: "M 20 20 C 400 20 100 480 480 480",
}

export function CurveDisplay({color, curve}: CurveProps) {
    return <>
        {curve ?
            (<svg viewBox="0 0 500 500" style={{width: "100%", height: "auto"}}>
                <path
                    style={baseStyle(color)}
                    d={Paths[curve]}>
                </path>
            </svg>)
            : null
        }
    </>
}
