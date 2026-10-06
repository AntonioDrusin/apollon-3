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
uniform float thickness;


float drawLine (vec2 p1, vec2 p2, vec2 uv, float a)
{
    // Work in pixels so the pen stays round whatever the aspect ratio.
    vec2 start = p1 * resolution;
    vec2 end = p2 * resolution;
    vec2 p = uv * resolution;

    // Project the current pixel onto the segment to find its closest point.
    vec2 segment = end - start;
    float t = clamp(dot(p - start, segment) / max(dot(segment, segment), 1e-6), 0., 1.);

    return step(distance(mix(start, end, t), p), a);
}

void main() {
    // Draws the line

    vec4 firstSample = texture(dataTexture, vUv);

    float ink = firstSample.r;
    float transparency = firstSample.g;

    if (penDown > 0.0) {
        if (distance(from / resolution, to / resolution)  < 0.9) {
            float lineMultiplier = drawLine(from / resolution, to / resolution, vUv, thickness);
            if (lineMultiplier > 0.0) {
                ink += paintDrop;
                transparency = 1.0;
            }
        }
    }

   // transparency = firstSample.g;

    gl_FragColor = vec4(ink, transparency, 0, 0);
}