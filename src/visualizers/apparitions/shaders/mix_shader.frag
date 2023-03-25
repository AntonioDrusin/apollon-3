uniform sampler2D firstTex;
uniform sampler2D secondTex;
varying vec2 vUv;

// Drawing the line
uniform vec2 resolution;
uniform vec3 color;
uniform vec2 from;
uniform vec2 to;
uniform float paintDrop;


float drawLine(vec2 p1, vec2 p2) {
    float thickness = 1.0/(resolution.x+resolution.y);
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
    // Mixes the two paint textures, depending on the runny colors setting
    // Draws the line

    vec4 firstSample = texture(firstTex, vUv);
    vec4 secondSample = texture(secondTex, vUv);

    vec4 finalColor = firstSample;

    if ( distance(from / resolution, to / resolution)  < 0.9 ) {
        float lineMultiplier = drawLine(from / resolution, to / resolution);
        if ( lineMultiplier > 0.0 ) {
            finalColor = vec4((color.rgb + finalColor.rgb)/2.0,  finalColor.a + paintDrop);
        }
    }

    gl_FragColor = vec4(finalColor);
}