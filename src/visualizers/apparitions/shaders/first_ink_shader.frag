uniform sampler2D tex;
uniform vec2 iResolution;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;
uniform float paintDrop;

// Drawing the line
uniform vec3 color;
uniform vec2 from;
uniform vec2 to;

float drawLine(vec2 p1, vec2 p2) {
    float thickness = 1.0/(iResolution.x+iResolution.y);
    vec2 uv = vUv.xy;

    float a = abs(distance(p1, uv));
    float b = abs(distance(p2, uv));
    float c = abs(distance(p1, p2));

    if ( a >= c || b >=  c ) return 0.0;

    float p = (a + b + c) * 0.5;

    // median to (p1, p2) vector
    float h = 2.0 / c * sqrt( p * ( p - a) * ( p - b) * ( p - c));

    return mix(1.0, 0.0, smoothstep(0.5 * thickness, 1.5 * thickness, h));
}

void main() {
    vec2 step = 1.0/iResolution;

    float mixers = 1.0;

    vec4 finalColor = texture(tex, vUv);
    if ( distance(from / iResolution, to / iResolution)  < 0.9 ) {
        float lineMultiplier = drawLine(from / iResolution, to / iResolution);
        if ( lineMultiplier > 0.0 ) {
            finalColor = vec4((color.rgb + finalColor.rgb)/2.0,  finalColor.a + paintDrop);
        }
    }

    float totalInk = finalColor.a;
    float inkDisperse = 4.0;

    if ( totalInk > inkDisperse ) totalInk -= inkDisperse;

    vec4 colorUp = texture(tex, vec2(vUv.x, vUv.y + step.y));
    if ( colorUp.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorUp.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    vec4 colorDown = texture(tex, vec2(vUv.x, vUv.y - step.y));
    if ( colorDown.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorDown.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    vec4 colorRight = texture(tex, vec2(vUv.x + step.x, vUv.y));
    if ( colorRight.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorRight.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    vec4 colorLeft = texture(tex, vec2(vUv.x - step.x, vUv.y));
    if ( colorLeft.a > inkDisperse ) {
        finalColor.rgb = (finalColor.rgb + colorLeft.rgb);
        totalInk += 1.0;
        mixers += 1.0;
    }

    if ( totalInk > dryRate ) totalInk -= dryRate;
    finalColor.rgb = finalColor.rgb / mixers;
    finalColor.a = totalInk;

    gl_FragColor = finalColor;
}