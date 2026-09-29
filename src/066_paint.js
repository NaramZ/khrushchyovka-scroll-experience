
// ───────────────────────── PAINT — a scan repainted in soft gaussian brush strokes ─────────────────────────
// The lit frame is re-drawn as overlapping elliptical gaussian strokes (an anisotropic Kuwahara filter):
// strokes follow the image's own structure — along edges, along the road towards you — so colour stays coherent
// and forms stay readable, while flat areas melt into painted patches. An autofocus keeps what you look at crisp
// and lets the foreground, the far distance and the frame edges dissolve into larger, looser strokes.
const PAINT={level:.7,brush:1.2,focus:.6,strokes:.75};
// the memory dial: 0 is the scene as set above, 1 is a faded memory — full paint, huge brushes, nothing held in focus
const MEMORY={v:0,target:0};const memMix=(a,b)=>a+(b-a)*MEMORY.v;
const quadVS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
class PaintPass extends Pass{constructor(opts={}){super();this.needsSwap=true;this.fixed=opts.fixed||null;
 const o={type:THREE.HalfFloatType,depthBuffer:false};this.tA=new THREE.WebGLRenderTarget(4,4,o);this.tB=new THREE.WebGLRenderTarget(4,4,o);this.fs=new FullScreenQuad(null);
 // 1 · structure tensor of the image (half resolution)
 this.mTensor=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},uTexel:{value:new THREE.Vector2()}},vertexShader:quadVS,depthTest:false,depthWrite:false,
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uTexel;varying vec2 vUv;float L(vec2 o){vec3 c=sqrt(max(texture2D(tDiffuse,vUv+o*uTexel).rgb,0.));return dot(c,vec3(.3,.59,.11));}
  void main(){float tl=L(vec2(-1,1)),t=L(vec2(0,1)),tr=L(vec2(1,1)),l=L(vec2(-1,0)),r=L(vec2(1,0)),bl=L(vec2(-1,-1)),b=L(vec2(0,-1)),br=L(vec2(1,-1));
   float gx=(tr+2.*r+br-tl-2.*l-bl)*.25,gy=(tl+2.*t+tr-bl-2.*b-br)*.25;gl_FragColor=vec4(gx*gx,gy*gy,gx*gy,1.);}`});
 // 2 · smooth the tensor so strokes flow instead of jittering
 this.mBlur=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},uTexel:{value:new THREE.Vector2()}},vertexShader:quadVS,depthTest:false,depthWrite:false,
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uTexel;varying vec2 vUv;void main(){vec3 s=vec3(0.);float w=0.;for(int y=-2;y<=2;y++)for(int x=-2;x<=2;x++){float g=exp(-float(x*x+y*y)/5.);s+=texture2D(tDiffuse,vUv+vec2(x,y)*uTexel*2.).xyz*g;w+=g;}gl_FragColor=vec4(s/w,1.);}`});
 // 3 · the strokes (half resolution): 8 overlapping sectors of an ellipse aligned with the local flow; the calmest sector wins
 this.tP=new THREE.WebGLRenderTarget(4,4,o);
 this.mPaint=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},tTensor:{value:null},tDepth:{value:null},uRes:{value:new THREE.Vector2()},uLevel:{value:.6},uBrush:{value:1.2},uFocus:{value:.6},uNear:{value:.1},uFar:{value:900},uHasDepth:{value:0},uAspect:{value:1},uFocusD:{value:10}},
  defines:{RINGS:3,SPOKES:tier===2?14:10},vertexShader:quadVS,depthTest:false,depthWrite:false,
  fragmentShader:`uniform sampler2D tDiffuse,tTensor,tDepth;uniform vec2 uRes;uniform float uLevel,uBrush,uFocus,uNear,uFar,uHasDepth,uAspect,uFocusD;varying vec2 vUv;
  float lin(vec2 uv){float z=texture2D(tDepth,uv).x;if(z>=.99999)return uFar;return (uNear*uFar)/(uFar-z*(uFar-uNear));}
  void main(){vec3 src=texture2D(tDiffuse,vUv).rgb;
   float defocus=.45,farf=0.,sky=0.;if(uHasDepth>.5){float d=lin(vUv);defocus=clamp(abs(log(d/uFocusD))/1.35,0.,1.);farf=smoothstep(45.,260.,d);sky=step(uFar*.99,d);}
   vec2 q=(vUv-.5)*vec2(uAspect,1.);float edge=smoothstep(.28,.9,length(q));
   float s=clamp(max(max(defocus,edge*.9),farf*.8),0.,1.);float strength=mix(1.-uFocus*.85,1.,s);
   float r=uLevel*uBrush*strength*15.*(uRes.y/900.)+sky*uLevel*uBrush*6.*(uRes.y/900.);
   float mask=clamp((r-.8)/2.5,0.,1.);if(mask<=0.||sky>.5){gl_FragColor=vec4(src,sky>.5?0.:r/20.);return;}
   vec3 t=texture2D(tTensor,vUv).xyz;float E=t.x,F=t.y,G=t.z,Dd=sqrt((E-F)*(E-F)+4.*G*G),l1=.5*(E+F+Dd),l2=.5*(E+F-Dd);
   vec2 v=vec2(l1-E,-G);vec2 dir=length(v)>1e-7?normalize(v):vec2(0.,1.);vec2 per=vec2(-dir.y,dir.x);float A=(l1+l2>1e-7)?(l1-l2)/(l1+l2):0.;
   float a=r*clamp(1.+A*1.6,.3,2.4),b=r*clamp(1./(1.+A*1.6),.3,2.4);
   vec3 c0=sqrt(max(src,0.));
   // sector k and k+4 are opposite: cos(th-(k+4)π/4)=-cos(th-kπ/4), so 8 sectors live in two vec4 lanes per channel
   vec4 rL=vec4(c0.r*.2),gL=vec4(c0.g*.2),bL=vec4(c0.b*.2),rH=rL,gH=gL,bH=bL,qL=vec4(dot(c0,c0)*.2),qH=qL,wL=vec4(.2),wH=wL;
   for(int i=1;i<=RINGS;i++){float rho=float(i)/float(RINGS);float g=exp(-2.*rho*rho);
    for(int j=0;j<SPOKES;j++){float th=(float(j)+.5*mod(float(i),2.))/float(SPOKES)*6.2831853;vec2 u=vec2(cos(th),sin(th));
     vec3 c=sqrt(max(texture2D(tDiffuse,vUv+(dir*u.x*a*rho+per*u.y*b*rho)/uRes).rgb,0.));float cc=dot(c,c);
     vec4 cs=cos(th-vec4(0.,.7853982,1.5707963,2.3561945));vec4 lo=max(cs-.38,0.)*g,hi=max(-cs-.38,0.)*g;
     rL+=c.r*lo;gL+=c.g*lo;bL+=c.b*lo;qL+=cc*lo;wL+=lo;rH+=c.r*hi;gH+=c.g*hi;bH+=c.b*hi;qH+=cc*hi;wH+=hi;}}
   vec4 mrL=rL/wL,mgL=gL/wL,mbL=bL/wL,mrH=rH/wH,mgH=gH/wH,mbH=bH/wH;
   vec4 vL=abs(qL/wL-(mrL*mrL+mgL*mgL+mbL*mbL)),vH=abs(qH/wH-(mrH*mrH+mgH*mgH+mbH*mbH));
   vec4 kL=1./(1.+pow(vL*260.,vec4(4.))),kH=1./(1.+pow(vH*260.,vec4(4.)));float wt=dot(kL,vec4(1.))+dot(kH,vec4(1.));
   vec3 acc=vec3(dot(mrL,kL)+dot(mrH,kH),dot(mgL,kL)+dot(mgH,kH),dot(mbL,kL)+dot(mbH,kH));
   vec3 res=acc/wt;res*=res;gl_FragColor=vec4(res,r/20.);}`});
 // 4 · visible brush strokes: elongated soft-edged dabs seeded on two grids (fine + coarse), each oriented along the flow,
 //     coloured from the painted layer, with bristle streaks and a slight per-stroke tone shift; layered, most-covering wins
 this.mComp=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},tPaint:{value:null},tTensor:{value:null},uRes:{value:new THREE.Vector2()},uCell:{value:10},uStroke:{value:.75}},vertexShader:quadVS,depthTest:false,depthWrite:false,
  fragmentShader:`uniform sampler2D tDiffuse,tPaint,tTensor;uniform vec2 uRes;uniform float uCell,uStroke;varying vec2 vUv;
  vec3 h3(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+33.33);return fract((p3.xxy+p3.yzz)*p3.zyx);}
  vec4 strokes(vec2 px,float cell,vec3 pc){vec3 spc=sqrt(max(pc,0.));vec2 g=floor(px/cell);vec3 acc=vec3(0.);float ws=0.,cv=0.;
   for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=g+vec2(float(i),float(j));vec3 h=h3(c);vec2 seed=(c+.15+h.xy*.7)*cell;vec2 suv=seed/uRes;
    vec3 t=texture2D(tTensor,suv).xyz;float E=t.x,F=t.y,G=t.z,Dd=sqrt((E-F)*(E-F)+4.*G*G),l1=.5*(E+F+Dd),l2=.5*(E+F-Dd);vec2 v=vec2(l1-E,-G);
    vec2 dir=length(v)>1e-7?normalize(v):vec2(0.,1.);float A=(l1+l2>1e-7)?(l1-l2)/(l1+l2):0.;float ang=(h.z-.5)*.5*(1.-A);dir=vec2(dir.x*cos(ang)-dir.y*sin(ang),dir.x*sin(ang)+dir.y*cos(ang));
    vec2 d=px-seed;float al=dot(d,dir),ac=dot(d,vec2(-dir.y,dir.x));float L=min(cell*(.62+A*.7)*(.8+.45*h.x),cell*1.1),W=min(cell*.3*(.75+.5*h.y),cell*.5);
    float e=al*al/(L*L)+ac*ac/(W*W);float cov=1.-smoothstep(.45,1.,e);if(cov<=0.)continue;
    vec3 col=texture2D(tPaint,suv).rgb;float br=sin(ac/W*10.+h.x*31.)*.5+.5;br*=.6+.4*sin(al/L*3.1+h.y*17.);float tip=smoothstep(1.,.3,abs(al)/L);
    col*=1.+uStroke*((br-.5)*.16*tip+(h.z-.5)*.1);
    vec3 dc=sqrt(max(col,0.))-spc;float sim=exp(-dot(dc,dc)*38.);float w=pow(cov,5.)*(.15+h.z*h.z)*sim;cov*=sim;acc+=col*w;ws+=w;cv=max(cv,cov);}
   return vec4(acc/max(ws,1e-5),cv);}
  void main(){vec4 s=texture2D(tDiffuse,vUv);vec4 p=texture2D(tPaint,vUv);float r=p.a*20.;float mask=clamp((r-.8)/2.5,0.,1.);if(mask<=0.){gl_FragColor=s;return;}
   vec2 px=vUv*uRes;float cs=max(4.,uCell*uRes.y/900.);float big=smoothstep(3.,11.,r);vec4 st;if(big<.3)st=strokes(px,cs,p.rgb);else if(big>.7)st=strokes(px,cs*2.3,p.rgb);else st=mix(strokes(px,cs,p.rgb),strokes(px,cs*2.3,p.rgb),(big-.3)/.4);
   vec3 painted=mix(p.rgb,st.rgb,clamp(st.a*1.4,0.,1.)*uStroke);gl_FragColor=vec4(mix(s.rgb,painted,mask),s.a);}`})}
 setSize(w,h){const hw=Math.max(1,w>>1),hh=Math.max(1,h>>1);this.tA.setSize(hw,hh);this.tB.setSize(hw,hh);this.tP.setSize(hw,hh);this.mPaint.uniforms.uRes.value.set(hw,hh);this.mPaint.uniforms.uAspect.value=w/h;this.mComp.uniforms.uRes.value.set(w,h);this.mTensor.uniforms.uTexel.value.set(1/w,1/h);this.mBlur.uniforms.uTexel.value.set(2/w,2/h)}
 render(renderer,writeBuffer,readBuffer){const P=this.mPaint.uniforms,F=this.fixed;const mLevel=F?F.level:memMix(PAINT.level,1),mBrush=F?F.brush:memMix(PAINT.brush,2.9);P.uLevel.value=mLevel;P.uBrush.value=mBrush;P.uFocus.value=F?F.focus:memMix(PAINT.focus,0);
  if(mLevel<=.001){this.fs.material=copyMat;copyMat.uniforms.tDiffuse.value=readBuffer.texture;renderer.setRenderTarget(this.renderToScreen?null:writeBuffer);this.fs.render(renderer);return}
  this.mTensor.uniforms.tDiffuse.value=readBuffer.texture;this.fs.material=this.mTensor;renderer.setRenderTarget(this.tA);this.fs.render(renderer);
  this.mBlur.uniforms.tDiffuse.value=this.tA.texture;this.fs.material=this.mBlur;renderer.setRenderTarget(this.tB);this.fs.render(renderer);
  const hasD=!F&&!!(gtao&&gtao.enabled);P.uHasDepth.value=hasD?1:0;if(hasD){P.tDepth.value=gtao.depthTexture;P.uNear.value=camera.near;P.uFar.value=camera.far;P.uFocusD.value=paintFocus}
  P.tDiffuse.value=readBuffer.texture;P.tTensor.value=this.tB.texture;this.fs.material=this.mPaint;renderer.setRenderTarget(this.tP);this.fs.render(renderer);
  const C=this.mComp.uniforms;C.tDiffuse.value=readBuffer.texture;C.tPaint.value=this.tP.texture;C.tTensor.value=this.tB.texture;C.uCell.value=(6+mBrush*mLevel*9)*1.75;C.uStroke.value=F?F.strokes:memMix(PAINT.strokes,.9);this.fs.material=this.mComp;renderer.setRenderTarget(this.renderToScreen?null:writeBuffer);this.fs.render(renderer)}}
const copyMat=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null}},vertexShader:quadVS,fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=texture2D(tDiffuse,vUv);}',depthTest:false,depthWrite:false});
// autofocus: follow the distance of whatever sits in the middle of the frame (a ray, smoothed like a lens)
let paintFocus=12;const _fr=new THREE.Raycaster();_fr.firstHitOnly=true;const _fc=new THREE.Vector2(0,.04);let _ft=0;
function updateFocus(dt){if(++_ft%6)return;_fr.setFromCamera(_fc,camera);_fr.far=600;const h=_fr.intersectObjects(SOLIDS.filter(o=>o.visible&&o.parent.visible),false);const d=zone==='newflat'?2.6:h.length?h[0].distance:300;paintFocus=lerp(paintFocus,clamp(d,.6,300),.35)}
let paint=null;if(composer){paint=new PaintPass();const idx=composer.passes.indexOf(bloom);composer.insertPass(paint,idx<0?1:idx);paint.setSize(innerWidth*pixelRatio,innerHeight*pixelRatio)}
