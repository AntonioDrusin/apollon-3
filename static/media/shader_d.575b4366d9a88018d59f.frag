void main() {
    vec4 Q = texture(iTextureD,vUv);
    vec4 a = texture(iTextureA,vUv);
    vec4 c = texture(iTextureC,vUv)*a.w;

    Q = mix(Q,c,.001*a.w*a.w);

    gl_FragColor = Q;
}