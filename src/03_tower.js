
// ───────────────────────── THE TOWER (12 storeys, 24 × 12 m, one stair core) ─────────────────────────
const tower=group('tower');
const curtainMats=['#6f6a58','#8a7d62','#4f5a55','#9a8a6a','#5c4a3e','#7a6e5a','#3f4a4c','#a0927a'].map(c=>M({color:c,roughness:.95}));
const litMats=['#ffd08e','#ffc27a','#f5d6a8'].map(c=>M({color:'#6a5a40',emissive:c,emissiveIntensity:1.1,roughness:1}));
const isReal=(face,n,kind,s)=>n===APT&&((face==='front'&&s===1&&['kitchen','living','bed','balc'].includes(kind))||(face==='side+'&&kind==='sideA'));
// window / balcony-door unit inside a facade opening. axis 'z': wall normal along z, u = x. axis 'x': normal along x, u = z.
function windowUnit(g,axis,outer,inward,u0,u1,v0,v1,o={}){
 const put=(a0,a1,b0,b1,d0,d1,m)=>{const c0=outer+inward*d0,c1=outer+inward*d1;return axis==='z'?bx(g,a0,a1,b0,b1,Math.min(c0,c1),Math.max(c0,c1),m):bx(g,Math.min(c0,c1),Math.max(c0,c1),b0,b1,a0,a1,m)};
 const W=u1-u0,Hh=v1-v0,ft=.07,d0=.085,d1=.165,fr=o.frameMat||mat.frame;
 put(u0,u1,v1-ft,v1,d0,d1,fr);put(u0,u1,v0,v0+ft,d0,d1,fr);put(u0,u0+ft,v0,v1,d0,d1,fr);put(u1-ft,u1,v0,v1,d0,d1,fr);
 if(o.open)return;
 if(o.door){const p=v0+.95;put(u0+ft,u1-ft,v0+ft,p,d0+.02,d1-.02,fr);put(u0+ft,u1-ft,p,p+ft*.8,d0+.01,d1-.01,fr);put(u0+ft,u1-ft,p+ft*.8,v1-ft,.12,.125,o.real?mat.glass:mat.glassFake);if(!o.real)put(u0+ft,u1-ft,p,v1-ft,.4,.42,o.curtain||pick(curtainMats));return}
 const nV=W>1.8?2:W>.95?1:0;for(let i=1;i<=nV;i++){const c=u0+W*i/(nV+1);put(c-ft*.45,c+ft*.45,v0,v1,d0+.005,d1-.005,fr)}
 const tr=v1-Hh*.3;put(u0,u1,tr-ft*.4,tr+ft*.4,d0+.005,d1-.005,fr);
 // small top-hung vent (fortochka) in one light
 if(W>.95){const a=u0+ft,b=u0+W/(nV+1)-ft*.45;put(a,b,tr+ft*.4,v1-ft,d0-.01,d0+.02,fr)}
 put(u0+ft*.5,u1-ft*.5,v0+ft*.5,v1-ft*.5,.122,.128,o.real?mat.glass:mat.glassFake);
 if(!o.real){const lit=o.lit,cm=lit?pick(litMats):(o.curtain||pick(curtainMats));if(rnd()>.25||lit){const k=rnd();if(k<.45||lit)put(u0+.02,u1-.02,v0,v1,.4,.42,cm);else{put(u0,u0+W*rand(.2,.35),v0,v1,.4,.42,cm);put(u1-W*rand(.2,.35),u1,v0,v1,.4,.42,cm);put(u0,u1,v0,v1,.5,.52,mat.black)}}else put(u0,u1,v0,v1,.5,.52,mat.black)}
 put(u0-.04,u1+.04,v0-.035,v0+.006,-.07,.09,mat.steel);
 if(o.grille)for(let i=0;i<=6;i++){const c=u0+W*i/6;put(c-.008,c+.008,v0,v1,-.05,-.035,mat.metalDark)}}
// ── facade openings for each face
const frontHoles=[],backHoles=[],sideHoles=[];
for(let n=0;n<FLOORS;n++){for(const op of frontOpenings(n))frontHoles.push({u0:op.c-op.w/2,u1:op.c+op.w/2,v0:op.y0,v1:op.y1,...op,n});
 for(const s of[-1,1])for(const[c,w]of[[2.8,1.3],[6.2,1.8],[9.6,1.4]])backHoles.push({u0:s*c-w/2,u1:s*c+w/2,v0:yF(n)+.85,v1:yF(n)+2.3,n,kind:'back',s});
 for(const[c,kind]of[[3.2,'sideA'],[-3.4,'sideB']])sideHoles.push({u0:c-.6,u1:c+.6,v0:yF(n)+.85,v1:yF(n)+2.3,n,kind})}
frontHoles.push({u0:-.7,u1:.7,v0:-1,v1:2.1,kind:'entry'});
wall(tower,'z',5.7,6,-12,12,F0,ROOF+.7,frontHoles,mat.facade);
wall(tower,'z',-6,-5.7,-12,12,F0,ROOF+.7,backHoles,mat.facade);
wall(tower,'x',11.7,12,-5.7,5.7,F0,ROOF+.7,sideHoles,mat.facade);
wall(tower,'x',-12,-11.7,-5.7,5.7,F0,ROOF+.7,sideHoles,mat.facade);
// plinth / basement band
wall(tower,'z',5.7,6.04,-12.04,12.04,0,F0,[{u0:-.7,u1:.7,v0:-1,v1:2.1}],mat.plinth);bx(tower,-12.04,12.04,0,F0,-6.04,-5.7,mat.plinth);bx(tower,11.7,12.04,0,F0,-5.7,5.7,mat.plinth);bx(tower,-12.04,-11.7,0,F0,-5.7,5.7,mat.plinth);
for(let i=-5;i<=5;i++)if(Math.abs(i)>0){bx(tower,i*2.1-.25,i*2.1+.25,.35,.62,6.03,6.05,mat.black);bx(tower,i*2.1-.25,i*2.1+.25,.35,.62,-6.05,-6.03,mat.black)}
bx(tower,-12.1,-.8,F0-.05,F0+.02,5.98,6.08,mat.plinth);bx(tower,.8,12.1,F0-.05,F0+.02,5.98,6.08,mat.plinth);
for(const h of frontHoles){if(h.kind==='entry')continue;const real=isReal('front',h.n,h.kind,h.s);const door=h.kind==='balc';windowUnit(tower,'z',6,-1,h.u0,h.u1,h.v0,h.v1,{real:real||h.kind==='stair',door,open:real&&door,lit:!real&&h.kind!=='stair'&&rnd()>.86,grille:h.n===0&&h.kind!=='stair'})}
for(const h of backHoles)windowUnit(tower,'z',-6,1,h.u0,h.u1,h.v0,h.v1,{lit:rnd()>.85,grille:h.n===0});
for(const h of sideHoles){windowUnit(tower,'x',12,-1,h.u0,h.u1,h.v0,h.v1,{real:isReal('side+',h.n,h.kind),lit:rnd()>.87,grille:h.n===0});windowUnit(tower,'x',-12,1,h.u0,h.u1,h.v0,h.v1,{lit:rnd()>.87,grille:h.n===0})}
// ── balconies: every bedroom has one; residents glazed, boarded or planted them over the decades
const balconyTypes=[];
for(let n=1;n<FLOORS;n++)for(const s of[-1,1]){const y=yF(n),xa=s>0?8.95:-11.85,xb=s>0?11.85:-8.95,ours=n===APT&&s===1,type=ours?'open':pick(['open','glazed','glazed','glazed','boarded','open']);balconyTypes.push(type);
 bx(tower,xa,xb,y-.16,y,6,7.25,mat.plinth);bx(tower,xa,xb,y-.2,y-.16,7.15,7.27,mat.steel);
 const pm=type==='boarded'?pick([mat.rust,mat.metalPaint,mat.lightWood]):mat.facade;
 if(type==='open'){// an open balcony is a painted steel railing: handrail, bottom rail, square balusters — you can see through it
  const rm=mat.metalPaint;bx(tower,xa,xb,y+.06,y+.1,7.14,7.19,rm);for(const x of[xa+.02,xb-.06])bx(tower,x,x+.04,y+.06,y+.1,6,7.19,rm);
  for(let x=xa+.06;x<xb-.04;x+=.12)bx(tower,x,x+.018,y+.1,y+1.02,7.155,7.173,rm);for(const x0 of[xa+.031,xb-.049])for(let z=6.1;z<7.12;z+=.12)bx(tower,x0,x0+.018,y+.1,y+1.02,z,z+.018,rm);
  for(const x of[xa+.005,xb-.065])bx(tower,x,x+.06,y,y+1.02,7.13,7.2,rm);
  bx(tower,xa-.02,xb+.02,y+1.02,y+1.07,7.12,7.25,mat.steel);for(const x of[xa-.02,xb-.06])bx(tower,x,x+.08,y+1.02,y+1.07,6,7.12,mat.steel)}
 else{bx(tower,xa,xb,y,y+1.02,7.13,7.21,pm);bx(tower,xa,xa+.08,y,y+1.02,6,7.21,pm);bx(tower,xb-.08,xb,y,y+1.02,6,7.21,pm);bx(tower,xa-.02,xb+.02,y+1.02,y+1.07,6,7.25,mat.steel)}
 if(type==='glazed'){const top=yF(n+1)-.16;for(let i=0;i<=5;i++){const x=xa+(xb-xa)*i/5;bx(tower,x-.035,x+.035,y+1.07,top,7.1,7.19,mat.frame)}bx(tower,xa,xb,top-.07,top,7.1,7.19,mat.frame);bx(tower,xa,xb,y+1.07,top-.07,7.14,7.15,mat.glassFake);for(const x of[xa,xb])bx(tower,x-.04,x+.04,y+1.07,top,6,7.19,mat.frame)}
 if(type==='boarded'){const top=yF(n+1)-.16;bx(tower,xa,xb,y+1.07,top,7.15,7.18,rnd()>.5?mat.glassFake:mat.metalPaint)}
 if(type==='open'&&!ours){for(let k=0;k<3;k++){const x0=xa+.3+k*.8+rand(0,.3);bx(tower,x0,x0+rand(.35,.5),y,y+rand(.3,.8)-k*.013,6.2+k*.011,6.6-k*.017,pick(curtainMats))}rod(tower,[xa+.1,y+1.9,7.0],[xb-.1,y+1.9,7.0],.006,mat.metalDark);for(let k=0;k<5;k++){const px=xa+rand(.3,2.6),z=6.86+k*.045;bx(tower,px,px+rand(.3,.7),y+1.35+rnd()*.2,y+1.9,z,z+.012,pick([mat.cloth,mat.clothBlue,mat.clothRed]))}}}
// ── roof, parapet, lift machine room, antennas
bx(tower,-11.7,11.7,ROOF-.22,ROOF,-5.7,5.7,mat.raw);bx(tower,-12.05,12.05,ROOF+.7,ROOF+.78,5.66,6.06,mat.steel);bx(tower,-12.05,12.05,ROOF+.7,ROOF+.78,-6.06,-5.66,mat.steel);
bx(tower,-11.7,11.7,ROOF,ROOF+.08,-5.7,5.7,mat.roof);bx(tower,-1.9,1.9,ROOF,ROOF+2.8,-3.4,1.2,mat.facade);bx(tower,-2,2,ROOF+2.8,ROOF+2.95,-3.5,1.3,mat.plinth);bx(tower,-.5,.5,ROOF+.1,ROOF+2,1.2,1.25,mat.brownPaint);
for(let i=0;i<7;i++){const x=rand(-10,10),z=rand(-5,5),h=rand(1.5,4);rod(tower,[x,ROOF,z],[x,ROOF+h,z],.025,mat.metalDark,6);for(let k=0;k<3;k++)rod(tower,[x-.5,ROOF+h-k*.3,z],[x+.5,ROOF+h-k*.3,z],.01,mat.metalDark,5)}
for(const x of[-8,-5,5,8])bx(tower,x-.4,x+.4,ROOF,ROOF+.9,-1,1,mat.plinth);
// ── entrance: canopy, doors, intercom, lamp, sign
bx(tower,-1.75,1.75,2.36,2.52,6,7.6,mat.plinth);bx(tower,-1.77,1.77,2.33,2.36,6,7.62,mat.steel);bx(tower,-1.6,1.6,-.04,.1,6,7.6,mat.paving);
bx(tower,-.78,-.7,0,2.18,5.74,5.86,mat.brownPaint);bx(tower,.7,.78,0,2.18,5.74,5.86,mat.brownPaint);bx(tower,-.78,.78,2.1,2.18,5.74,5.86,mat.brownPaint);
bx(tower,-.7,0,0,2.1,5.78,5.82,mat.brownPaint);bx(tower,-.62,-.08,1.15,1.85,5.815,5.83,mat.glassFake);cyl(tower,-.1,1.05,5.86,.012,.012,.25,mat.steel,8);
{const leaf=new THREE.Group();tower.add(leaf);leaf.position.set(.7,0,5.86);leaf.rotation.y=1.9;bx(leaf,-.7,0,0,2.1,-.02,.02,mat.brownPaint);bx(leaf,-.62,-.08,1.15,1.85,-.03,-.02,mat.glassFake);}
bx(tower,.86,1.08,1.2,1.52,6,6.05,mat.metalDark);for(let j=0;j<4;j++)for(let i=0;i<3;i++)bx(tower,.9+i*.06,.94+i*.06,1.26+j*.06,1.3+j*.06,6.05,6.06,mat.steel);
sph(tower,0,2.26,6.15,.09,mat.lampWarm,1.3,.6,1);bx(tower,-.16,.16,2.18,2.33,6,6.1,mat.metalDark);
bx(tower,-.45,.45,2.62,2.88,6.02,6.04,mat.blue);

// ───────────────────────── STAIR CORE — flights climb all twelve storeys ─────────────────────────
const stair=group('stair');
const doorHoleR={u0:-.75,u1:.15,v0:AY,v1:AY+2.05};
wall(stair,'x',1.5,1.65,-1.35,5.7,0,ROOF,[doorHoleR],mat.raw);bx(stair,-1.65,-1.5,0,ROOF,-1.35,5.7,mat.raw);bx(stair,-1.5,1.5,0,ROOF,-1.35,-1.2,mat.raw);
bx(stair,-1.5,-1.485,0,ROOF,-1.2,5.7,mat.stairPaint);wall(stair,'x',1.485,1.5,-1.2,5.7,0,ROOF,[doorHoleR],mat.stairPaint);bx(stair,-1.5,1.5,F0,ROOF,-1.2,-1.185,mat.stairPaint);
{const fh=[{u0:-.7,u1:.7,v0:-1,v1:2.1}];for(let n=0;n<FLOORS-1;n++)fh.push({u0:-.75,u1:.75,v0:yF(n)+2.2,v1:yF(n)+3.5});wall(stair,'z',5.685,5.7,-1.5,1.5,0,ROOF-.22,fh,mat.stairPaint)}
function landing(x0,x1,z0,z1,y,base){bx(stair,x0,x1,base??y-.22,y-.02,z0,z1,mat.whitewash);bx(stair,x0,x1,y-.02,y,z0,z1,mat.floorTile)}
function flight(x0,x1,zS,zE,yS,rise,nR,solid=false){const dir=Math.sign(zE-zS),run=Math.abs(zE-zS),nT=nR-1,tr=run/nT,r=rise/nR;
 for(let i=0;i<nT;i++){const top=yS+(i+1)*r,za=zS+dir*i*tr,zb=zS+dir*(i+1)*tr,lo=Math.min(za,zb),hi=Math.max(za,zb);bx(stair,x0,x1,top-.035,top,lo-(dir>0?.03:0),hi+(dir<0?.03:0),mat.terrazzo);bx(stair,x0,x1,solid?0:top-r-.02,top-.035,lo,hi,solid?mat.whitewash:mat.terrazzo)}
 if(!solid){const ang=Math.atan2(nT*r,run),len=Math.hypot(run,nT*r)+.25,t=.16,mz=(zS+zE)/2,my=yS+nT*r/2,ny=Math.cos(ang),nz=-dir*Math.sin(ang);const o=box(stair,(x0+x1)/2,my-ny*(t/2+.02),mz-nz*(t/2+.02),x1-x0,t,len,mat.whitewash);o.rotation.x=-dir*ang}
 // balustrade on the well side
 const xe=x0<0?x1-.03:x0+.03,rail=[];for(let i=0;i<nT;i++){const zc=zS+dir*(i+.5)*tr,top=yS+(i+1)*r;sqrod(stair,[xe,top,zc],[xe,top+.9,zc],.016,mat.metalDark);if(i%2===0)sqrod(stair,[xe,top+.12,zc],[xe,top+.12+.6,zc+dir*tr*2],.01,mat.metalDark);rail.push([xe,top+.92,zc])}
 const f=rail[0],l=rail[rail.length-1],ext=(p,q,k)=>p.map((v,j)=>v+(v-q[j])*k);rod(stair,ext(f,l,.08),ext(l,f,.08),.028,mat.rail,10);rod(stair,[xe,f[1]-.78,f[2]],[xe,l[1]-.78,l[2]],.012,mat.metalDark,6)}
function wellRail(y,z){for(const x of[-.3,-.1,.1,.3])sqrod(stair,[x,y,z],[x,y+.9,z],.016,mat.metalDark);rod(stair,[-.35,y+.92,z],[.35,y+.92,z],.028,mat.rail,10)}
// ground: vestibule, entry flight, solid first run
bx(stair,-1.5,1.5,-.1,.1,3.2,5.7,mat.floorTile);bx(stair,-.35,.35,-.1,.1,1.7,3.2,mat.floorTile);
flight(.35,1.485,3.2,1.7,0,1.0,6,true);landing(-.35,1.485,.6,1.7,F0,0);wellRail(F0,1.7);
for(let n=0;n<FLOORS;n++){const y=yF(n);landing(-1.485,1.485,-1.185,.6,y,n===0?0:undefined);
 if(n<FLOORS-1){landing(-1.485,1.485,3.2,5.685,y+1.4);flight(-1.485,-.35,.6,3.2,y,1.4,9,n===0);flight(.35,1.485,3.2,.6,y+1.4,1.4,9);wellRail(y+1.4,3.2);if(n>0)wellRail(y,.6)}
 // lift doors, call button, electrical cabinet, stencilled floor number, bulbs
 if(n>0||true){const ly=n===0?F0:y;bx(stair,-.58,.58,ly,ly+2.1,-1.185,-1.15,mat.metalDark);bx(stair,-.5,-.01,ly,ly+2.02,-1.15,-1.13,mat.brownPaint);bx(stair,.01,.5,ly,ly+2.02,-1.15,-1.13,mat.brownPaint);bx(stair,.64,.72,ly+1.0,ly+1.16,-1.185,-1.16,mat.steel);sph(stair,.68,ly+1.08,-1.155,.018,mat.red,1,1,.5,8);
  bx(stair,.8,1.4,ly+1.05,ly+2.15,-1.185,-1.1,mat.metalPaint);bx(stair,.83,1.37,ly+1.08,ly+2.12,-1.1,-1.095,mat.metalPaint);
  const num=plane(stair,-.95,ly+1.78,-1.18,.42,.52,mat.numbers);const uv=num.geometry.attributes.uv;for(let k=0;k<4;k++)uv.setX(k,(n+uv.getX(k))/12);
  sph(stair,0,y+2.44,-.3,.07,mat.lampWarm,1,1.2,1,12);cyl(stair,0,y+2.54,-.3,.04,.04,.08,mat.plastic,10);if(n<FLOORS-1){sph(stair,0,y+1.4+2.44,4.5,.07,mat.lampWarm,1,1.2,1,12);cyl(stair,0,y+1.4+2.54,4.5,.04,.04,.08,mat.plastic,10)}}
 // neighbours' front doors (padded leatherette, painted steel, varnished board)
 const doorMat=[mat.leather,mat.brownPaint,mat.walnut,mat.leather];const dz0=-.72,dz1=.12;
 const door=(sx,m)=>{const xs=sx*1.485,xi=sx*1.44;bx(stair,Math.min(xs,xi),Math.max(xs,xi),y,y+2.02,dz0,dz1,m);for(const z of[dz0-.07,dz1])bx(stair,Math.min(xs,sx*1.46),Math.max(xs,sx*1.46),y,y+2.1,z,z+.07,mat.frameOld);bx(stair,Math.min(xs,sx*1.46),Math.max(xs,sx*1.46),y+2.03,y+2.1,dz0-.07,dz1+.07,mat.frameOld);cyl(stair,sx*1.425,y+1.0,dz1-.1,.012,.012,.14,mat.brass,8,0,Math.PI/2);sph(stair,sx*1.435,y+1.55,(dz0+dz1)/2,.012,mat.brass,1,1,1,8);bx(stair,Math.min(sx*1.435,sx*1.43),Math.max(sx*1.435,sx*1.43),y+1.7,y+1.78,(dz0+dz1)/2-.05,(dz0+dz1)/2+.05,mat.brass)};
 if(n>0){door(-1,doorMat[n%4]);if(n!==APT)door(1,doorMat[(n+1)%4])}
 // garbage chute hopper on the half landing
 if(n<FLOORS-1){bx(stair,-1.485,-1.0,y+1.4+.62,y+1.4+1.02,5.05,5.6,mat.metalPaint);bx(stair,-1.48,-1.02,y+1.4+.75,y+1.4+.95,5.03,5.05,mat.metalDark)}}
cyl(stair,-1.24,ROOF/2,5.33,.2,.2,ROOF,mat.raw,16);
for(const[x,r]of[[1.36,.045],[1.24,.028]])cyl(stair,x,ROOF/2,-1.08,r,r,ROOF,mat.metalPaint,10);
// mailboxes on the face of the first run, radiator in the vestibule
bx(stair,-1.45,-.3,.85,1.75,3.2,3.26,mat.metalPaint);for(let j=0;j<3;j++)for(let i=0;i<5;i++){const x=-1.4+i*.225,y=.9+j*.28;bx(stair,x,x+.21,y,y+.26,3.26,3.29,pick([mat.metalPaint,mat.metalPaint,mat.blue,mat.brownPaint]));bx(stair,x+.03,x+.18,y+.19,y+.21,3.29,3.295,mat.black);bx(stair,x+.15,x+.18,y+.05,y+.09,3.29,3.3,mat.steel)}
for(let i=0;i<9;i++)rbox(stair,1.42,.5,4.3+i*.09,.1,.55,.07,.02,mat.metalPaint);rod(stair,[1.42,.2,4.25],[1.42,.2,5.1],.02,mat.metalPaint);
// stair windows: inner sashes and sills on the half landings
for(let n=0;n<FLOORS-1;n++){const y=yF(n)+2.2;bx(stair,-.8,.8,y-.04,y+.02,5.45,5.72,mat.whitewash);for(const[a,b]of[[-.75,-.68],[.68,.75],[-.035,.035]])bx(stair,a,b,y,y+1.3,5.68,5.74,mat.frameOld);bx(stair,-.75,.75,y,y+.07,5.68,5.74,mat.frameOld);bx(stair,-.75,.75,y+1.23,y+1.3,5.68,5.74,mat.frameOld);bx(stair,-.72,.72,y+.05,y+1.25,5.705,5.71,mat.glass);
 if(n<3){lathe(stair,[[0,0],[.07,0],[.08,.12],[0,.12]],.45,y+.02,5.55,mat.terracotta,14);plantSpots.push({x:.45,y:y+.24,z:5.55,r:.13,h:.16,n:70,pal:['#4c6a34','#5d7a3a','#3e5a2c']});cyl(stair,-.4,y+.06,5.56,.05,.04,.08,mat.crystal,12)}}
