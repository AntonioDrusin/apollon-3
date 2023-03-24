uniform sampler2D tex;
uniform vec2 iResolution;
uniform float iTime;
varying vec2 vUv;

uniform vec4 color;

uniform vec2 from;
uniform vec2 to;

float drawLine(vec2 p1, vec2 p2) {
    float Thickness = 0.0003;
    vec2 uv = vUv.xy;

    float a = abs(distance(p1, uv));
    float b = abs(distance(p2, uv));
    float c = abs(distance(p1, p2));

    if ( a >= c || b >=  c ) return 0.0;

    float p = (a + b + c) * 0.5;

    // median to (p1, p2) vector
    float h = 2.0 / c * sqrt( p * ( p - a) * ( p - b) * ( p - c));

    return mix(1.0, 0.0, smoothstep(0.5 * Thickness, 1.5 * Thickness, h));
}

void main() {

    // spread color around

    // right = avg ( right and me)
    // left = avg (left and me)
    // above = avg (above and me)
    // below = avg(below and me)

    float colorStep = 1.0/200.0;
    float colorMin = colorStep * 4.0;
    float dryRate = 1.0/30000.0;

    // my color is the average of the four cardinal directions
    vec2 step = 1.0/iResolution;

    float mixers = 1.0;


    vec4 finalColor = texture(tex, vUv);
    if ( distance(from / iResolution, to / iResolution)  < 0.5 ) {
        float lineMultiplier = drawLine(from / iResolution, to / iResolution);
        if ( lineMultiplier > 0.0 ) {
            finalColor = vec4(color.rgb,  finalColor.a + color.a);
        }
    }

    float totalInk = finalColor.a;


    if ( totalInk > colorMin ) totalInk -= colorStep * 4.0;

    vec4 colorUp = texture(tex, vec2(vUv.x, vUv.y + step.y));
    if ( colorUp.a > colorMin ) {
        finalColor.rgb = (finalColor.rgb + colorUp.rgb);
        totalInk += colorStep;
        mixers += 1.0;
    }

    vec4 colorDown = texture(tex, vec2(vUv.x, vUv.y - step.y));
    if ( colorDown.a > colorMin ) {
        finalColor.rgb = (finalColor.rgb + colorDown.rgb);
        totalInk += colorStep;
        mixers += 1.0;
    }

    vec4 colorRight = texture(tex, vec2(vUv.x + step.x, vUv.y));
    if ( colorRight.a > colorMin ) {
        finalColor.rgb = (finalColor.rgb + colorRight.rgb);
        totalInk += colorStep;
        mixers += 1.0;
    }

    vec4 colorLeft = texture(tex, vec2(vUv.x - step.x, vUv.y));
    if ( colorLeft.a > colorMin ) {
        finalColor.rgb = (finalColor.rgb + colorLeft.rgb);
        totalInk += colorStep;
        mixers += 1.0;
    }

    if ( totalInk > dryRate ) totalInk -= dryRate;
    finalColor.rgb = finalColor.rgb / mixers;
    finalColor.a = totalInk;

    if ( iTime < 1.0 ) {
        finalColor = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = finalColor;
}