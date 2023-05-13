// Advect

void main()
{
    vec4 Q = texture(iTextureA,vUv);
    vec4 Qb = texture(iTextureB,vUv);
    vec4 dQ = vec4(0);
    for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++) {
        if(abs(x)!=abs(y))
        {
            vec2 u = vec2(x,y);
            vec4 q = texture(iTextureA,(vUv+u/iResolution.xy));
            vec4 qb = texture(iTextureB,(vUv+u/iResolution.xy));

            vec2 a = Q.xy;
            vec2 b = q.xy+u;
            float ab = dot(u,b-a);
            float i = dot(u,(0.5*u-a))/ab;
            float j = .5;
            float k = .5;
            float wa = 0.25*Q.w*min(i,j)/j;
            float wb = 0.25*q.w*max(k+i-1.,0.)/k;
            dQ.xyz += Qb.xyz*wa+qb.xyz*wb;
            dQ.w += wa+wb;

        }
    }
    if (dQ.w>0.)dQ.xyz/=dQ.w;
    Q = dQ;
    if (iPenDown>0.&&length(vUv*iResolution.xy-iPen)<iBrushSize)
    Q = vec4(1.-iPaintColor,1);

    gl_FragColor = Q;

    /*    if (iFrame<1)
            Q = 0.5+0.5*sin(vec4(1,2,3,4)*4.*length(U-0.5*R)/R.x);*/
}