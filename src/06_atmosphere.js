
// ───────────────────────── ATMOSPHERE — gaussian splats as ambience, never as a surface finish ─────────────────────────
// Every splat is a camera-facing gaussian (alpha = e^{-4r²}) with a world-space diameter, soft near-fade and fog.
const maxPoint=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1]||256;
const splatSets=[],atmosphere=[];
function splatMaterial({additive=false,drift=0,near=1.5,opacity=1,fall=0,aniso=1,clump=0}={}){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
 uniforms:{uTime:{value:0},uScale:{value:600},uOpacity:{value:opacity},uDrift:{value:drift},uNear:{value:near},uFall:{value:fall},uFogDensity:{value:scene.fog.density},uFogColor:{value:FOG},uMax:{value:maxPoint},uAniso:{value:aniso},uClump:{value:clump},uScan:WX.uScan,uTint:{value:new THREE.Color(1,1,1)}},
 vertexShader:`attribute float aSize;attribute float aAlpha;attribute float aSeed;attribute vec3 color;uniform float uScan,uTime,uScale,uOpacity,uDrift,uNear,uFall,uFogDensity,uMax;uniform vec3 uFogColor,uTint;varying vec3 vColor;varying float vAlpha;varying float vRot;
 void main(){vRot=aSeed*6.2831;vec3 p=position;float t=uTime*.18+aSeed*43.17;p+=uDrift*vec3(sin(t*1.31+aSeed*11.)+.5*sin(t*.37),.6*sin(t*.93+aSeed*5.),cos(t*1.07+aSeed*7.)+.5*cos(t*.41));
  if(uFall>0.){float c=mod(uTime*uFall*(.6+aSeed)+aSeed*20.,1.);p.y-=c*p.y*.95;p.x+=sin(uTime*.7+aSeed*9.)*c*1.5;}
  vec4 mv=modelViewMatrix*vec4(p,1.);float d=-mv.z;gl_Position=projectionMatrix*mv;float farS=smoothstep(12.,90.,length(max(abs(p.xz)-vec2(12.,6.),0.)));float s=aSize*(1.+uScan*farS*1.6)*uScale/max(d,.001),px=clamp(s,2.,uMax);gl_PointSize=px;
  float f=1.-exp(-uFogDensity*uFogDensity*d*d);vColor=mix(color*uTint,uFogColor,f*.9);vAlpha=aAlpha*uOpacity*smoothstep(uNear*.3,uNear,d)*(1.-f*.5)*min(1.,s*s/(px*px));}`,
 fragmentShader:`uniform float uAniso,uClump;varying vec3 vColor;varying float vAlpha;varying float vRot;void main(){vec2 p0=gl_PointCoord*2.-1.;float r0=dot(p0,p0);float a;vec3 col=vColor;
 if(uClump>.5){a=0.;float sh=1.;for(int k=0;k<7;k++){float fk=float(k),ang=vRot*3.1+fk*2.39996;vec2 o=vec2(cos(ang),sin(ang))*(.12+.55*fract(vRot*1.7+fk*.371));vec2 q=p0-o;float b=ang*1.7+vRot,cb=cos(b),sb=sin(b);q=vec2(cb*q.x-sb*q.y,sb*q.x+cb*q.y);q.y*=2.3;float g=exp(-10.*dot(q,q));if(g>a){a=g;sh=.78+.42*fract(fk*.618+vRot);}}a*=vAlpha*(1.-smoothstep(.6,1.,r0));col*=sh;}
 else{float c=cos(vRot),s=sin(vRot);vec2 p=vec2(c*p0.x-s*p0.y,s*p0.x+c*p0.y);p.y/=uAniso;float r2=dot(p,p);a=exp(-4.*r2)*vAlpha*step(r2,1.);}
 a*=step(r0,1.);gl_FragColor=vec4(col,a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`})}
const D=()=>({p:[],c:[],s:[],a:[],r:[]});const col=new THREE.Color(),col2=new THREE.Color();
function push(d,x,y,z,c,s,a){d.p.push(x,y,z);d.c.push(c.r,c.g,c.b);d.s.push(s);d.a.push(a);d.r.push(rnd())}
function shuffle(d){const n=d.s.length;for(let i=n-1;i>0;i--){const j=Math.floor(rnd()*(i+1));for(const[k,w]of[['p',3],['c',3],['s',1],['a',1],['r',1]]){const A=d[k];for(let q=0;q<w;q++){const t=A[i*w+q];A[i*w+q]=A[j*w+q];A[j*w+q]=t}}}return d}
function geoFrom(data){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(data.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(data.c,3));g.setAttribute('aSize',new THREE.Float32BufferAttribute(data.s,1));g.setAttribute('aAlpha',new THREE.Float32BufferAttribute(data.a,1));g.setAttribute('aSeed',new THREE.Float32BufferAttribute(data.r,1));g.computeBoundingSphere();g.userData.count=data.s.length;return g}
function splats(name,data,opts,parent=scene,isAtmos=true){const o=new THREE.Points(geoFrom(data),splatMaterial(opts));o.name=name;o.frustumCulled=true;o.renderOrder=opts.order||0;parent.add(o);splatSets.push(o);if(isAtmos)atmosphere.push(o);return o}
function refill(o,data){o.geometry.dispose();o.geometry=geoFrom(data);o.visible=data.s.length>0&&(!atmosphere.includes(o)||atmosOn)}
let atmosOn=true;

// ───────────────────────── SEASONS — the same Zone-like overcast, four ways ─────────────────────────
const SEASONS={
 winter:{ru:'ЗИМА',en:'Winter',fog:'#c5ccce',fogD:.0085,sky:['#aeb8bd','#c4ccce','#d3d9d9','#ccd2d1','#9aa09f'],sun:['#eef2f6',.45],hemi:['#dde5ea','#9aa0a0',1.1],env:1,wet:0,snow:1,sat:.6,tint:[.95,.99,1.03],grass:'#6d6f5e',litter:[],litterN:0,flowers:0,flowerCols:[],dirt:'#7a7064',precip:1,precipA:.9,inTint:'#e3ecf2',mist:.8,sunDir:[-.3,.35,.6],skyO:{glow:.25},lift:[.012,.017,.02],exp:1.05,inI:.8,lamp:1.25,inAmb:.85,inExp:1.06,bloom:.32},
 spring:{ru:'ВЕСНА',en:'Spring',fog:'#c3d0cd',fogD:.0048,sky:['#7ea6cb','#a2c0d6','#c7d7db','#d1d9d2','#7f8c6a'],sun:['#fff3dd',2.3],hemi:['#d3e2ea','#5f6c48',1.0],env:.95,wet:.2,snow:0,sat:.96,tint:[.99,1.02,.98],grass:'#6f9442',litter:[],litterN:0,flowers:12000,flowerCols:['#e6d34a','#f2eee0','#d8c93e','#f4f2ea'],dirt:'#6b5a42',precip:3,precipA:.3,inTint:'#f3f0e2',mist:.55,
  sunDir:[-.5,.55,.66],skyO:{glow:.6,disc:.75,clouds:60,dark:.06},lift:[.006,.009,.009],exp:.97,inI:1.3,lamp:.45,inAmb:1.3,inExp:1,bloom:.36},
 summer:{ru:'ЛЕТО',en:'Summer',fog:'#c9d4d9',fogD:.0034,sky:['#4f86c0','#79a6d2','#b1cadb','#d2d8d0','#7b8664'],sun:['#ffebc6',3.4],hemi:['#c4d9ec','#6d6a48',1.05],env:1.05,wet:0,snow:0,sat:1.06,tint:[1.05,1.01,.92],grass:'#5a7a32',litter:[],litterN:0,flowers:5000,flowerCols:['#f4f2ea','#e8d840'],dirt:'#8a7a5c',precip:3,precipA:.6,inTint:'#ffe8c6',mist:.35,
  sunDir:[-.42,.66,.62],skyO:{glow:.9,disc:1,clouds:40,dark:0},lift:[.008,.006,.004],exp:.9,inI:1.45,lamp:.3,inAmb:1.35,inExp:.95,bloom:.42},
 autumn:{ru:'ОСЕНЬ',en:'Autumn',fog:'#a9b3aa',fogD:.0078,sky:['#8e9b96','#a7b1aa','#b9c1b8','#b3bab0','#7d8278'],sun:['#e6ece6',.55],hemi:['#c7d1cd','#4d4c42',.95],env:.85,wet:.55,snow:0,sat:.7,tint:[.93,1,.97],grass:'#676a48',litter:['#b58a3a','#c9a045','#8e5a2a','#a8703a'],litterN:220,flowers:0,flowerCols:[],dirt:'#6f604a',precip:2,precipA:.45,inTint:'#dce7e3',mist:1.1,sunDir:[-.32,.82,.48],skyO:{},lift:[.012,.017,.016],exp:1.05,inI:1,lamp:1,inAmb:1,inExp:1,bloom:.32}};
const CANOPY={
 autumn:{k:.85,birch:['#cdb04c','#bfa040','#d6c066','#a08b40','#948646'],linden:['#ad8834','#bf9c4c','#877638','#9a6a30','#c6ad5c'],maple:['#a8562e','#bb6e34','#903f26','#c8883e','#77492a'],poplar:['#86883e','#9d9648','#6c783c','#b5a24c','#5e6838']},
 spring:{k:.62,birch:['#a9bf6a','#bccf7e','#93aa5a','#c8d68e'],linden:['#8fae5c','#a2bf6c','#7f9e4e'],maple:['#9cb85e','#b0c870','#86a24e'],poplar:['#8aa65a','#9fba68','#7a9650'],blossom:['#efeae2','#f0e2e6','#e9dde2','#f6f2ea']},
 summer:{k:1,birch:['#5f7c3a','#6f8a44','#566f34','#7a9048'],linden:['#4c6a32','#577838','#44602c'],maple:['#4a6630','#5a7a38','#40582a'],poplar:['#50693a','#627c42','#475e34']},
 winter:{k:0}};
const spruceCols=['#2e4330','#36503a','#28392b','#3d5640'];
const density=tier===0?6:tier===1?16:30,_v=new THREE.Vector3();
const canopySet=splats('canopy',D(),{drift:.04,near:3.2,clump:1},scene,false),haloSet=splats('canopy-halo',D(),{drift:.06,near:5},scene,false),leafSet=splats('leaves',D(),{drift:.25,near:.8,fall:.05,aniso:.45},scene,false),snowCapSet=splats('snowcaps',D(),{drift:.01,near:2,aniso:.55},scene,false);
function buildCanopies(season){const P=CANOPY[season],canopy=D(),halo=D(),leaves=D(),caps=D();
 for(const t of trees){
  if(t.type==='spruce'){const n=Math.round(t.h*t.h*(density*.55));for(let i=0;i<n;i++){const hy=t.h*rand(.12,1),rr=(1-(hy-t.h*.12)/(t.h*.88))*t.h*.3,a=rnd()*6.283,d=rr*Math.sqrt(rand(.25,1)),x=t.x+Math.cos(a)*d,z=t.z+Math.sin(a)*d;col.set(pick(spruceCols)).multiplyScalar(rand(.7,1.15));const snowy=season==='winter'&&rnd()<.34;if(snowy){col.set('#e6ebee').multiplyScalar(rand(.85,1));push(caps,x,hy+.05,z,col,rand(.18,.36),rand(.6,.9))}else push(canopy,x,hy,z,col,rand(.45,.85),rand(.8,1))}continue}
  const blossom=season==='spring'&&(t.type==='linden'||t.type==='maple')&&((t.x*7.3+t.z*3.1)%1+1)%1<.3;
  for(const cl of t.clusters){
   if(!P.k){const n=Math.round(cl.r*cl.r*5);for(let i=0;i<n;i++){_v.set(rand(-1,1),rand(-.2,1),rand(-1,1)).multiplyScalar(cl.r*.8);col.set('#e8edf0').multiplyScalar(rand(.85,1));push(caps,cl.c[0]+_v.x,cl.c[1]+_v.y*.7,cl.c[2]+_v.z,col,rand(.1,.22),rand(.45,.8))}continue}
   const pal=blossom?P.blossom:P[t.type],n=Math.round(cl.r*cl.r*density*P.k),clumps=[];for(let k=0;k<7;k++){_v.set(rand(-1,1),rand(-.8,.9),rand(-1,1)).normalize().multiplyScalar(cl.r*rand(.25,.8));clumps.push([cl.c[0]+_v.x,cl.c[1]+_v.y*.8,cl.c[2]+_v.z,cl.r*rand(.28,.5)])}
   for(let i=0;i<n;i++){const[kx,ky,kz,kr]=pick(clumps);const x=kx+(rnd()+rnd()+rnd()-1.5)*kr,y=ky+(rnd()+rnd()+rnd()-1.5)*kr*.8,z=kz+(rnd()+rnd()+rnd()-1.5)*kr;_v.set(x-t.x,y-cl.c[1]+.4*cl.r,z-t.z).normalize();
    const lit=.62+.45*Math.max(0,_v.y)+.1*(y/t.h);col.set(pick(pal)).multiplyScalar(lit*rand(.6,1.25));if(lit<.75)col.lerp(col2.set('#46514e'),.2);
    if(rnd()<.06)push(halo,x,y,z,col,rand(.8,1.3),rand(.08,.16));else push(canopy,x,y,z,col,rand(.55,1.05),rand(.75,1))}}
  if(season==='autumn')for(let i=0;i<7;i++){col.set(pick(P[t.type]));push(leaves,t.x+rand(-3,3),t.h*rand(.5,.9),t.z+rand(-3,3),col,rand(.06,.1),.9)}}
 refill(canopySet,canopy);refill(haloSet,halo);refill(leafSet,leaves);refill(snowCapSet,caps)}
// potted plants indoors never change
{const plants=D();for(const pl of plantSpots)for(let i=0;i<pl.n;i++){const a=rnd()*6.283,r=Math.sqrt(rnd())*pl.r;col.set(pick(pl.pal)).multiplyScalar(rand(.7,1.2));push(plants,pl.x+Math.cos(a)*r,pl.y+rand(-pl.h,pl.h)*(1-r/pl.r*.5),pl.z+Math.sin(a)*r,col,pl.small?rand(.025,.045):pl.big?rand(.07,.14):rand(.04,.08),rand(.8,1))}splats('plants',plants,{drift:.002,near:.05,clump:1},scene,false)}
// the same plants, carried into the new flat across the road (shown by homeUpdate)
{const sp=D();for(const pl of SITE_PLANTS)for(let i=0;i<pl.n;i++){const a=rnd()*6.283,r=Math.sqrt(rnd())*pl.r;col.set(pick(pl.pal)).multiplyScalar(rand(.7,1.2));push(sp,pl.x+Math.cos(a)*r,pl.y+rand(-pl.h,pl.h)*(1-r/pl.r*.5),pl.z+Math.sin(a)*r,col,pl.small?rand(.025,.045):pl.big?rand(.07,.14):rand(.04,.08),rand(.8,1))}if(SITE_PLANTS.length){const o=splats('siteplants',sp,{drift:.002,near:.05,clump:1},scene,false);o.visible=false}}

// ── the far city: distant slabs exist only as sampled gaussian fields that dissolve into the haze
{const far=D();for(const b of farBlocks){const faces=[[b.len,b.h,0],[b.len,b.h,1],[b.depth,b.h,2],[b.depth,b.h,3],[b.len,b.depth,4]];const c=Math.cos(b.rot),s=Math.sin(b.rot);
 for(const[w,h,f]of faces){const n=Math.round(w*h*(tier===0?.012:.045));for(let i=0;i<n;i++){let lx,ly,lz,u=rand(-w/2,w/2),v=rand(0,h);if(f<2){lx=u;lz=(f?1:-1)*b.depth/2;ly=v}else if(f<4){lz=u;lx=(f===2?1:-1)*b.len/2;ly=v}else{lx=u;lz=rand(-b.depth/2,b.depth/2);ly=b.h}
  const x=b.cx+lx*c+lz*s,z=b.cz-lx*s+lz*c,win=f<4&&(ly%2.8)>.9&&(ly%2.8)<2.2&&(Math.abs(u)%3)>.8&&(Math.abs(u)%3)<2.3;col.set(win?'#6c7474':pick(['#b9bbb3','#aaaca4','#c4c6bd']));col.multiplyScalar(f===4?1.05:rand(.85,1));push(far,x,ly,z,col,rand(1.3,2.6),rand(.45,.7))}}}
 splats('far-city',far,{drift:0,near:20})}
const farTreeSet=splats('far-trees',D(),{drift:0,near:20});
const farTreePos=[];for(let i=0;i<420;i++){const a=rand(0,Math.PI*2),r=rand(110,280);farTreePos.push([Math.cos(a)*r,Math.sin(a)*r])}
function buildFarTrees(season){const d=D(),pal={autumn:['#8a7a44','#9c8646','#6a6a40','#a88c42','#76683c'],spring:['#8aa062','#9cb26c','#7a9056'],summer:['#4f6636','#5b723c','#46592f'],winter:['#6b6660','#7a746c','#8a857d','#d8dde0']}[season];
 for(const[x,z]of farTreePos)for(let k=0;k<(season==='winter'?8:14);k++){col.set(pick(pal)).multiplyScalar(rand(.8,1.1));push(d,x+rand(-4,4),rand(2,11),z+rand(-4,4),col,rand(2,4),season==='winter'?rand(.2,.4):rand(.35,.6))}refill(farTreeSet,d)}
// ── haze: horizon veils and low ground mist in the colour of the season's fog
const hazeSet=splats('haze',D(),{drift:2.5,near:14,order:-1});
function buildHaze(S){const d=D();for(let i=0;i<520;i++){const a=rand(0,Math.PI*2),r=rand(150,380);col.set(S.fog).lerp(col2.set('#e8ebe4'),rand(0,.3));push(d,Math.cos(a)*r,rand(0,42),Math.sin(a)*r,col,rand(35,90),rand(.05,.13))}
 for(let i=0;i<Math.round(260*S.mist);i++){const a=rand(0,Math.PI*2),r=rand(22,140);col.set(S.fog).lerp(col2.set('#eef0ea'),.35);push(d,Math.cos(a)*r,rand(.3,4.5),Math.sin(a)*r,col,rand(8,24),rand(.04,.08))}refill(hazeSet,d)}

// ── precipitation: snow, drizzle, or June's poplar fluff — a volume that travels with the eye, sheltered by the building
const PRE_N=tier===2?9000:tier===1?4000:1200;
const precip=(()=>{const g=new THREE.BufferGeometry(),p=new Float32Array(PRE_N*3),s=new Float32Array(PRE_N);for(let i=0;i<PRE_N;i++){p[i*3]=rnd();p[i*3+1]=rnd();p[i*3+2]=rnd();s[i]=rnd()}g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('aSeed',new THREE.BufferAttribute(s,1));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uCam:{value:new THREE.Vector3()},uBox:{value:new THREE.Vector3(46,26,46)},uTime:{value:0},uScale:{value:600},uMode:{value:2},uOpacity:{value:.7},uMax:{value:maxPoint},uFogDensity:{value:.01},uFogColor:{value:FOG}},
  vertexShader:`attribute float aSeed;uniform vec3 uCam,uBox,uFogColor;uniform float uTime,uScale,uMode,uOpacity,uMax,uFogDensity;varying float vA;varying float vStreak;varying vec3 vC;
  void main(){bool snow=uMode<1.5,rain=uMode>1.5&&uMode<2.5;float sp=snow?1.1:rain?8.5:.22;vec3 p=position*uBox;p.y-=uTime*sp*(.7+.6*aSeed);float sw=snow?.9:rain?.05:1.8;
   p.x+=sin(uTime*.5+aSeed*31.)*sw+uTime*(rain?.2:.45);p.z+=cos(uTime*.43+aSeed*17.)*sw;vec3 o=uCam-uBox*.5;p=o+mod(p-o,uBox);
   float inside=step(abs(p.x),12.15)*step(abs(p.z),6.15)*step(p.y,35.2);vec4 mv=modelViewMatrix*vec4(p,1.);float d=-mv.z;gl_Position=projectionMatrix*mv;
   float size=snow?.035+.035*aSeed:rain?.012:.05+.04*aSeed;float s=size*uScale/max(d,.01);float px=rain?clamp(s*24.,2.,min(uMax,90.)):clamp(s,1.5,uMax);gl_PointSize=px;
   float f=1.-exp(-uFogDensity*uFogDensity*d*d);vStreak=rain?1.:0.;vA=uOpacity*(1.-inside)*step(0.,p.y)*(rain?smoothstep(2.,6.,d):smoothstep(.3,1.4,d))*(1.-f)*(rain?1.:min(1.,s*s/2.25));vC=mix(rain?vec3(.8,.85,.84):vec3(.95,.96,.97),uFogColor,f*.5);}`,
  fragmentShader:`varying float vA;varying float vStreak;varying vec3 vC;void main(){vec2 q=gl_PointCoord*2.-1.;float a=vStreak>.5?exp(-q.x*q.x*140.)*(1.-q.y*q.y)*.28:exp(-4.*dot(q,q))*step(dot(q,q),1.);gl_FragColor=vec4(vC,a*vA);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`});const o=new THREE.Points(g,m);o.frustumCulled=false;o.name='precip';scene.add(o);atmosphere.push(o);return o})();

// ───────────────────────── INDOORS: the milky window glow and the dust hanging in it (adjustable) ─────────────────────────
const glow=D(),roomHaze=D(),dust=D();
function windowGlow(x0,x1,y0,y1,zFace,clip,n){for(let i=0;i<n;i++){const sx=rand(x0,x1),sy=rand(y0,y1);_v.set(rand(-.55,.55),rand(-.5,.08),-1).normalize();const t=Math.pow(rnd(),1.6)*4.2,x=sx+_v.x*t,y=sy+_v.y*t,z=zFace+_v.z*t;if(!clip(x,y,z))continue;
 col.set('#ffffff').multiplyScalar(rand(.75,1));push(glow,x,y,z,col,rand(.3,.8),.022*(1-t/4.6));if(rnd()<.85){push(dust,x+rand(-.15,.15),y+rand(-.15,.15),z+rand(-.15,.15),col.set('#ffffff'),rand(.005,.012),rand(.5,1)*(1-t/5))}}}
const inRoom=(x0,x1,z0,z1)=>(x,y,z)=>x>x0&&x<x1&&z>z0&&z<z1&&y>Y+.02&&y<Y+CH;
windowGlow(5.45,7.55,Y+.9,Y+2.25,5.62,inRoom(4.32,8.7,.85,5.7),1300);
windowGlow(2.4,3.6,Y+.9,Y+2.25,5.62,inRoom(1.65,4.2,3.1,5.7),520);
windowGlow(9.15,10.45,Y+.9,Y+2.25,5.62,inRoom(8.82,11.7,.85,5.7),600);windowGlow(10.7,11.35,Y+.1,Y+2.25,5.62,inRoom(8.82,11.7,.85,5.7),380);
const stairFloor=(x,z,y)=>z>3.2?y+1.4:z>.6?(x<-.35?y+1.4*(z-.6)/2.6:x>.35?y+1.4+1.4*(3.2-z)/2.6:y-3):y;
for(let n=0;n<3;n++){const y=yF(n);windowGlow(-.7,.7,y+2.25,y+3.45,5.62,(x,yy,z)=>x>-1.48&&x<1.48&&z>-1.18&&yy>stairFloor(x,z,y)+.02&&yy<y+2.8+1.3,560)}
for(const[x0,x1,z0,z1,n]of[[4.4,8.6,.9,5.6,110],[1.7,4.15,3.15,5.65,40],[8.9,11.6,.9,5.6,60],[1.7,4.15,-1.55,2.9,40],[-1.45,1.45,-1.1,5.6,140]]){for(let i=0;i<n;i++){const yy=x0<0?rand(0,7):rand(Y+.2,Y+2.5);col.set('#ffffff');push(roomHaze,rand(x0,x1),yy,rand(z0,z1),col,rand(.9,1.9),rand(.01,.02))}}
for(const[x0,x1,z0,z1,n]of[[4.4,8.6,.9,5.6,900],[1.7,4.15,3.15,5.65,320],[8.9,11.6,.9,5.6,420],[1.7,4.15,-1.55,2.9,300],[-1.45,1.45,-1.1,5.6,700]]){for(let i=0;i<n;i++){const yy=x0<0?rand(0,7):rand(Y+.1,Y+2.5);push(dust,rand(x0,x1),yy,rand(z0,z1),col.set('#ffffff'),rand(.004,.009),rand(.14,.34))}}
const glowSet=splats('shafts',shuffle(glow),{additive:true,drift:.05,near:1.1}),roomHazeSet=splats('roomhaze',shuffle(roomHaze),{drift:.08,near:.8}),dustSet=splats('dust',shuffle(dust),{additive:true,drift:.12,near:.12});
let hazeLevel=1;
function setIndoorHaze(v){hazeLevel=v;for(const o of[glowSet,roomHazeSet,dustSet]){o.material.uniforms.uOpacity.value=v>1?1+(v-1)*.9:1;o.geometry.setDrawRange(0,Math.round(o.geometry.userData.count*Math.min(1,v)));o.userData.off=v<=0}}

// ───────────────────────── applying a season ─────────────────────────
let season='autumn',fogBase=.0105,envBase=.85,hemiBase=.95,sunBase=.55;
// how light behaves per season, outside and in: exposure, how much daylight the windows let in, whether the lamps are on
let seasonK={exp:1.05,inI:1,lamp:1,inAmb:1,inExp:1,bloom:.32,lift:[.012,.017,.016],sat:.7};
function applySeason(name){const S=SEASONS[name];season=name;seasonK=S;FOG.set(S.fog);scene.fog.color.copy(FOG);fogBase=S.fogD;sunDir.set(...S.sunDir).normalize();setSky(S.sky,S.skyO);
 {const c=sun.shadow.camera,t=sun.target.position;frameShadow(t.x,t.y,t.z,c.right)}if(bloom)bloom.strength=S.bloom;
 for(const l of windowLights)l.l.intensity=l.base*S.inI;for(const l of flatLights)l.l.intensity=l.base*S.lamp;for(const l of stairLights)l.l.intensity=l.base*(.6+.4*S.lamp);sun.color.set(S.sun[0]);sunBase=S.sun[1];sun.intensity=sunBase;hemi.color.set(S.hemi[0]);hemi.groundColor.set(S.hemi[1]);hemiBase=S.hemi[2];envBase=S.env;
 WX.uSnow.value=S.snow;WX.uWet.value=S.wet;if(grade){grade.uniforms.uSat.value=S.sat;grade.uniforms.uTint.value.set(...S.tint);grade.uniforms.uLift.value.set(...S.lift)}
 paintGround(S);buildCanopies(name);buildHaze(S);buildFarTrees(name);
 precip.material.uniforms.uMode.value=S.precip;precip.material.uniforms.uOpacity.value=S.precipA;precip.material.uniforms.uBox.value.set(46,S.precip===3?14:26,46);precip.geometry.setDrawRange(0,S.precip===2?Math.round(PRE_N*.55):S.precip===3?Math.round(PRE_N*.35):PRE_N);
 for(const o of[glowSet,roomHazeSet,dustSet])o.material.uniforms.uTint.value.set(S.inTint);
 for(const l of windowLights)l.l.color.set(S.inTint);renderer.shadowMap.needsUpdate=true}
