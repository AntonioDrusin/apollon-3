uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
uniform vec2 iResolution;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;
const float inkDisperse = 4.0;

vec4 disperse(inout vec4 finalColor, inout float mixers, in vec2 samplePosition) {
    vec4 data = texture(dataTexture, samplePosition);
    if ( data.r > inkDisperse ) {
        vec4 color = texture(imageTexture, samplePosition);
        mixers += 1.0;
        return vec4((finalColor.rgb + color.rgb)/2.0, 1.0);
    }
    return vec4(0.0,0.0,0.0,0.0);
}

void main() {
    vec2 step = 1.0/iResolution;
    float mixers = 0.0;

    vec4 finalColor = texture(imageTexture, vUv);

    vec4 v1 = disperse(finalColor, mixers, vec2(vUv.x, vUv.y + step.y));
    vec4 v2 = disperse(finalColor, mixers, vec2(vUv.x, vUv.y - step.y));
    vec4 v3 = disperse(finalColor, mixers, vec2(vUv.x + step.x, vUv.y));
    vec4 v4 = disperse(finalColor, mixers, vec2(vUv.x - step.x, vUv.y));

    if ( mixers != 0.0 ) {
        finalColor.rgb = ((v1 * v1.a + v2 * v2.a + v3 * v3.a + v4 * v4.a) / mixers).rgb;
    }


    gl_FragColor = finalColor;
}