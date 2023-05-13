//#define PAINT_COLOR vec3(0.549,0.000,1.000)
//#define BRUSH_SIZE 40.
//#define EXPANSE 20.
//#define DISPERSE 1.
//
//#define R iResolution.xy
//#define A(U) texture(iChannel0,(U)/R)
//#define B(U) texture(iChannel1,(U)/R)
//#define C(U) texture(iChannel2,(U)/R)
//#define D(U) texture(iChannel3,(U)/R)
//#define Main void mainImage(out vec4 Q, in vec2 U)
//#define box for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)
//#define r2 0.70710678118

float hash(vec2 p) // Dave H
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float Paper (vec2 U) { //https://www.shadertoy.com/view/NsfXWs
    float h = .005*(sin(.6*U.x+.1*U.y)+sin(.7*U.y-.1*U.x));
    for (float x = -1.; x<=1.;x++)
    for (float y = -1.; y<=1.;y++){
        h += .15*.125*hash(U+vec2(x,y));
    }
    return h;
}

uniform sampler2D iTextureA;
uniform sampler2D iTextureB;
uniform sampler2D iTextureC;
uniform sampler2D iTextureD;
uniform vec2 iResolution;
uniform vec3 iPaintColor;
uniform vec2 iPen;
uniform float iPenDown;
uniform float iDisperse;
uniform float iExpanse;
uniform float iBrushSize;
uniform float iFrame;

varying vec2 vUv;