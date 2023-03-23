uniform sampler2D tex;
uniform vec2 iResolution;
varying vec2 vUv;

void main() {

    // spread color around

    // right = avg ( right and me)
    // left = avg (left and me)
    // above = avg (above and me)
    // below = avg(below and me)

    // my color is the average of the four cardinal directions
    vec2 step = 1.0/iResolution;
    vec3 colorUp = texture(tex, vec2(vUv.x, vUv.y + step.y)).rgb;
    vec3 colorDown = texture(tex, vec2(vUv.x, vUv.y - step.y)).rgb;
    vec3 colorLeft = texture(tex, vec2(vUv.x - step.x, vUv.y)).rgb;
    vec3 colorRight = texture(tex, vec2(vUv.x + step.x, vUv.y)).rgb;
    vec3 finalColor = (colorUp + colorDown + colorLeft + colorRight)/4.0;


    //vec3 finalColor = texture(tex, vUv).rgb;

    gl_FragColor = vec4(finalColor.r, finalColor.g, finalColor.b, 1.0);
}