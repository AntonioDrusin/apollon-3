// advect

void main()
{
    vec4 Q = texture(iTextureA,vUv);
    vec4 dQ = vec4(0);

    for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++) {
        if(abs(x)!=abs(y))
        {
            vec2 u = vec2(x,y);
            vec4 q = texture(iTextureA,(vUv+u/iResolution.xy));
            vec2 a = Q.xy,
            b = q.xy+u;
            float ab = dot(u,b-a);
            float i = dot(u,(0.5*u-a))/ab;
            float j = .5+.5*max(1.-Q.w*q.w,0.);
            float k = .5+.5*max(1.-Q.w*q.w,0.);
            float wa = 0.25*Q.w*min(i,j)/j;
            float wb = 0.25*q.w*max(k+i-1.,0.)/k;
            dQ.xyz += Q.xyz*wa+q.xyz*wb;
            dQ.w += wa+wb;

        }
    }

    if (dQ.w>0.)dQ.xyz/=dQ.w;
    Q = dQ;

    if (vUv.x*iResolution.x < 4.||iResolution.x-vUv.x*iResolution.x<4.) Q.xy *= 0.;
    if (vUv.y*iResolution.y < 4.||iResolution.y-vUv.y*iResolution.y<4.) Q.xy *= 0.;

    gl_FragColor = Q;
}