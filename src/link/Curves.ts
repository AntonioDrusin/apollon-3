
export const CurveNames = ["sigmoid", "reverse_sigmoid", "linear", "reverse_linear", "reverse_gamma", "gamma"];
export type Curves = typeof CurveNames[number];

export const CurveLabels : {[key in Curves]: string} = {
    sigmoid: "Sigmoid",
    reverse_gamma: "Reverse Gamma",
    gamma: "Gamma",
    linear: "Linear",
    reverse_linear: "Reverse Linear",
    reverse_sigmoid: "Reverse Sigmoid",
}
