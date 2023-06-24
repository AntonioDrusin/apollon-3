
export const CurveNames = ["sigmoid", "reverse_sigmoid", "linear", "reverse_linear", "reverse_gamma", "gamma", "center", "reverse_center"];
export type Curves = typeof CurveNames[number];

export const CurveLabels : {[key in Curves]: string} = {
    sigmoid: "curves.sigmoid",
    reverse_gamma: "curves.reverse_gamma",
    gamma: "curves.gamma",
    linear: "curves.linear",
    reverse_linear: "curves.reverse_linear",
    reverse_sigmoid: "curves.reverse_sigmoid",
    center: "curves.center",
    reverse_center: "curves.reverse_center"
}
