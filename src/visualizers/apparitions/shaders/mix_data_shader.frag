uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
varying vec2 vUv;

// Drawing the line
uniform vec2 resolution;
uniform vec3 color;
uniform vec2 from;
uniform vec2 to;
uniform float paintDrop;
uniform float penDown;


float drawLine(vec2 p1, vec2 p2) {
    float thickness = 1.0/(resolution.x+resolution.y);
    vec2 uv = vUv.xy;

    float a = abs(distance(p1, uv));
    float b = abs(distance(p2, uv));
    float c = abs(distance(p1, p2));

    if (a >= c || b >=  c) return 0.0;

    float p = (a + b + c) * 0.5;

    // median to (p1, p2) vector
    float h = 2.0 / c * sqrt(p * (p - a) * (p - b) * (p - c));

    return mix(1.0, 0.0, smoothstep(0.5 * thickness, 1.5 * thickness, h));
}

void main() {
    // Draws the line

    vec4 firstSample = texture(imageTexture, vUv);

    vec4 finalColor = firstSample;

    if (penDown > 0.0)
    if (distance(from / resolution, to / resolution)  < 0.9) {
        float lineMultiplier = drawLine(from / resolution, to / resolution);
        if (lineMultiplier > 0.0) {
            finalColor = vec4((color.rgb + finalColor.rgb)/2.0, finalColor.a + paintDrop);
        }
    }

    gl_FragColor = vec4(finalColor);
}