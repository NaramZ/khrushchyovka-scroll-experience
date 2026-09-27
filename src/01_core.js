import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {Pass,FullScreenQuad} from 'three/addons/postprocessing/Pass.js';
import {CSS3DRenderer,CSS3DObject} from 'three/addons/renderers/CSS3DRenderer.js';
import {computeBoundsTree,acceleratedRaycast} from 'three-mesh-bvh';
import {gsap} from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
try{
const $=s=>document.querySelector(s),clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,smooth=THREE.MathUtils.smoothstep;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let mobile=innerWidth<700;
let seed=1464;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function rand(a,b){return a+rnd()*(b-a)}function pick(a){return a[Math.floor(rnd()*a.length)]}

// ───────────────────────── renderer / quality tiers ─────────────────────────
const canvas=$('#view');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',stencil:false});
const gl=renderer.getContext(),dbg=gl.getExtension('WEBGL_debug_renderer_info');
const softwareGPU=!!dbg&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL));
const tier=softwareGPU?0:mobile?1:2;
let pixelRatio=Math.min(devicePixelRatio,tier===2?1.5:tier===1?1.5:1);
renderer.setPixelRatio(pixelRatio);renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
renderer.shadowMap.enabled=tier>0;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
const maxAniso=renderer.capabilities.getMaxAnisotropy();


const scene=new THREE.Scene();
const FOG=new THREE.Color('#a9b3aa');
scene.fog=new THREE.FogExp2(FOG,.0105);
THREE.BufferGeometry.prototype.computeBoundsTree=computeBoundsTree;THREE.Mesh.prototype.raycast=acceleratedRaycast;
const camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,.04,900);
const controls=new OrbitControls(camera,canvas);controls.enabled=false;controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=.2;controls.maxDistance=160;controls.zoomSpeed=.55;controls.panSpeed=.7;

// ───────────────────────── architecture constants (metres) ─────────────────────────
const plantSpots=[];const H=2.8,F0=1.0,FLOORS=12,yF=n=>F0+n*H,ROOF=yF(FLOORS),APT=1,AY=yF(APT);
// overcast, high and diffuse — the light of the Zone rather than a golden hour
const sunDir=new THREE.Vector3(-.32,.82,.48).normalize(),sunTravel=sunDir.clone().negate();

// ───────────────────────── canvas texture kit ─────────────────────────
function cnv(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')]}
function toTex(c,tile=0,{srgb=true,tileY=0}={}){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,maxAniso);if(tile)t.repeat.set(1/tile,1/(tileY||tile));return t}
function noiseLayer(x,w,h,n,alpha,mode='soft-light',contrast=1){const[s,sx]=cnv(n+2);const img=sx.createImageData(n+2,n+2),v=[];for(let i=0;i<n*n;i++)v.push(rnd());
 for(let j=0;j<n+2;j++)for(let i=0;i<n+2;i++){const val=v[((j+n-1)%n)*n+((i+n-1)%n)],L=clamp(128+(val-.5)*255*contrast,0,255),k=(j*(n+2)+i)*4;img.data[k]=img.data[k+1]=img.data[k+2]=L;img.data[k+3]=255}
 sx.putImageData(img,0,0);x.save();x.globalAlpha=alpha;x.globalCompositeOperation=mode;x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';const cw=w/n,ch=h/n;x.drawImage(s,0,0,n+2,n+2,-cw,-ch,(n+2)*cw,(n+2)*ch);x.restore()}
function speckle(x,w,h,count,colors,smin,smax,amin,amax){for(let i=0;i<count;i++){x.globalAlpha=rand(amin,amax);x.fillStyle=pick(colors);const s=rand(smin,smax);x.fillRect(rnd()*w,rnd()*h,s,s*rand(.6,1.5))}x.globalAlpha=1}
function fbm(x,w,h,a=1){noiseLayer(x,w,h,3,.45*a);noiseLayer(x,w,h,8,.4*a);noiseLayer(x,w,h,22,.3*a);noiseLayer(x,w,h,70,.22*a);noiseLayer(x,w,h,200,.16*a)}
function surface(size,base,{a=1,pores=1,dark='#3b3b36',light='#f6f2e6'}={}){const[c,x]=cnv(size);x.fillStyle=base;x.fillRect(0,0,size,size);fbm(x,size,size,a);speckle(x,size,size,size*size/70*pores,[dark,light],.6,2.2,.05,.28);return c}
function pattern(size,base,draw){const[c,x]=cnv(size);x.fillStyle=base;x.fillRect(0,0,size,size);draw(x,size);return c}

// Concrete / plaster families
const concreteC=surface(512,'#9c9c95',{a:1.2,pores:1.4});
const plasterC=surface(512,'#e4e0d4',{a:.45,pores:.3});
const whitewashC=surface(512,'#dedad0',{a:.7,pores:.5});
const plinthC=surface(512,'#8a8780',{a:1.3,pores:1.6});
// Facade panel map: one planar texture over the whole front of the tower, derived from the opening layout
function frontOpenings(n){const y=yF(n),o=[];for(const s of[-1,1]){o.push({c:s*3.0,w:1.3,y0:y+.85,y1:y+2.3,kind:'kitchen',s});o.push({c:s*6.5,w:2.2,y0:y+.85,y1:y+2.3,kind:'living',s});o.push({c:s*9.8,w:1.4,y0:y+.85,y1:y+2.3,kind:'bed',s});o.push(n>0?{c:s*11.03,w:.75,y0:y,y1:y+2.3,kind:'balc',s}:{c:s*11.03,w:.75,y0:y+.85,y1:y+2.3,kind:'balcw',s})}
 if(n<FLOORS-1)o.push({c:0,w:1.5,y0:y+2.2,y1:y+3.5,kind:'stair',s:0});return o}
const FH=35.4;
function facadeCanvas(){const W=1536,Hh=Math.round(W*FH/24),[c,x]=cnv(W,Hh);const U=v=>(v+12)/24*W,V=y=>(1-y/FH)*Hh,S=W/24;
 x.fillStyle='#c3c2b9';x.fillRect(0,0,W,Hh);
 const bays=[-12,-8.76,-4.26,-1.65,1.65,4.26,8.76,12];
 for(let n=0;n<=FLOORS;n++){const y0=yF(n),y1=n<FLOORS?yF(n+1):FH;for(let i=0;i<bays.length-1;i++){const t=rand(-1,1);x.fillStyle=t>0?`rgba(240,238,230,${t*.2})`:`rgba(64,68,64,${-t*.2})`;x.fillRect(U(bays[i]),V(y1),U(bays[i+1])-U(bays[i]),V(y0)-V(y1))}}
 fbm(x,W,Hh,1.1);speckle(x,W,Hh,60000,['#4a4a45','#f2efe6'],.5,1.8,.05,.25);
 // weathering: long vertical runs from the parapet and from balcony slabs
 for(let i=0;i<70;i++){const px=rand(0,W),len=rand(2,12)*S,g=x.createLinearGradient(0,V(FH),0,V(FH)+len);g.addColorStop(0,'rgba(52,56,52,.22)');g.addColorStop(1,'rgba(52,56,52,0)');x.fillStyle=g;x.fillRect(px,V(FH),rand(2,.6*S),len)}
 for(let n=0;n<FLOORS;n++)for(const o of frontOpenings(n)){const x0=U(o.c-o.w/2),x1=U(o.c+o.w/2);for(let k=0;k<14;k++){const px=rand(x0-4,x1+4),len=rand(.3,2.4)*S,g=x.createLinearGradient(0,V(o.y0),0,V(o.y0)+len);g.addColorStop(0,'rgba(45,48,44,.22)');g.addColorStop(1,'rgba(45,48,44,0)');x.fillStyle=g;x.fillRect(px,V(o.y0),rand(1,5),len)}
  x.fillStyle='rgba(40,42,40,.12)';x.fillRect(x0-3,V(o.y1)-3,x1-x0+6,4)}
 // panel joints: sealed seams, some re-sealed in darker mastic (the vertical bands in the photograph)
 x.lineCap='butt';for(const b of bays){x.strokeStyle='rgba(50,53,50,.75)';x.lineWidth=2.2;x.beginPath();x.moveTo(U(b),V(FH));x.lineTo(U(b),V(0));x.stroke();if(rnd()>.35){const w=rand(.12,.34)*S;for(let n=0;n<FLOORS;n++)if(rnd()>.25){x.fillStyle=`rgba(${rnd()>.3?'70,72,70':'150,150,145'},${rand(.35,.6)})`;x.fillRect(U(b)-w/2+rand(-2,2),V(yF(n+1)),w,H*S)}}}
 for(let n=0;n<=FLOORS;n++){const y=V(yF(n));x.fillStyle='rgba(48,50,48,.7)';x.fillRect(0,y-1.5,W,3);if(rnd()>.4){x.fillStyle='rgba(70,72,70,.35)';x.fillRect(0,y-.1*S,W,.2*S)}}
 return c}
const facadeTex=toTex(facadeCanvas());facadeTex.repeat.set(1,1);
const detailTex=toTex(concreteC,1.6,{srgb:false});detailTex.channel=1;

// Stairwell: small ceramic floor tile, terrazzo treads
const floorTileC=pattern(512,'#b7a58a',(x,s)=>{const n=4,t=s/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){x.fillStyle=`hsl(${rand(28,36)} ${rand(18,28)}% ${rand(56,66)}%)`;x.fillRect(i*t+2,j*t+2,t-4,t-4);if((i+j)%2){x.fillStyle='rgba(120,70,40,.25)';x.fillRect(i*t+t*.3,j*t+t*.3,t*.4,t*.4)}}fbm(x,s,s,.8);x.strokeStyle='#6e6456';x.lineWidth=4;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*t,0);x.lineTo(i*t,s);x.moveTo(0,i*t);x.lineTo(s,i*t);x.stroke()}speckle(x,s,s,1500,['#3c342a'],1,3,.05,.2)});
const terrazzoC=pattern(512,'#8f8c84',(x,s)=>{fbm(x,s,s,.9);speckle(x,s,s,9000,['#e8e2d4','#50504a','#b09a7a','#2e2e2a'],1,4,.3,.8)});
// Wallpapers
const hallPaperC=pattern(512,'#b9b08c',(x,s)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#aaa27e':'#c2b994';x.fillRect(i*s/8,0,s/8,s);x.fillStyle='rgba(120,110,70,.5)';x.fillRect(i*s/8,0,2,s)}for(let j=0;j<8;j++)for(let i=0;i<4;i++){const cx=i*s/4+s/16,cy=j*s/8+(i%2)*s/16;x.fillStyle='#8a7f55';x.beginPath();x.moveTo(cx,cy-9);x.lineTo(cx+6,cy);x.lineTo(cx,cy+9);x.lineTo(cx-6,cy);x.fill()}fbm(x,s,s,.35)});
const livingPaperC=pattern(1024,'#cdb993',(x,s)=>{const m=s/2;for(let j=0;j<2;j++)for(let i=0;i<2;i++){x.save();x.translate(i*m+m/2+(j%2)*m/2,j*m+m/2);for(const sx of[-1,1]){x.save();x.scale(sx,1);x.strokeStyle='#a98f63';x.fillStyle='#bba27a';x.lineWidth=5;x.beginPath();x.moveTo(0,-m*.42);x.bezierCurveTo(m*.3,-m*.3,m*.08,-m*.05,m*.26,m*.06);x.bezierCurveTo(m*.38,m*.16,m*.16,m*.36,0,m*.44);x.stroke();x.beginPath();x.ellipse(m*.16,-m*.12,m*.06,m*.13,.5,0,7);x.fill();x.beginPath();x.ellipse(m*.12,m*.22,m*.05,m*.1,-.6,0,7);x.fill();x.restore()}x.fillStyle='#b39a6f';x.beginPath();x.ellipse(0,0,m*.07,m*.12,0,0,7);x.fill();x.restore()}
 // wrap copies so the motif tiles
 x.globalCompositeOperation='source-over';fbm(x,s,s,.3);speckle(x,s,s,4000,['#8a7550','#efe1be'],1,2,.05,.2)});
const bedPaperC=pattern(512,'#c9cdc2',(x,s)=>{for(let j=0;j<8;j++)for(let i=0;i<8;i++){const cx=i*s/8+(j%2)*s/16,cy=j*s/8;x.fillStyle='#9fa9a8';for(let k=0;k<5;k++){x.beginPath();x.ellipse(cx+Math.cos(k*1.256)*6,cy+Math.sin(k*1.256)*6,4,2.6,k*1.256,0,7);x.fill()}x.fillStyle='#b98f7e';x.beginPath();x.arc(cx,cy,2.5,0,7);x.fill()}x.strokeStyle='rgba(150,160,150,.5)';for(let i=0;i<16;i++){x.beginPath();x.moveTo(i*s/16,0);x.lineTo(i*s/16,s);x.stroke()}fbm(x,s,s,.3)});
const kitchenPaintC=surface(512,'#cfd3bf',{a:.35,pores:.2});
// Floors
const parquetC=(()=>{const s=1024,[c,x]=cnv(s);x.fillStyle='#3a2616';x.fillRect(0,0,s,s);const cw=256,ph=s/12,tone=[];for(let i=0;i<48;i++)tone.push([rand(24,33),rand(38,54),rand(25,39)]);
 // herringbone: 45° oak blocks, 0.42 x 0.07 m, texture spans 1.2 m and tiles exactly
 for(let col=0;col<4;col++){const d=col%2?1:-1,x0=col*cw,x1=x0+cw;for(let k=-8;k<22;k++){const y0=k*ph+(d<0?cw:0),t=tone[((k%12)+12)%12*4+col];x.fillStyle=`hsl(${t[0]} ${t[1]}% ${t[2]}%)`;x.beginPath();x.moveTo(x0+.8,y0);x.lineTo(x1-.8,y0+cw*d);x.lineTo(x1-.8,y0+cw*d+ph-1.6);x.lineTo(x0+.8,y0+ph-1.6);x.closePath();x.fill();
  x.save();x.clip();for(let g=0;g<7;g++){const o=rand(0,ph);x.strokeStyle=rnd()>.5?'rgba(30,18,8,.28)':'rgba(200,150,95,.18)';x.lineWidth=rand(.6,1.6);x.beginPath();x.moveTo(x0,y0+o);x.lineTo(x1,y0+o+cw*d+rand(-4,4));x.stroke()}x.restore()}}
 fbm(x,s,s,.45);return c})();
const linoC=pattern(512,'#8a6f4f',(x,s)=>{const n=4,t=s/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){x.fillStyle=(i+j)%2?'#7e6245':'#977b58';x.fillRect(i*t,j*t,t,t);x.strokeStyle='#5e4630';x.lineWidth=3;x.strokeRect(i*t+t*.18,j*t+t*.18,t*.64,t*.64);x.fillStyle='#b19773';x.beginPath();x.moveTo(i*t+t/2,j*t+t*.3);x.lineTo(i*t+t*.7,j*t+t/2);x.lineTo(i*t+t/2,j*t+t*.7);x.lineTo(i*t+t*.3,j*t+t/2);x.fill()}fbm(x,s,s,.6);speckle(x,s,s,3000,['#3a2a1c','#d8c3a0'],1,2,.05,.18)});
const kTileC=pattern(512,'#3f6a4f',(x,s)=>{const n=4,t=s/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){x.save();x.translate(i*t+t/2,j*t+t/2);x.fillStyle=`hsl(${rand(140,150)} 26% ${rand(30,36)}%)`;x.fillRect(-t/2,-t/2,t,t);x.strokeStyle='#d7dcc8';x.lineWidth=3;for(let a=0;a<4;a++){x.rotate(Math.PI/2);x.beginPath();x.moveTo(0,0);x.bezierCurveTo(t*.1,-t*.2,t*.35,-t*.2,t*.4,-t*.4);x.stroke();x.beginPath();x.arc(t*.4,-t*.4,t*.05,0,7);x.stroke()}x.fillStyle='#e0d8b8';x.beginPath();x.arc(0,0,t*.07,0,7);x.fill();x.restore()}x.strokeStyle='#cfd2c3';x.lineWidth=5;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*t,0);x.lineTo(i*t,s);x.moveTo(0,i*t);x.lineTo(s,i*t);x.stroke()}});
const bathTileC=pattern(512,'#d9e2de',(x,s)=>{const n=4,t=s/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){x.fillStyle=`hsl(${rand(170,190)} ${rand(12,22)}% ${rand(80,88)}%)`;x.fillRect(i*t,j*t,t,t)}x.strokeStyle='#b4bcb8';x.lineWidth=4;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*t,0);x.lineTo(i*t,s);x.moveTo(0,i*t);x.lineTo(s,i*t);x.stroke()}fbm(x,s,s,.2)});
// Timber
function woodC(base,hue,light,size=512){return pattern(size,base,(x,s)=>{for(let i=0;i<260;i++){x.strokeStyle=`hsla(${hue+rand(-4,4)},${rand(30,55)}%,${light+rand(-12,10)}%,${rand(.12,.45)})`;x.lineWidth=rand(.5,3);x.beginPath();let px=rnd()*s;x.moveTo(px,0);for(let y=0;y<=s;y+=s/8)x.lineTo(px+Math.sin(y*.02+i)*rand(2,9),y);x.stroke()}fbm(x,s,s,.4)})}
const walnutC=woodC('#5c2f1a',18,26,1024),lightWoodC=woodC('#c9a979',34,62),oakC=woodC('#8a5a32',26,40);
// Fabrics
const leatherC=pattern(512,'#5a2222',(x,s)=>{fbm(x,s,s,.6);const n=4,t=s/n;x.strokeStyle='rgba(20,5,5,.55)';x.lineWidth=5;for(let i=-n;i<=2*n;i++){x.beginPath();x.moveTo(i*t,0);x.lineTo(i*t+s,s);x.moveTo(i*t,s);x.lineTo(i*t+s,0);x.stroke()}x.fillStyle='#c3a25f';for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){x.beginPath();x.arc(i*t,j*t,6,0,7);x.fill()}x.strokeStyle='rgba(255,220,210,.12)';x.lineWidth=2;for(let i=-n;i<=2*n;i++){x.beginPath();x.moveTo(i*t+6,0);x.lineTo(i*t+s+6,s);x.stroke()}});
function floral(base,flower,leaf,size=512,count=26,scale=1){return pattern(size,base,(x,s)=>{fbm(x,s,s,.25);for(let i=0;i<count;i++){const cx=rnd()*s,cy=rnd()*s,r=rand(14,30)*scale;for(const[ox,oy]of[[0,0],[s,0],[-s,0],[0,s],[0,-s]]){x.save();x.translate(cx+ox,cy+oy);x.fillStyle=leaf;for(let k=0;k<3;k++){x.rotate(2.1);x.beginPath();x.ellipse(r*1.1,0,r*.9,r*.32,0,0,7);x.fill()}x.fillStyle=flower;for(let k=0;k<6;k++){x.rotate(1.047);x.beginPath();x.ellipse(r*.45,0,r*.45,r*.26,0,0,7);x.fill()}x.fillStyle='rgba(255,240,200,.6)';x.beginPath();x.arc(0,0,r*.2,0,7);x.fill();x.restore()}}})}
const curtainC=floral('#c5b08a','#8a5a3a','#6d6a45',512,22,1.1);
const oilclothC=floral('#e9dada','#c05a7a','#8aa07a',512,30,.9);
const spreadC=floral('#b46b58','#e3c9a0','#6e4a3a',512,26,1);
const coatC=surface(256,'#4a4843',{a:.6,pores:.2});
const tulleC=pattern(256,'#000',(x,s)=>{x.strokeStyle='#fff';x.globalAlpha=.55;x.lineWidth=1;for(let i=0;i<s;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,s);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(s,i);x.stroke()}x.globalAlpha=.9;x.lineWidth=2.5;for(let j=0;j<4;j++)for(let i=0;i<4;i++){x.beginPath();x.arc(i*64+32,j*64+32,18,0,7);x.stroke();x.beginPath();x.arc(i*64+32,j*64+32,6,0,7);x.stroke()}});
// Carpets (hand drawn in a Soviet Persian style)
function carpetCanvas(w,h,pal){const[c,x]=cnv(w,h);x.fillStyle=pal.field;x.fillRect(0,0,w,h);
 const dia=(cx,cy,rx,ry,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(cx,cy-ry);x.lineTo(cx+rx,cy);x.lineTo(cx,cy+ry);x.lineTo(cx-rx,cy);x.closePath();x.fill()};
 const star=(cx,cy,r,col)=>{x.fillStyle=col;x.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,rr=k%2?r*.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()};
 const step=(cx,cy,r,n,col)=>{x.fillStyle=col;x.beginPath();const s=r/n;for(let i=0;i<=n;i++)x.lineTo(cx+i*s,cy-r+i*s*1),x.lineTo(cx+i*s,cy-r+(i+1)*s);for(let i=n;i>=0;i--)x.lineTo(cx+i*s,cy+r-i*s),x.lineTo(cx+(i-1)*s,cy+r-i*s);for(let i=0;i<=n;i++)x.lineTo(cx-i*s,cy+r-i*s),x.lineTo(cx-i*s,cy+r-(i+1)*s);for(let i=n;i>=0;i--)x.lineTo(cx-i*s,cy-r+i*s),x.lineTo(cx-(i-1)*s,cy-r+i*s);x.closePath();x.fill()};
 const b=w*.085;
 // guard stripes and main border with rosettes and running hooks
 const bands=[[0,.1,pal.dark],[.1,.16,pal.light],[.16,.9,pal.field2],[.9,.96,pal.light],[.96,1.08,pal.dark],[1.08,1.13,pal.accent]];for(const[a0,a1,col]of bands){x.strokeStyle=col;x.lineWidth=(a1-a0)*b;const o=(a0+a1)/2*b;x.strokeRect(o,o,w-2*o,h-2*o)}
 const along=(fn)=>{const o=.53*b;for(let t=o;t<w-o;t+=b*.62){fn(t,o);fn(t,h-o)}for(let t=o+b*.62;t<h-o;t+=b*.62){fn(o,t);fn(w-o,t)}};
 along((px,py)=>{star(px,py,b*.3,pal.light);star(px,py,b*.17,pal.accent);dia(px,py,b*.06,b*.06,pal.dark)});
 for(let t=b*.2;t<w-b*.2;t+=b*.18){dia(t,b*.13,b*.05,b*.03,pal.accent);dia(t,h-b*.13,b*.05,b*.03,pal.accent)}
 // field: a dense lattice of small guls, alternating tones
 const fx=b*1.25,fy=b*1.25,cs=b*.46;x.save();x.beginPath();x.rect(fx,fy,w-2*fx,h-2*fy);x.clip();
 for(let j=0;j*cs<h;j++)for(let i=0;i*cs<w;i++){const cx=fx+i*cs+(j%2)*cs/2,cy=fy+j*cs;const alt=(i+j)%3;if(alt===0){dia(cx,cy,cs*.34,cs*.3,pal.field2);star(cx,cy,cs*.18,pal.light);dia(cx,cy,cs*.06,cs*.06,pal.dark)}else if(alt===1){dia(cx,cy,cs*.22,cs*.22,pal.dark);dia(cx,cy,cs*.12,cs*.12,pal.accent)}else{x.fillStyle=pal.light;x.fillRect(cx-cs*.04,cy-cs*.2,cs*.08,cs*.4);x.fillRect(cx-cs*.2,cy-cs*.04,cs*.4,cs*.08)}}
 // central medallion: stepped lozenge in layers, with a ring of small stars
 const cx=w/2,cy=h/2,R=Math.min(w,h)*.36;step(cx,cy,R,9,pal.light);step(cx,cy,R*.93,9,pal.dark);step(cx,cy,R*.86,8,pal.field2);for(let k=0;k<12;k++){const a=k*Math.PI/6;star(cx+Math.cos(a)*R*.55,cy+Math.sin(a)*R*.55,R*.07,pal.light)}step(cx,cy,R*.4,5,pal.light);step(cx,cy,R*.33,5,pal.accent);star(cx,cy,R*.2,pal.light);dia(cx,cy,R*.08,R*.08,pal.dark);
 for(const s of[-1,1]){dia(cx,cy+s*R*1.02,R*.16,R*.2,pal.light);dia(cx,cy+s*R*1.02,R*.1,R*.13,pal.accent);dia(cx,cy+s*R*1.25,R*.07,R*.09,pal.light)}
 for(const[qx,qy]of[[fx,fy],[w-fx,fy],[fx,h-fy],[w-fx,h-fy]]){step(qx,qy,R*.5,6,pal.light);step(qx,qy,R*.44,6,pal.dark);step(qx,qy,R*.36,5,pal.accent);star(qx,qy,R*.14,pal.light)}x.restore();
 // fringe, pile and wear
 x.fillStyle=pal.light;for(let i=0;i<w;i+=5){x.fillRect(i,0,2.2,b*.08);x.fillRect(i,h-b*.08,2.2,b*.08)}
 speckle(x,w,h,w*h/7,['#120806','#f3e1b8','#6a1c16','#233040'],.6,1.6,.04,.16);noiseLayer(x,w,h,5,.28);noiseLayer(x,w,h,30,.2);noiseLayer(x,w,h,160,.14);return c}
const wallCarpetC=carpetCanvas(1024,1536,{field:'#7d1f1a',field2:'#5a1512',dark:'#1d1a24',light:'#d7b98a',accent:'#2c4a6e'});
const bedCarpetC=carpetCanvas(1024,1536,{field:'#5b3a2a',field2:'#3e2418',dark:'#1d1a18',light:'#d8c29a',accent:'#9a4b2c'});
const rugC=carpetCanvas(1024,1280,{field:'#c9b48e',field2:'#b39a72',dark:'#5a4230',light:'#efe3c6',accent:'#6b7c8a'});
const runnerC=pattern(256,'#6e2a24',(x,s)=>{for(const[o,c]of[[8,'#2b3b2e'],[22,'#d0b47e'],[40,'#2b3b2e']]){x.fillStyle=c;x.fillRect(o,0,6,s);x.fillRect(s-o-6,0,6,s)}for(let j=0;j<8;j++){x.fillStyle='#d0b47e';x.beginPath();x.moveTo(s/2,j*32+2);x.lineTo(s/2+22,j*32+16);x.lineTo(s/2,j*32+30);x.lineTo(s/2-22,j*32+16);x.fill()}speckle(x,s,s,4000,['#1a0a08','#f0dcb0'],.6,1.5,.05,.18)});
// Books: an atlas of spines with Cyrillic titles
const booksC=(()=>{const W=1024,Hh=256,[c,x]=cnv(W,Hh);x.fillStyle='#2a2420';x.fillRect(0,0,W,Hh);const titles=['ТИХИЙ ДОН','ВОЙНА И МИР','ЧЕХОВ','ПУШКИН','БРАТЬЯ КАРАМАЗОВЫ','ГОГОЛЬ','БУЛГАКОВ','ЛЕРМОНТОВ','ТОЛСТОЙ','ЭНЦИКЛОПЕДИЯ','ЖЮЛЬ ВЕРН','ДЮМА','ГОРЬКИЙ','БЛОК','ЕСЕНИН','ПАУСТОВСКИЙ','ЛЕНИН т.12','АХМАТОВА','ШОЛОХОВ','ТУРГЕНЕВ'];let px=0;
 while(px<W){const bw=rand(18,40),bh=rand(.72,1)*Hh,col=pick(['#6b2a22','#23394a','#2f4a32','#8a6a3a','#5a1e2a','#1e2a3a','#b89a60','#3a3a3a','#7a3a1a','#40502a']);x.fillStyle=col;x.fillRect(px,Hh-bh,bw-1.5,bh);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(px+2,Hh-bh,2,bh);x.fillStyle='#c9a55a';x.fillRect(px+2,Hh-bh+14,bw-6,2);x.fillRect(px+2,Hh-26,bw-6,2);
  x.save();x.translate(px+bw/2+4,Hh-bh/2);x.rotate(-Math.PI/2);x.font=`600 ${Math.min(13,bw*.45)}px Oswald, sans-serif`;x.textAlign='center';x.fillStyle='#e8d6a4';x.fillText(pick(titles),0,0);x.restore();px+=bw}
 noiseLayer(x,W,Hh,30,.25);return c})();
// Stencilled floor numbers for the stair landings
const numbersC=(()=>{const[c,x]=cnv(1024,128);x.clearRect(0,0,1024,128);x.font='700 104px "Barlow Condensed",Oswald,sans-serif';x.textAlign='center';x.textBaseline='middle';for(let i=0;i<12;i++){x.fillStyle=i===1?'#b0321f':'#39443c';x.fillText(String(i+1),i*85.3+42,68)}noiseLayer(x,1024,128,40,.35,'destination-out');return c})();
// Framed photographs / calendar / clock face
function photoC(seedHue){return pattern(256,'#d8cfb8',(x,s)=>{const g=x.createLinearGradient(0,0,0,s);g.addColorStop(0,'#9a8f7a');g.addColorStop(1,'#4c463c');x.fillStyle=g;x.fillRect(16,16,s-32,s-32);x.fillStyle='rgba(30,26,20,.8)';for(let i=0;i<rand(1,3);i++){const px=rand(70,190);x.beginPath();x.ellipse(px,110,24,28,0,0,7);x.fill();x.fillRect(px-36,135,72,110)}noiseLayer(x,s,s,60,.4);x.fillStyle=`rgba(${seedHue},.12)`;x.fillRect(0,0,s,s)})}
const calendarC=pattern(256,'#f1ece0',(x,s)=>{x.fillStyle='#b8321e';x.fillRect(0,0,s,60);x.fillStyle='#fff';x.font='700 40px Oswald';x.textAlign='center';x.fillText('1981',s/2,46);x.fillStyle='#333';x.font='500 14px monospace';for(let j=0;j<5;j++)for(let i=0;i<7;i++)x.fillText(String(j*7+i+1).slice(0,2),22+i*34,100+j*30)});
const clockC=pattern(256,'#efe9da',(x,s)=>{x.translate(s/2,s/2);x.strokeStyle='#222';x.lineWidth=8;x.beginPath();x.arc(0,0,118,0,7);x.stroke();for(let i=0;i<12;i++){x.save();x.rotate(i*Math.PI/6);x.fillStyle='#222';x.fillRect(-3,-108,6,i%3?14:24);x.restore()}x.lineWidth=7;x.beginPath();x.moveTo(0,0);x.lineTo(40,-50);x.stroke();x.lineWidth=4;x.beginPath();x.moveTo(0,0);x.lineTo(-10,-92);x.stroke()});
// District
const blockC=(()=>{const W=2048,Hh=2048,[c,x]=cnv(W,Hh),[e,ex]=cnv(512,512);ex.fillStyle='#000';ex.fillRect(0,0,512,512);const mx=W/8,my=Hh/8,ppm=W/24;x.fillStyle='#bdbcb4';x.fillRect(0,0,W,Hh);
 for(let j=0;j<8;j++)for(let i=0;i<8;i++){const t=rand(-1,1);x.fillStyle=t>0?`rgba(240,238,230,${t*.2})`:`rgba(60,64,60,${-t*.22})`;x.fillRect(i*mx,j*my,mx,my)}
 fbm(x,W,Hh,1);
 for(let j=0;j<8;j++)for(let i=0;i<8;i++){const balcony=i%4===1,ww=(balcony?2.2:1.4)*ppm,wh=1.45*ppm,px=i*mx+(mx-ww)/2,py=j*my+my-(.85*ppm)-wh;
  if(balcony){x.fillStyle=pick(['#cfcfc6','#a9aaa2','#dcdbd2','#8e948a']);x.fillRect(px-.3*ppm,py+wh-.1*ppm,ww+.6*ppm,1.05*ppm);x.fillStyle='rgba(30,30,30,.25)';x.fillRect(px-.3*ppm,py+wh+.95*ppm,ww+.6*ppm,5)}
  x.fillStyle='#e6e3d8';x.fillRect(px-5,py-5,ww+10,wh+10);const lit=rnd()>.8,cur=pick(['#3d4a4c','#4a4f45','#6d5a48','#8a7d62','#394247','#5c6a6a']);x.fillStyle=cur;x.fillRect(px,py,ww,wh);const g=x.createLinearGradient(px,py,px+ww,py+wh);g.addColorStop(0,'rgba(220,228,230,.35)');g.addColorStop(.5,'rgba(220,228,230,0)');x.fillStyle=g;x.fillRect(px,py,ww,wh);x.fillStyle='#e6e3d8';x.fillRect(px+ww/2-2,py,4,wh);x.fillRect(px,py+wh*.3,ww,4);
  for(let k=0;k<6;k++){const sx=rand(px,px+ww),len=rand(.4,1.6)*ppm,gg=x.createLinearGradient(0,py+wh+5,0,py+wh+5+len);gg.addColorStop(0,'rgba(40,44,40,.25)');gg.addColorStop(1,'rgba(40,44,40,0)');x.fillStyle=gg;x.fillRect(sx,py+wh+5,rand(1,4),len)}
  if(lit){ex.fillStyle=pick(['#ffcf8a','#ffd9a0','#f7c070']);ex.fillRect(px/4,py/4,ww/4,wh/4)}}
 x.fillStyle='rgba(50,52,50,.6)';for(let j=0;j<=8;j++)x.fillRect(0,j*my-1,W,3);for(let i=0;i<=8;i++)x.fillRect(i*mx-1,0,2,Hh);return[c,e]})();
const groundUnique=(()=>{const W=2048,[c,x]=cnv(W);x.fillStyle='#6f7148';x.fillRect(0,0,W,W);fbm(x,W,W,1.2);noiseLayer(x,W,W,12,.35,'multiply',.8);return c})();
const grassDetailC=surface(512,'#7a7a5a',{a:1.4,pores:3,dark:'#2b3020',light:'#c5b98a'});
const asphaltC=pattern(512,'#58595a',(x,s)=>{fbm(x,s,s,1.2);speckle(x,s,s,30000,['#2a2a2a','#9a9a96','#c8c6be'],.6,2.2,.1,.5);x.strokeStyle='rgba(20,20,20,.5)';x.lineWidth=1.5;for(let i=0;i<5;i++){x.beginPath();let a=rnd()*s,b=rnd()*s;x.moveTo(a,b);for(let k=0;k<10;k++){a+=rand(-20,20);b+=rand(-20,20);x.lineTo(a,b)}x.stroke()}x.fillStyle='rgba(30,30,30,.25)';for(let i=0;i<4;i++)x.fillRect(rnd()*s,rnd()*s,rand(40,140),rand(30,100))});
const rustC=pattern(256,'#6a5040',(x,s)=>{fbm(x,s,s,1.4);speckle(x,s,s,3000,['#8a4a26','#2a1a12','#a07050'],1,4,.1,.4)});
const barkC=pattern(256,'#4a4038',(x,s)=>{for(let i=0;i<120;i++){x.strokeStyle=`rgba(${rnd()>.5?'20,16,12':'120,110,95'},${rand(.2,.5)})`;x.lineWidth=rand(1,4);x.beginPath();const px=rnd()*s;x.moveTo(px,0);x.lineTo(px+rand(-6,6),s);x.stroke()}fbm(x,s,s,.6)});
const birchC=pattern(256,'#dcd8cc',(x,s)=>{fbm(x,s,s,.5);for(let i=0;i<40;i++){x.fillStyle=`rgba(20,20,18,${rand(.4,.9)})`;x.fillRect(rnd()*s,rnd()*s,rand(8,40),rand(2,6))}});

// ───────────────────────── materials ─────────────────────────
// Weather lives in the shader: snow settles and rain pools on every upward-facing exterior surface
const WX={uSnow:{value:0},uWet:{value:0},uLived:{value:1},uScan:{value:0},uLocalC:{value:new THREE.Vector3()},uLocalR:{value:16},uLocalOn:{value:0}};
function weatherPatch(sh){Object.assign(sh.uniforms,WX);
 sh.uniforms.uSnowK={value:this.userData.snowK??1};sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform float uSnow,uWet,uSnowK,uLived,uScan,uLocalR,uLocalOn;uniform vec3 uLocalC;varying vec3 vWP;varying vec3 vWN;float gSnow=0.,gWet=0.;
float wh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float wn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wh(i),wh(i+vec2(1,0)),f.x),mix(wh(i+vec2(0,1)),wh(i+vec2(1,1)),f.x),f.y);}`).replace('#include <map_fragment>',`#include <map_fragment>
#ifdef LIVED
{float lv=wn(vWP.xz*2.6+vWP.y*1.9)*.5+wn(vWP.xy*7.3+vWP.z*2.1)*.3+wn(vWP.zy*19.+vWP.x*5.)*.2;if(lv>uLived*1.05-.02)discard;}
#endif
#ifdef SCAN
if(uScan>0.){vec2 dq=max(abs(vWP.xz)-vec2(12.,6.),0.);float dB=length(vec3(dq.x,max(vWP.y-36.,0.),dq.y));float far=smoothstep(8.,75.,dB);float hn=wn(vWP.xz*2.3+vWP.y*1.7)*.55+fract(sin(dot(floor(vWP*7.),vec3(12.9898,78.233,37.719)))*43758.5453)*.45;float nearF=uLocalOn*(1.-smoothstep(uLocalR*.5,uLocalR*.92,distance(vWP,uLocalC)));vec3 q3=vWP*4.3;float hs=wn(q3.xz+q3.y*1.37)*.5+wn(q3.zy*1.9+q3.x*.7)*.3+wn(q3.xy*4.1)*.2;if(hs<uScan*nearF*.68)discard;if(hn<uScan*far*1.2)discard;}
#endif
{float inside=step(abs(vWP.x),11.95)*step(abs(vWP.z),5.86)*step(vWP.y,34.4);float up=smoothstep(.5,.9,normalize(vWN).y)*(1.-inside);
 float n=wn(vWP.xz*1.3)*.55+wn(vWP.xz*6.1)*.3+wn(vWP.xz*23.)*.15;
 gSnow=clamp((uSnow*uSnowK*1.3-(1.-n)*.7)*up*1.9,0.,1.)*step(.001,uSnow);
 float side=(1.-inside)*uSnow*smoothstep(.45,.95,n)*.22*(1.-up)*step(vWP.y,.9+n*.8);
 gWet=uWet*up*smoothstep(.32,.62,n+.08)*(1.-gSnow);
 diffuseColor.rgb*=1.-gWet*.5;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.86,.89,.92),max(gSnow,side));}`).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.06,gWet);roughnessFactor=mix(roughnessFactor,.88,gSnow);')}
function M(opts,uv='world'){const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},opts));m.userData.uv=uv;m.onBeforeCompile=weatherPatch;return m}
const T=(c,tile,o)=>toTex(c,tile,o);
const mat={
 facade:M({map:facadeTex,bumpMap:detailTex,bumpScale:1.2,roughness:.95},'facade'),
 plinth:M({map:T(plinthC,1.8),bumpMap:T(plinthC,1.8,{srgb:false}),bumpScale:1.5,color:'#9a968d'}),
 raw:M({map:T(concreteC,2),color:'#b8b6ad'}),
 plaster:M({map:T(plasterC,2),color:'#f3efe4'}),
 whitewash:M({map:T(whitewashC,2),color:'#ece8dd'}),
 stairPaint:M({map:T(whitewashC,2),roughness:.8}),
 floorTile:M({map:T(floorTileC,.6),roughness:.55}),
 terrazzo:M({map:T(terrazzoC,.9),roughness:.5,bumpMap:T(terrazzoC,.9,{srgb:false}),bumpScale:.4}),
 frame:M({color:'#ece8dc',roughness:.45}),
 frameOld:M({color:'#d9d3c1',roughness:.55}),
 glassFake:M({color:'#2a3438',roughness:.06,metalness:.55,envMapIntensity:1.6}),
 metalDark:M({color:'#2e3230',roughness:.5,metalness:.6}),
 metalPaint:M({color:'#4d5a52',roughness:.55,metalness:.3}),
 brownPaint:M({color:'#5a3b2a',roughness:.45,metalness:.2}),
 steel:M({color:'#b9bcbc',roughness:.28,metalness:1}),
 chrome:M({color:'#e4e6e6',roughness:.08,metalness:1}),
 brass:M({color:'#b58f4a',roughness:.28,metalness:1}),
 rail:M({color:'#4a2c1e',roughness:.35}),
 bareWall:M({map:T(plasterC,2),color:'#dcd8c8',roughness:.9}),
 hallPaper:M({map:T(hallPaperC,.53),roughness:.85}),
 livingPaper:M({map:T(livingPaperC,.62),roughness:.85,bumpMap:T(livingPaperC,.62,{srgb:false}),bumpScale:.3}),
 bedPaper:M({map:T(bedPaperC,.5),roughness:.85}),
 kitchenPaint:M({map:T(kitchenPaintC,2),roughness:.6}),
 kTile:M({map:T(kTileC,.6),roughness:.2}),
 bathTile:M({map:T(bathTileC,.6),roughness:.2}),
 parquet:M({map:T(parquetC,1.2),roughness:.42,bumpMap:T(parquetC,1.2,{srgb:false}),bumpScale:.25}),
 lino:M({map:T(linoC,1.1),roughness:.5}),
 ceiling:M({map:T(plasterC,2),color:'#f6f3ea',roughness:.95}),
 baseboard:M({color:'#6b4a33',roughness:.5}),
 doorPaint:M({color:'#efeadb',roughness:.4}),
 walnut:M({map:T(walnutC,1.1),roughness:.32}),
 lightWood:M({map:T(lightWoodC,1),roughness:.45}),
 oak:M({map:T(oakC,1),roughness:.5}),
 leather:M({map:T(leatherC,.45),roughness:.55}),
 curtain:M({map:T(curtainC,.55),roughness:.9,side:THREE.DoubleSide}),
 oilcloth:M({map:T(oilclothC,.45),roughness:.35}),
 spread:M({map:T(spreadC,.5),roughness:.85}),
 linen:M({color:'#ebe5d6',roughness:.9}),
 sofa:M({map:T(floral('#8a6a44','#6a4a2a','#7a6a3a',512,20,.8),.4),roughness:.9}),
 coat:M({map:T(coatC,.5),roughness:.95}),
 coat2:M({map:T(coatC,.5),color:'#7a5a44',roughness:.95}),
 enamel:M({color:'#f1efe6',roughness:.18}),
 enamelDark:M({color:'#1c1d1c',roughness:.3}),
 plastic:M({color:'#e3dccb',roughness:.4}),
 crystal:new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.02,metalness:0,transmission:0,transparent:true,opacity:.35,envMapIntensity:3,depthWrite:false}),
 glass:new THREE.MeshPhysicalMaterial({color:'#e8f0ee',roughness:.03,metalness:0,transparent:true,opacity:.12,envMapIntensity:2.2,depthWrite:false,side:THREE.DoubleSide}),
 tulle:M({color:'#f6f3ec',alphaMap:T(tulleC,.35,{srgb:false}),transparent:true,opacity:.95,side:THREE.DoubleSide,depthWrite:false,roughness:1}),
 wallCarpet:M({map:T(wallCarpetC),roughness:1,bumpMap:T(wallCarpetC,0,{srgb:false}),bumpScale:.6},'keep'),
 bedCarpet:M({map:T(bedCarpetC),roughness:1},'keep'),
 rug:M({map:T(rugC),roughness:1,bumpMap:T(rugC,0,{srgb:false}),bumpScale:.5},'keep'),
 runner:M({map:T(runnerC),roughness:1},'keep'),
 books:M({map:T(booksC),roughness:.7},'keep'),
 numbers:M({map:T(numbersC),transparent:true,roughness:.9,depthWrite:false},'keep'),
 calendar:M({map:T(calendarC),roughness:.8},'keep'),
 clock:M({map:T(clockC),roughness:.3},'keep'),
 photoA:M({map:T(photoC('120,80,40')),roughness:.4},'keep'),
 photoB:M({map:T(photoC('60,70,90')),roughness:.4},'keep'),
 mirror:M({color:'#dfe6e6',roughness:.02,metalness:1,envMapIntensity:1.4}),
 tv:M({color:'#1a1f1f',roughness:.08,metalness:.3,envMapIntensity:1.5}),
 black:M({color:'#161616',roughness:.6}),
 cream:M({color:'#e6dcc2',roughness:.7}),
 green:M({color:'#4f6a4a',roughness:.8}),
 plantGreen:M({color:'#3f5a2e',roughness:.8}),
 terracotta:M({color:'#9a5a3a',roughness:.85}),
 red:M({color:'#8e2a1e',roughness:.6}),
 blue:M({color:'#3a5a7a',roughness:.6}),
 yellowPipe:M({color:'#d6a93a',roughness:.5}),
 lampWarm:new THREE.MeshBasicMaterial({color:new THREE.Color('#fff1d6').multiplyScalar(4)}),
 lampShade:M({color:'#efe3c8',roughness:.8,emissive:'#ffcf8a',emissiveIntensity:.35}),
 ground:M({map:toTex(groundUnique),bumpMap:T(grassDetailC,2.2,{srgb:false}),bumpScale:2,roughness:1},'ground'),
 grassTile:M({map:T(grassDetailC,2.4),roughness:1}),
 asphalt:M({map:T(asphaltC,4),roughness:.92}),
 paving:M({map:T(concreteC,1.4),color:'#b2b0a6',roughness:.9}),
 curb:M({map:T(concreteC,1),color:'#c9c6ba'}),
 rust:M({map:T(rustC,1.2),roughness:.8,metalness:.2}),
 bark:M({map:T(barkC,.8),roughness:1}),
 birch:M({map:T(birchC,.9),roughness:.9}),
 block:M({map:T(blockC[0],24,{tileY:22.4}),emissiveMap:T(blockC[1],24,{tileY:22.4}),emissive:'#ffffff',emissiveIntensity:.55,roughness:.9}),
 roof:M({map:T(concreteC,3),color:'#77766f'}),
 carpaint:c=>M({color:c,roughness:.32,metalness:.35}),
};
mat.ground.map.channel=1;mat.ground.map.repeat.set(1,1);
mat.glassFake.envMapIntensity=1.8;
for(const k of['lampWarm'])mat[k].userData.uv='keep';
for(const k of['glass','crystal'])mat[k].userData.uv='keep';
mat.tulle.userData.cast=false;mat.glass.userData.cast=false;mat.tulle.userData.noCollide=true;mat.lampWarm.userData.noCollide=true;mat.numbers.userData.noCollide=true;mat.crystal.userData.noCollide=true;mat.cloth=M({color:'#e8e2d2',roughness:1,side:THREE.DoubleSide});mat.cloth.userData.cast=false;mat.clothBlue=M({color:'#5a7390',roughness:1,side:THREE.DoubleSide});mat.clothBlue.userData.cast=false;mat.clothRed=M({color:'#8e3a2c',roughness:1,side:THREE.DoubleSide});mat.clothRed.userData.cast=false;mat.glass.userData.cast=false;mat.crystal.userData.cast=false;mat.numbers.userData.cast=false;mat.lampWarm.userData.cast=false;
mat.lampWarm.toneMapped=true;

// Stairwell two-tone paint that follows the pitch of the flights (the sloping dado line in the photograph)
mat.stairPaint.onBeforeCompile=sh=>{sh.vertexShader='varying vec3 vW;\n'+sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvW=(modelMatrix*vec4(transformed,1.)).xyz;');
 sh.fragmentShader='varying vec3 vW;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float prof=0.;
 if(vW.x<-1.4) prof=1.4*clamp((vW.z-.6)/2.6,0.,1.);
 else if(vW.x>1.4) prof=1.4+1.4*clamp((3.2-vW.z)/2.6,0.,1.);
 else if(vW.z>5.) prof=1.4;
 float yl=mod(vW.y-${F0.toFixed(2)}-prof,${H.toFixed(2)});
 float lower=step(yl,1.45);
 if(vW.y<1.45) lower=1.;
 float line=smoothstep(.0,.012,abs(yl-1.45)-.018);
 vec3 lowC=vec3(.23,.34,.31);vec3 upC=vec3(.86,.85,.80);
 diffuseColor.rgb*=mix(upC,lowC,lower)*mix(.35,1.,line)*1.12;`).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 roughnessFactor=mix(.92,.38,lower);`)};
mat.stairPaint.customProgramCacheKey=()=>'stair-dado';
