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
uniform float colorSaturation;


float drawLine (vec2 p1, vec2 p2, vec2 uv, float a)
{
    float r = 0.;
    float one_px = 1. / resolution.x; //not really one px

    // get dist between points
    float d = distance(p1, p2);

    // get dist between current pixel and p1
    float duv = distance(p1, uv);

    //if point is on line, according to dist, it should match current uv
    r = 1.-floor(1.-(a*one_px)+distance (mix(p1, p2, clamp(duv/d, 0., 1.)),  uv));

    return r;
}


void main() {
    // Draws the line

    vec4 firstSample = texture(imageTexture, vUv);

    vec4 finalColor = firstSample;

    if (penDown > 0.0)
    if (distance(from / resolution, to / resolution)  < 0.9) {
        float lineMultiplier = drawLine(from / resolution, to / resolution, vUv, thickness);
        if (lineMultiplier > 0.0) {
            float alpha = texture(dataTexture,vUv).g;
            finalColor = vec4( mix(color.rgb, mix(color.rgb , finalColor.rgb, 0.5 + alpha/2.), 1.-colorSaturation) , 0);
        }
    }

    gl_FragColor = vec4(finalColor);
}