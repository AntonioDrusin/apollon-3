uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
uniform vec2 iResolution;
uniform float inkBarrier;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;
const float inkDisperse = 4.0;


void disperse(inout float totalInk, inout float alpha, inout float mixers, in vec2 samplePosition) {
    vec4 data = texture(dataTexture, samplePosition);
    if ( data.r > inkDisperse * inkBarrier) {

        float ratio = data.r > inkDisperse
        ? 1.0
        : inkBarrier;

        totalInk += ratio;
        alpha += data.g * ratio;
        mixers += ratio;
    }
}

void main() {
    vec2 step = 1.0/iResolution;
    float mixers = 1.0;

    vec4 finalData = texture(dataTexture, vUv);

    float totalInk = finalData.r;
    float alpha = finalData.g;

    if ( totalInk > inkDisperse * inkBarrier) {
        if ( totalInk > inkDisperse ) {
            totalInk -= inkDisperse;
        }
        else {
            totalInk -= inkDisperse * inkBarrier;
        }
    }

    disperse(totalInk, alpha, mixers, vec2(vUv.x, vUv.y + step.y));
    disperse(totalInk, alpha, mixers, vec2(vUv.x, vUv.y - step.y));
    disperse(totalInk, alpha, mixers, vec2(vUv.x + step.x, vUv.y));
    disperse(totalInk, alpha, mixers, vec2(vUv.x - step.x, vUv.y));

    if ( totalInk > dryRate ) totalInk -= dryRate;

    finalData.r = totalInk;
    finalData.g = alpha/mixers; // background percentage

    gl_FragColor = finalData;
}