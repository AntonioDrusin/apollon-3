uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
uniform vec2 iResolution;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;
uniform float mixRatio; // mix Ratio

const float inkDisperse = 4.0;



vec4 disperse(inout float totalInk, in float alpha, inout float mixers, in vec2 samplePosition) {
    vec4 data = texture(dataTexture, samplePosition);
    if ( data.r > inkDisperse ) {
        totalInk += 1.0;
        mixers += 1.0;
        return vec4(0.0, (1.0-mixRatio)*data.g + mixRatio * alpha, 0.0, 1.0);
    }
    return vec4(0.0, 0.0, 0.0, 0.0);
}

void main() {
    vec2 step = 1.0/iResolution;
    float mixers = 0.0;

    vec4 finalData = texture(dataTexture, vUv);

    float totalInk = finalData.r;
    float alpha = finalData.g;

    if ( totalInk > inkDisperse ) totalInk -= inkDisperse;

    vec4 v1 = disperse(totalInk, alpha, mixers, vec2(vUv.x, vUv.y + step.y));
    vec4 v2 = disperse(totalInk, alpha, mixers, vec2(vUv.x, vUv.y - step.y));
    vec4 v3 = disperse(totalInk, alpha, mixers, vec2(vUv.x + step.x, vUv.y));
    vec4 v4 = disperse(totalInk, alpha, mixers, vec2(vUv.x - step.x, vUv.y));

    if ( totalInk > dryRate ) totalInk -= dryRate;
    finalData.r = totalInk;

    if ( mixers > 0.0 ) {
        finalData.g = (v1.g * v1.a + v2.g * v2.a + v3.g * v3.a + v4.g * v4.a ) / mixers;
    }
    else {
        finalData.g = alpha;
    }


    gl_FragColor = finalData;
}