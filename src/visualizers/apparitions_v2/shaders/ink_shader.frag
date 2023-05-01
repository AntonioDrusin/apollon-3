uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
uniform vec2 iResolution;
uniform float inkBarrier;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;
const float inkDisperse = 4.0;


void disperse(inout vec4 finalColor, inout float mixers, in vec2 samplePosition) {
    vec4 data = texture(dataTexture, samplePosition);
    if ( data.r > inkDisperse ) {
        float ratio = inkDisperse / min(data.r, inkDisperse);

        vec4 color = texture(imageTexture, samplePosition);
        finalColor.rgb = (finalColor.rgb + color.rgb * ratio);
        mixers += ratio;
    }
}

void main() {
    vec2 step = 1.0/iResolution;
    float mixers = 1.0;

    vec4 finalColor = texture(imageTexture, vUv);

    disperse(finalColor, mixers, vec2(vUv.x, vUv.y + step.y));
    disperse(finalColor, mixers, vec2(vUv.x, vUv.y - step.y));
    disperse(finalColor, mixers, vec2(vUv.x + step.x, vUv.y));
    disperse(finalColor, mixers, vec2(vUv.x - step.x, vUv.y));

    finalColor.rgb = finalColor.rgb / mixers;

    gl_FragColor = finalColor;
}