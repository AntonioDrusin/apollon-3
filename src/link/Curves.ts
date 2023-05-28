
export const CurveNames = ["sigmoid", "reverse_sigmoid", "linear", "reverse_linear", "reverse_gamma", "gamma", "center", "reverse_center"];
export type Curves = typeof CurveNames[number];

export const CurveLabels : {[key in Curves]: string} = {
    sigmoid: "Sigmoid",
    reverse_gamma: "Reverse Gamma",
    gamma: "Gamma",
    linear: "Linear",
    reverse_linear: "Reverse Linear",
    reverse_sigmoid: "Reverse Sigmoid",
    center: "Center",
    reverse_center: "Reverse Center"
}
