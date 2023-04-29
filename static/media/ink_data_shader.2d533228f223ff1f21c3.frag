uniform sampler2D imageTexture;
uniform sampler2D dataTexture;
uniform vec2 iResolution;
varying vec2 vUv;

// Algorithm parameters
uniform float dryRate;

void main() {
    vec2 step = 1.0/iResolution;
    float mixers = 1.0;

    vec4 finalData = texture(dataTexture, vUv);

    float totalInk = finalData.r;
    float alpha = finalData.g;
    float inkDisperse = 4.0;

    if ( totalInk > inkDisperse ) totalInk -= inkDisperse;

    vec4 dataUp = texture(dataTexture, vec2(vUv.x, vUv.y + step.y));
    if ( dataUp.r > inkDisperse ) {
        totalInk += 1.0;
        alpha += dataUp.g;
        mixers += 1.0;
    }

    vec4 dataDown = texture(dataTexture, vec2(vUv.x, vUv.y - step.y));
    if ( dataDown.r > inkDisperse ) {
        totalInk += 1.0;
        alpha += dataDown.g;
        mixers += 1.0;
    }

    vec4 dataRight = texture(dataTexture, vec2(vUv.x + step.x, vUv.y));
    if ( dataRight.r > inkDisperse ) {
        totalInk += 1.0;
        alpha += dataRight.g;
        mixers += 1.0;
    }

    vec4 dataLeft = texture(dataTexture, vec2(vUv.x - step.x, vUv.y));
    if ( dataLeft.r > inkDisperse ) {
        totalInk += 1.0;
        alpha += dataLeft.g;
        mixers += 1.0;
    }

    if ( totalInk > dryRate ) totalInk -= dryRate;

    finalData.r = totalInk;
    finalData.g = alpha/mixers; // background percentage

    gl_FragColor = finalData;
}