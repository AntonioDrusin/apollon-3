uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
uniform vec2 iResolution;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;
const float inkDisperse = 4.0;

vec4 disperse(in vec4 color, inout float mixers, in vec2 samplePosition, float alpha) {
    vec4 data = texture(dataTexture, samplePosition);
    if (data.r > inkDisperse) {
        vec4 mix = texture(imageTexture, samplePosition);
        mixers += 1.0;
        // return vec4((color.rgb + mix.rgb)/2.0, 1.0);
        return vec4((color.rgb*alpha + mix.rgb)/(alpha+1.0), 1.0);
    }
    return vec4(0.0, 0.0, 0.0, 0.0);
}

void main() {
    vec2 step = 1.0/iResolution;
    float mixers = 0.0;

    vec4 color = texture(imageTexture, vUv);
    vec4 data = texture(dataTexture, vUv);

    vec4 v1 = disperse(color, mixers, vec2(vUv.x, vUv.y + step.y), data.g);// data.g is alpha
    vec4 v2 = disperse(color, mixers, vec2(vUv.x, vUv.y - step.y), data.g);
    vec4 v3 = disperse(color, mixers, vec2(vUv.x + step.x, vUv.y), data.g);
    vec4 v4 = disperse(color, mixers, vec2(vUv.x - step.x, vUv.y), data.g);

    if (mixers > 0.0) {
        gl_FragColor = vec4(((v1 * v1.a + v2 * v2.a + v3 * v3.a + v4 * v4.a) / mixers).rgb, 1.0);
        //gl_FragColor = vec4(1.0,1.0,0.0,1.0);
    } else {
        gl_FragColor = color;
    }
}