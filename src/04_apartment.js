
// ───────────────────────── THE APARTMENT — flat № 6, second storey, 52 m² ─────────────────────────
// Hall 2.55 × 4.6 · kitchen 2.55 × 2.6 · living room 4.4 × 4.85 · bedroom 2.9 × 4.85 · bath + WC · balcony
const Y=AY,CH=2.6;
mat.frosted=new THREE.MeshPhysicalMaterial({color:'#f2efe6',roughness:.35,transparent:true,opacity:.72,envMapIntensity:.8});mat.frosted.userData.cast=false;
const shell=group('shell'),hall=group('hall'),kitchen=group('kitchen'),living=group('living'),bedroom=group('bedroom'),bath=group('bath'),balcony=group('balcony');
// structure
bx(shell,1.5,11.7,Y-.22,Y,-3.75,5.7,mat.raw);bx(shell,1.5,11.7,Y+CH,Y+H,-3.75,5.7,mat.raw);
wall(shell,'z',2.98,3.1,1.65,4.2,Y,Y+CH,[{u0:2.5,u1:3.3,v0:Y-1,v1:Y+2.02}],mat.raw);
wall(shell,'z',-1.72,-1.6,1.65,4.2,Y,Y+CH,[{u0:1.95,u1:2.6,v0:Y-1,v1:Y+2}],mat.raw);
bx(shell,1.5,4.32,Y,Y+CH,-3.62,-3.5,mat.raw);bx(shell,1.5,1.65,Y,Y+CH,-3.62,-1.35,mat.raw);
wall(shell,'x',4.2,4.32,-3.62,5.7,Y,Y+CH,[{u0:1.35,u1:2.65,v0:Y-1,v1:Y+2.1}],mat.raw);
bx(shell,4.32,11.7,Y,Y+CH,.73,.85,mat.raw);
wall(shell,'x',8.7,8.82,.85,5.7,Y,Y+CH,[{u0:1.3,u1:2.1,v0:Y-1,v1:Y+2.02}],mat.raw);

// room lining: floor, ceiling, papered walls, skirting and cornice
function room(g,x0,x1,z0,z1,o){const Y0=Y,Y1=Y+CH,t=.012,W=o.walls;bx(g,x0,x1,Y0-.02,Y0+.004,z0,z1,o.floor);bx(g,x0,x1,Y1-.004,Y1,z0,z1,o.ceil||mat.ceiling);
 const sides={zmin:['z',z0,z0+t,x0,x1,1],zmax:['z',z1-t,z1,x0,x1,-1],xmin:['x',x0,x0+t,z0,z1,1],xmax:['x',x1-t,x1,z0,z1,-1]};
 for(const[k,[ax,c0,c1,u0,u1,dir]]of Object.entries(sides)){const w=W[k];if(!w)continue;const holes=w.holes||[];const paper=[mat.hallPaper,mat.livingPaper,mat.bedPaper].includes(w.m);if(paper){wall(g,ax,dir>0?c0:c0+.003,dir>0?c1-.003:c1,u0,u1,Y0,Y1,holes,mat.bareWall);LIVED=true}wall(g,ax,c0,c1,u0,u1,Y0,Y1,holes,w.m);LIVED=false;
  const fc=dir>0?c1:c0,d0=fc,d1=fc+dir*.02,segs=[];let cur=u0;for(const h of holes.filter(h=>h.v0<=Y0+.05).sort((a,b)=>a.u0-b.u0)){if(h.u0>cur)segs.push([cur,h.u0]);cur=Math.max(cur,h.u1)}if(u1>cur)segs.push([cur,u1]);
  for(const[a,b]of segs)ax==='z'?bx(g,a,b,Y0,Y0+.075,Math.min(d0,d1),Math.max(d0,d1),mat.baseboard):bx(g,Math.min(d0,d1),Math.max(d0,d1),Y0,Y0+.075,a,b,mat.baseboard);
  const e0=fc,e1=fc+dir*.045;ax==='z'?bx(g,u0,u1,Y1-.05,Y1,Math.min(e0,e1),Math.max(e0,e1),mat.ceiling):bx(g,Math.min(e0,e1),Math.max(e0,e1),Y1-.05,Y1,u0,u1,mat.ceiling)}}
// doorway with jamb lining, architraves on both faces, and hinged leaves
function buildLeaf(grp,w,h,o){const m=o.m||mat.doorPaint;
 if(o.glass){bx(grp,0,.1,0,h,-.02,.02,m);bx(grp,w-.1,w,0,h,-.02,.02,m);bx(grp,.1,w-.1,0,.2,-.02,.02,m);bx(grp,.1,w-.1,h-.12,h,-.02,.02,m);bx(grp,.1,w-.1,.85,.95,-.02,.02,m);bx(grp,.12,w-.12,.22,.83,-.013,.013,m);bx(grp,.1,w-.1,.95,h-.12,-.004,.004,mat.frosted);bx(grp,w/2-.012,w/2+.012,.95,h-.12,-.012,.012,m)}
 else{bx(grp,0,w,0,h,-.02,.02,m);bx(grp,.11,w-.11,.14,h*.44,-.025,.025,m);bx(grp,.11,w-.11,h*.52,h-.14,-.025,.025,m);if(o.window)bx(grp,.15,w-.15,h*.6,h-.2,-.026,.026,mat.frosted)}
 const hx=w-.075;for(const s of[-1,1]){bx(grp,hx-.016,hx+.016,.93,1.13,s>0?.02:-.027,s>0?.027:-.02,mat.brass);rod(grp,[hx,1.06,s*.035],[hx-.11,1.06,s*.045],.009,mat.brass,8)}}
function doorway(g,axis,c0,c1,u0,u1,h,leaf){const t=.03,m=mat.doorPaint,P=(a0,a1,b0,b1,d0,d1,mm)=>axis==='z'?bx(g,a0,a1,b0,b1,d0,d1,mm):bx(g,d0,d1,b0,b1,a0,a1,mm);
 P(u0,u0+t,Y,Y+h,c0-.013,c1+.013,m);P(u1-t,u1,Y,Y+h,c0-.013,c1+.013,m);P(u0,u1,Y+h-t,Y+h,c0-.013,c1+.013,m);
 for(const[d0,d1]of[[c0-.03,c0-.013],[c1+.013,c1+.03]]){P(u0-.07,u0+.004,Y,Y+h+.07,d0,d1,m);P(u1-.004,u1+.07,Y,Y+h+.07,d0,d1,m);P(u0-.07,u1+.07,Y+h-.004,Y+h+.07,d0,d1,m)}
 P(u0,u1,Y,Y+.014,c0-.02,c1+.02,mat.oak);
 if(!leaf)return;const list=leaf.double?[['u0',(u1-u0-2*t)/2],['u1',(u1-u0-2*t)/2]]:[[leaf.hinge,u1-u0-2*t]];
 for(const[hinge,w]of list){const hu=hinge==='u0'?u0+t:u1-t,e=hinge==='u0'?1:-1,mid=(c0+c1)/2+leaf.swing*((c1-c0)/2+.01),grp=new THREE.Group();g.add(grp);
  if(axis==='z')grp.position.set(hu,Y,mid);else grp.position.set(mid,Y,hu);
  const eW=axis==='z'?new THREE.Vector3(e,0,0):new THREE.Vector3(0,0,e),nW=axis==='z'?new THREE.Vector3(0,0,leaf.swing):new THREE.Vector3(leaf.swing,0,0),d=eW.multiplyScalar(Math.cos(leaf.angle)).addScaledVector(nW,Math.sin(leaf.angle));
  grp.rotation.y=Math.atan2(-d.z,d.x);buildLeaf(grp,w,h-t-.008,leaf)}}
// interior half of a real window: inner sash, reveals, deep sill board, radiator, tulle and curtains
function drape(g,axis,c,u0,u1,yTop,yBot,m,folds=8,amp=.035){const w=u1-u0,h=yTop-yBot,geo=new THREE.PlaneGeometry(w,h,Math.max(24,Math.round(folds*8)),6),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),t=x/w+.5;p.setZ(i,Math.sin(t*folds*Math.PI*2)*amp*(1+.25*(.5-y/h)))}geo.computeVertexNormals();const o=mesh(g,geo,m);o.userData.lived=true;if(axis==='z')o.position.set((u0+u1)/2,(yTop+yBot)/2,c);else{o.position.set(c,(yTop+yBot)/2,(u0+u1)/2);o.rotation.y=Math.PI/2}return o}
function innerWindow(g,axis,outer,inward,u0,u1,v0,v1,o={}){const put=(a0,a1,b0,b1,d0,d1,m)=>{const c0=outer+inward*d0,c1=outer+inward*d1;return axis==='z'?bx(g,a0,a1,b0,b1,Math.min(c0,c1),Math.max(c0,c1),m):bx(g,Math.min(c0,c1),Math.max(c0,c1),b0,b1,a0,a1,m)};const W=u1-u0,ft=.06;
 put(u0-.012,u0,v0,v1,.165,.3,mat.plaster);put(u1,u1+.012,v0,v1,.165,.3,mat.plaster);put(u0,u1,v1,v1+.012,.165,.3,mat.plaster);
 if(o.door)return;
 put(u0,u1,v1-ft,v1,.2,.27,mat.frame);put(u0,u1,v0,v0+ft,.2,.27,mat.frame);put(u0,u0+ft,v0,v1,.2,.27,mat.frame);put(u1-ft,u1,v0,v1,.2,.27,mat.frame);const nV=W>1.8?2:W>.95?1:0;for(let i=1;i<=nV;i++){const c=u0+W*i/(nV+1);put(c-ft*.45,c+ft*.45,v0,v1,.205,.265,mat.frame)}const tr=v1-(v1-v0)*.3;put(u0,u1,tr-ft*.4,tr+ft*.4,.205,.265,mat.frame);put(u0+ft*.5,u1-ft*.5,v0+ft*.5,v1-ft*.5,.232,.238,mat.glass);
 put(u0-.08,u1+.08,v0-.045,v0,.16,.53,mat.frame);
 if(o.radiator){const n=Math.floor((W-.1)/.085),w=n*.085,s0=(u0+u1)/2-w/2;for(let i=0;i<n;i++){const a=s0+i*.085+.008;put(a,a+.07,Y+.18,Y+.74,.36,.48,mat.enamel)}put(s0,s0+w,Y+.22,Y+.26,.4,.44,mat.enamel);put(s0,s0+w,Y+.66,Y+.7,.4,.44,mat.enamel);put(s0-.05,s0,Y+.24,Y+.26,.34,.36,mat.enamel)}
 const cz=outer+inward*.5;if(o.rod!==false){axis==='z'?rod(g,[u0-.45,Y+2.5,cz],[u1+.45,Y+2.5,cz],.014,mat.brass,10):rod(g,[cz,Y+2.5,u0-.45],[cz,Y+2.5,u1+.45],.014,mat.brass,10)}
 if(o.tulle)drape(g,axis,outer+inward*.46,u0-.3,u1+.3,Y+2.48,Y+(o.tulleLow??.9),mat.tulle,Math.round(W*9),.02);
 if(o.curtains){const cw=o.curtainW||.5;drape(g,axis,outer+inward*.54,u0-.45,u0-.45+cw,Y+2.48,Y+.05,o.curtains,7,.045);drape(g,axis,outer+inward*.54,u1+.45-cw,u1+.45,Y+2.48,Y+.05,o.curtains,7,.045)}}

// ── HALL / ПРИХОЖАЯ ───────────────────────────────────────────────
room(hall,1.65,4.2,-1.6,2.98,{floor:mat.lino,walls:{zmin:{m:mat.hallPaper,holes:[{u0:1.95,u1:2.6,v0:Y-1,v1:Y+2}]},zmax:{m:mat.hallPaper,holes:[{u0:2.5,u1:3.3,v0:Y-1,v1:Y+2.02}]},xmin:{m:mat.hallPaper,holes:[{u0:-.75,u1:.15,v0:Y-1,v1:Y+2.05}]},xmax:{m:mat.hallPaper,holes:[{u0:1.35,u1:2.65,v0:Y-1,v1:Y+2.1}]}}});
// front door: padded leatherette outside, painted inside, open into the hall
doorway(hall,'x',1.5,1.65,-.75,.15,2.05,{hinge:'u0',swing:1,angle:2.55,m:mat.leather});
bx(stair,1.47,1.485,Y+1.2,Y+1.32,.2,.3,mat.metalPaint);sph(stair,1.47,Y+1.26,.25,.015,mat.black,.5,1,1,8);
doorway(hall,'z',-1.72,-1.6,1.95,2.6,2.0,{hinge:'u0',swing:-1,angle:1.45,window:true});
// the storeroom (кладовка) every 1-464 flat plan counts on: a small room off the hall, door ajar
wall(hall,'x',3.45,3.55,-1.6,.53,Y,Y+CH,[{u0:-1.05,u1:-.4,v0:Y-1,v1:Y+2.0}],mat.hallPaper);bx(hall,3.45,4.2,Y,Y+CH,.43,.53,mat.hallPaper);bx(hall,3.55,4.188,Y-.02,Y+.004,-1.6,.43,mat.lino);
doorway(hall,'x',3.45,3.55,-1.05,-.4,2.0,{hinge:'u0',swing:1,angle:.4});
LIVED=++ITEM;for(const y of[.45,1.0,1.55])bx(hall,3.9,4.188,Y+y,Y+y+.025,-1.58,.4,mat.lightWood);for(let i=0;i<9;i++){cyl(hall,4.05,Y+1.1,-1.45+i*.18,.05,.05,.15,i%3?mat.crystal:mat.terracotta,12)}rbox(hall,4.0,Y+.62,-.6,.3,.3,.4,.03,mat.brownPaint);rbox(hall,3.95,Y+.12,-1.2,.35,.24,.5,.03,mat.coat2);
LIVED=false;
doorway(hall,'z',2.98,3.1,2.5,3.3,2.02,{hinge:'u0',swing:1,angle:1.7,glass:true});
doorway(hall,'x',4.2,4.32,1.35,2.65,2.1,{double:true,swing:1,angle:1.25,glass:true});
// coats on hooks, hat shelf, shoes
LIVED=++ITEM;bx(hall,1.662,1.7,Y+1.62,Y+1.74,.35,1.55,mat.walnut);bx(hall,1.662,1.95,Y+1.9,Y+1.93,.35,1.55,mat.walnut);for(let i=0;i<5;i++){rod(hall,[1.7,Y+1.68,.48+i*.25],[1.78,Y+1.72,.48+i*.25],.008,mat.brass,6)}
LIVED=false;
LIVED=++ITEM;[[.55,mat.coat,.02],[.86,mat.coat2,-.05],[1.2,mat.coat,.04]].forEach(([z,m,r])=>{const c=rbox(hall,1.84,Y+1.14,z,.2,1.05,.44,.09,m);c.rotation.z=r;rbox(hall,1.8,Y+1.62,z,.12,.14,.3,.05,m)});
LIVED=false;
LIVED=++ITEM;lathe(hall,[[0,0],[.14,0],[.15,.02],[.11,.03],[.1,.1],[0,.12]],1.8,Y+1.93,.7,mat.coat2,20);rbox(hall,1.8,Y+2.0,1.25,.25,.08,.3,.03,mat.red);
LIVED=false;
LIVED=++ITEM;for(let i=0;i<4;i++){const z=.5+i*.28;rbox(hall,1.85+(i%2)*.05,Y+.05,z,.27,.1,.11,.04,pick([mat.black,mat.brownPaint,mat.coat2]));rbox(hall,1.85+(i%2)*.05,Y+.05,z+.12,.27,.1,.11,.04,pick([mat.black,mat.brownPaint,mat.red]))}
LIVED=false;
LIVED=++ITEM;rod(hall,[1.72,Y,1.62],[1.76,Y+.85,1.62],.012,mat.black,6);bx(hall,1.7,2.4,Y+.004,Y+.018,-.7,.1,mat.coat2);
LIVED=false;
// wardrobe, mirror and telephone console on the living-room wall

LIVED=false;
LIVED=++ITEM;bx(hall,3.82,4.188,Y,Y+.78,.6,1.3,mat.walnut);bx(hall,3.81,3.82,Y+.08,Y+.72,.63,.94,mat.walnut);bx(hall,3.81,3.82,Y+.08,Y+.72,.96,1.27,mat.walnut);bx(hall,3.8,4.188,Y+.78,Y+.81,.58,1.32,mat.walnut);
LIVED=false;
LIVED=++ITEM;bx(hall,4.16,4.188,Y+1.0,Y+1.9,.65,1.25,mat.walnut);bx(hall,4.15,4.16,Y+1.04,Y+1.86,.69,1.21,mat.mirror);
LIVED=false;
LIVED=++ITEM;rbox(hall,4.0,Y+.85,1.05,.2,.08,.22,.03,mat.red);cyl(hall,4.0,Y+.9,1.05,.055,.055,.012,mat.cream,24);rbox(hall,4.0,Y+.93,1.05,.06,.05,.22,.02,mat.red);bx(hall,3.9,4.1,Y+.81,Y+.82,.05,.25,mat.cream);
LIVED=false;
// antresol above the bathroom doors, runner, lamp, switches
LIVED=++ITEM;bx(hall,1.662,3.44,Y+2.12,Y+2.596,-1.588,-1.02,mat.lightWood);bx(hall,1.7,2.9,Y+2.16,Y+2.56,-1.022,-1.015,mat.lightWood);bx(hall,2.95,3.4,Y+2.16,Y+2.56,-1.022,-1.015,mat.lightWood);
LIVED=false;
LIVED=++ITEM;{const r=bx(hall,2.45,3.35,Y+.004,Y+.014,-1.3,2.75,mat.runner);}
LIVED=false;
LIVED=++ITEM;lathe(hall,[[0,0],[.16,0],[.17,.02],[.13,.1],[0,.12]],2.9,Y+CH-.13,.6,mat.lampShade,28);
LIVED=false;
for(const[x,z]of[[1.675,.3],[4.18,1.2]])bx(hall,x-.012,x+.012,Y+1.3,Y+1.4,z-.04,z+.04,mat.plastic);
const hallLight=new THREE.PointLight('#ffd7a4',3.2,5,2);hallLight.position.set(2.9,Y+2.3,.6);hall.add(hallLight);

// ── BATH + WC (glimpsed through the ajar door) ───────────────────────────────
room(bath,1.65,4.2,-3.5,-1.72,{floor:mat.bathTile,walls:{zmin:{m:mat.bathTile},zmax:{m:mat.bathTile,holes:[{u0:1.95,u1:2.6,v0:Y-1,v1:Y+2}]},xmin:{m:mat.bathTile},xmax:{m:mat.bathTile}}});
rbox(bath,2.42,Y+.28,-3.14,1.5,.56,.7,.06,mat.enamel);bx(bath,1.7,3.14,Y+.5,Y+.56,-3.44,-2.84,mat.bathTile);cyl(bath,2.42,Y+.52,-3.14,.3,.3,.02,mat.bathTile,4);rod(bath,[1.72,Y+1.05,-3.45],[1.72,Y+1.05,-3.3],.012,mat.chrome);rod(bath,[1.72,Y+1.05,-3.3],[1.72,Y+.7,-3.3],.012,mat.chrome);
rbox(bath,2.95,Y+.82,-1.93,.42,.16,.34,.04,mat.enamel);bx(bath,2.75,3.15,Y+1.1,Y+1.6,-1.742,-1.735,mat.mirror);rod(bath,[2.95,Y+1.0,-1.74],[2.95,Y+1.0,-1.82],.01,mat.chrome);rod(bath,[3.5,Y+2.0,-3.46],[3.5,Y+.3,-3.46],.03,mat.enamel);

rbox(bath,3.85,Y+.22,-2.7,.55,.42,.38,.1,mat.enamel);rbox(bath,4.1,Y+.95,-2.7,.14,.34,.42,.03,mat.enamel);cyl(bath,3.62,Y+.4,-2.12,.22,.22,.6,mat.enamel,20);

// ── KITCHEN / КУХНЯ (6.6 m²) ─────────────────────────────────────────
room(kitchen,1.65,4.2,3.1,5.7,{floor:mat.lino,walls:{zmin:{m:mat.kitchenPaint,holes:[{u0:2.5,u1:3.3,v0:Y-1,v1:Y+2.02}]},zmax:{m:mat.kitchenPaint,holes:[{u0:2.35,u1:3.65,v0:Y+.85,v1:Y+2.3}]},xmin:{m:mat.kitchenPaint},xmax:{m:mat.kitchenPaint}}});
bx(kitchen,1.662,1.67,Y+.86,Y+1.62,3.8,5.7,mat.kTile);bx(kitchen,1.67,4.2,Y+.86,Y+1.2,5.682,5.69,mat.kTile);
innerWindow(kitchen,'z',6,-1,2.35,3.65,Y+.85,Y+2.3,{radiator:true,rod:false});
LIVED=++ITEM;for(let i=0;i<34;i++){const y=Y+2.24-i*.026;const s=bx(kitchen,2.33,3.67,y,y+.003,5.43,5.46,mat.plastic);s.rotation.x=.5}bx(kitchen,2.3,3.7,Y+2.24,Y+2.3,5.4,5.5,mat.plastic);for(const x of[2.6,3.4])rod(kitchen,[x,Y+2.24,5.44],[x,Y+1.35,5.44],.003,mat.plastic,4);
LIVED=false;
// sill: plants, a jar of tea mushroom, fruit bowl
LIVED=++ITEM;lathe(kitchen,[[0,0],[.06,0],[.07,.1],[0,.1]],2.55,Y+.85,5.55,mat.terracotta,14);plantSpots.push({x:2.55,y:Y+1.03,z:5.55,r:.11,h:.14,n:60,pal:['#4c6a34','#5d7a3a','#3e5a2c']});cyl(kitchen,3.0,Y+.97,5.56,.07,.07,.24,mat.crystal,16);cyl(kitchen,3.0,Y+.92,5.56,.065,.065,.13,M({color:'#a0702a',roughness:.3,transparent:true,opacity:.6}),16);lathe(kitchen,[[0,0],[.1,.0],[.13,.06],[0,.06]],3.4,Y+.85,5.55,mat.steel,20);for(let i=0;i<4;i++)sph(kitchen,3.38+rand(-.05,.05),Y+.94,5.55+rand(-.05,.05),.035,pick([mat.red,M({color:'#d8b83a'}),mat.green]),1,1,1,10);
LIVED=false;
// ZIL refrigerator
LIVED=++ITEM;rbox(kitchen,1.98,Y+.74,3.47,.62,1.48,.6,.08,mat.enamel);bx(kitchen,2.29,2.3,Y+.1,Y+1.4,3.19,3.75,mat.enamel);rod(kitchen,[2.33,Y+1.0,3.25],[2.33,Y+1.28,3.25],.015,mat.chrome);bx(kitchen,2.29,2.31,Y+1.3,Y+1.36,3.4,3.6,mat.chrome);rbox(kitchen,1.98,Y+1.55,3.47,.3,.14,.4,.03,mat.lightWood);
LIVED=false;
// sink + counter + stove, wall cabinets, gas pipe
bx(kitchen,1.66,2.25,Y,Y+.84,3.8,4.9,mat.lightWood);for(const[a,b]of[[3.82,4.34],[4.36,4.88]]){bx(kitchen,2.25,2.26,Y+.08,Y+.8,a,b,mat.lightWood);bx(kitchen,2.26,2.27,Y+.62,Y+.66,b-.14,b-.04,mat.steel)}bx(kitchen,1.66,2.28,Y+.84,Y+.88,4.36,4.9,mat.cream);{const inox=M({color:'#d4d6d4',roughness:.3,metalness:.75});bx(kitchen,1.66,2.28,Y+.84,Y+.88,3.8,3.88,inox);bx(kitchen,1.66,2.28,Y+.84,Y+.88,4.28,4.36,inox);bx(kitchen,1.66,1.8,Y+.84,Y+.88,3.88,4.28,inox);bx(kitchen,2.18,2.28,Y+.84,Y+.88,3.88,4.28,inox);bx(kitchen,1.8,2.18,Y+.7,Y+.72,3.88,4.28,inox);bx(kitchen,1.8,1.81,Y+.7,Y+.88,3.88,4.28,inox);bx(kitchen,2.17,2.18,Y+.7,Y+.88,3.88,4.28,inox);bx(kitchen,1.8,2.18,Y+.7,Y+.88,3.88,3.89,inox);bx(kitchen,1.8,2.18,Y+.7,Y+.88,4.27,4.28,inox);cyl(kitchen,1.99,Y+.722,4.08,.02,.02,.004,mat.black,12)}
poly(kitchen,[[1.7,Y+1.12,4.08],[1.84,Y+1.12,4.08],[1.84,Y+1.02,4.08]],.012,mat.chrome);rod(kitchen,[1.72,Y+1.12,4.0],[1.72,Y+1.12,4.16],.012,mat.chrome);
LIVED=++ITEM;bx(kitchen,1.7,2.2,Y+.88,Y+.9,4.45,4.8,mat.lightWood);sph(kitchen,1.95,Y+.95,4.62,.07,M({color:'#b88a50',roughness:.8}),1.2,.7,1.4,12);
LIVED=false;
rbox(kitchen,1.96,Y+.43,5.2,.58,.86,.5,.02,mat.enamel);bx(kitchen,2.25,2.26,Y+.12,Y+.62,5.0,5.4,mat.enamelDark);bx(kitchen,2.26,2.27,Y+.3,Y+.52,5.07,5.33,M({color:'#2a2622',roughness:.1}));rod(kitchen,[2.3,Y+.66,5.03],[2.3,Y+.66,5.37],.01,mat.chrome);for(let i=0;i<4;i++)cyl(kitchen,2.28,Y+.76,5.04+i*.107,.018,.018,.03,mat.black,12,0,Math.PI/2);
for(const[x,z]of[[1.83,5.08],[1.83,5.32],[2.08,5.08],[2.08,5.32]]){cyl(kitchen,x,Y+.87,z,.055,.06,.015,mat.black,16);for(let a=0;a<4;a++){const o=box(kitchen,x,Y+.885,z,.18,.012,.012,mat.black,a*Math.PI/4)}}
LIVED=++ITEM;lathe(kitchen,[[0,0],[.1,0],[.11,.02],[.1,.14],[.06,.18],[.02,.2],[0,.2]],2.08,Y+.87,5.08,M({color:'#c84a36',roughness:.2}),24);rod(kitchen,[2.15,Y+.95,5.08],[2.24,Y+1.05,5.08],.012,M({color:'#c84a36',roughness:.2}));poly(kitchen,[[2.0,Y+1.02,5.08],[2.0,Y+1.14,5.08],[2.16,Y+1.14,5.08],[2.16,Y+1.02,5.08]],.008,mat.black);
LIVED=false;
LIVED=++ITEM;lathe(kitchen,[[0,0],[.11,0],[.11,.14],[.12,.15],[0,.15]],1.83,Y+.88,5.32,mat.steel,24);
LIVED=false;
LIVED=++ITEM;bx(kitchen,1.662,1.99,Y+1.58,Y+2.25,3.8,4.9,mat.lightWood);for(const[a,b]of[[3.82,4.34],[4.36,4.88]]){bx(kitchen,1.99,2.0,Y+1.6,Y+2.23,a,b,mat.lightWood);bx(kitchen,2.0,2.01,Y+1.62,Y+1.66,a+.04,a+.14,mat.steel)}
LIVED=false;
LIVED=++ITEM;for(const y of[Y+1.32,Y+1.5])for(const x of[1.72,1.9])rod(kitchen,[x,y,3.84],[x,y,4.32],.004,mat.chrome,5);for(let i=0;i<7;i++){const z=3.87+i*.065;rod(kitchen,[1.9,Y+1.32,z],[1.9,Y+1.5,z],.003,mat.chrome,4);cyl(kitchen,1.81,Y+1.42,z+.03,.095,.095,.01,i%2?mat.enamel:M({color:'#e6e0cc',roughness:.2}),24,0,0).rotation.x=Math.PI/2}
LIVED=false;
poly(kitchen,[[1.7,Y+2.3,3.15],[1.7,Y+2.3,5.2],[1.7,Y+1.05,5.2]],.016,mat.yellowPipe,10);cyl(kitchen,1.72,Y+1.3,5.2,.022,.022,.06,mat.red,10);
// table with oilcloth, stools, tea, the iron on a folded towel
LIVED=++ITEM;bx(kitchen,3.45,4.188,Y+.72,Y+.76,4.2,5.4,mat.oilcloth);bx(kitchen,3.44,4.188,Y+.6,Y+.72,4.2,5.4,mat.lightWood);for(const[x,z]of[[3.5,4.25],[3.5,5.35],[4.14,4.25],[4.14,5.35]])bx(kitchen,x-.025,x+.025,Y,Y+.6,z-.025,z+.025,mat.lightWood);
LIVED=false;
LIVED=++ITEM;for(const[x,z]of[[3.3,4.55],[3.35,5.1]]){cyl(kitchen,x,Y+.43,z,.16,.16,.035,mat.lightWood,24);for(let a=0;a<4;a++){const ang=a*Math.PI/2+.4;rod(kitchen,[x+Math.cos(ang)*.09,Y+.42,z+Math.sin(ang)*.09],[x+Math.cos(ang)*.14,Y,z+Math.sin(ang)*.14],.013,mat.lightWood,6)}}
LIVED=false;
LIVED=++ITEM;function teaGlass(g,x,y,z){cyl(g,x,y+.05,z,.034,.03,.1,mat.crystal,16);cyl(g,x,y+.045,z,.03,.027,.08,M({color:'#7a3a10',roughness:.1,transparent:true,opacity:.85}),16);lathe(g,[[0,0],[.036,0],[.04,.005],[.036,.05],[.038,.055],[0,.055]],x,y,z,mat.steel,18);poly(g,[[x+.038,y+.015,z],[x+.065,y+.02,z],[x+.065,y+.05,z],[x+.038,y+.05,z]],.005,mat.steel,6);rod(g,[x,y+.06,z],[x+.02,y+.14,z-.01],.003,mat.steel,4)}
LIVED=false;
LIVED=++ITEM;teaGlass(kitchen,3.7,Y+.76,4.45);teaGlass(kitchen,3.95,Y+.76,4.6);lathe(kitchen,[[0,0],[.06,0],[.07,.06],[.05,.08],[0,.08]],3.85,Y+.76,4.9,mat.enamel,18);
LIVED=false;
LIVED=++ITEM;bx(kitchen,3.6,4.05,Y+.76,Y+.79,5.0,5.3,mat.linen);rbox(kitchen,3.82,Y+.83,5.15,.12,.08,.24,.03,M({color:'#d9d6ce',roughness:.3}));rbox(kitchen,3.82,Y+.86,5.18,.05,.04,.12,.015,mat.blue);
LIVED=false;
LIVED=++ITEM;bx(kitchen,4.02,4.188,Y+1.5,Y+1.53,4.1,5.2,mat.lightWood);for(let i=0;i<5;i++)cyl(kitchen,4.1,Y+1.6,4.2+i*.2,.045,.045,.15,i%2?mat.crystal:mat.enamel,14);rbox(kitchen,4.12,Y+1.78,3.5,.1,.16,.24,.02,mat.plastic);cyl(kitchen,4.06,Y+1.78,3.5,.05,.05,.01,mat.black,16,0,Math.PI/2);
LIVED=false;
LIVED=++ITEM;{const c=plane(kitchen,4.186,Y+1.35,3.55,.28,.4,mat.calendar,0,-Math.PI/2);}{const c=cyl(kitchen,3.75,Y+2.25,3.112,.13,.13,.03,mat.clock,32);c.rotation.x=Math.PI/2}
LIVED=false;
LIVED=++ITEM;rod(kitchen,[2.95,Y+CH,4.4],[2.95,Y+2.2,4.4],.004,mat.black,4);lathe(kitchen,[[0,0],[.03,0],[.2,.14],[.2,.15],[0,.02]].map(([a,b])=>[a,-b]),2.95,Y+2.2,4.4,M({color:'#4c6a58',roughness:.3,side:THREE.DoubleSide}),28);sph(kitchen,2.95,Y+2.12,4.4,.04,mat.lampWarm,1,1,1,10);
LIVED=false;
const kitchenLight=new THREE.PointLight('#ffdcae',1.2,5,2);kitchenLight.position.set(2.95,Y+2.05,4.4);kitchen.add(kitchenLight);

// ── LIVING ROOM / ЗАЛ ───────────────────────────────────────────────
room(living,4.32,8.7,.85,5.7,{floor:mat.parquet,walls:{zmin:{m:mat.livingPaper},zmax:{m:mat.livingPaper,holes:[{u0:5.4,u1:7.6,v0:Y+.85,v1:Y+2.3}]},xmin:{m:mat.livingPaper,holes:[{u0:1.35,u1:2.65,v0:Y-1,v1:Y+2.1}]},xmax:{m:mat.livingPaper,holes:[{u0:1.3,u1:2.1,v0:Y-1,v1:Y+2.02}]}}});
innerWindow(living,'z',6,-1,5.4,7.6,Y+.85,Y+2.3,{radiator:true,tulle:true,curtains:mat.curtain,curtainW:.62});
// geraniums on the sill
LIVED=++ITEM;for(const x of[5.7,6.2,7.3]){lathe(living,[[0,0],[.06,0],[.075,.11],[0,.11]],x,Y+.85,5.55,mat.terracotta,14);plantSpots.push({x,y:Y+1.06,z:5.55,r:.13,h:.12,n:70,pal:['#4c6a34','#5d7a3a','#3e5a2c','#557a3a']});plantSpots.push({x,y:Y+1.2,z:5.55,r:.06,h:.04,n:18,pal:['#c8322a','#b02a24','#d8483a'],small:1})}
LIVED=false;
// sofa-bed with timber arms and the wall carpet above it
LIVED=++ITEM;{const x0=5.25,x1=7.45,z0=.87;bx(living,x0,x1,Y+.08,Y+.36,z0,z0+.82,mat.walnut);for(const x of[x0+.03,x1-.03])for(const z of[z0+.05,z0+.77])cyl(living,x,Y+.04,z,.02,.015,.08,mat.walnut,8);
LIVED=false;
LIVED=++ITEM; rbox(living,(x0+x1)/2,Y+.46,z0+.46,x1-x0-.2,.2,.7,.07,mat.sofa);rbox(living,(x0+x1)/2,Y+.78,z0+.12,x1-x0-.2,.5,.2,.08,mat.sofa);for(const x of[x0+.05,x1-.05])rbox(living,x,Y+.5,z0+.42,.1,.34,.84,.04,mat.walnut);
LIVED=false;
LIVED=++ITEM; rbox(living,5.6,Y+.7,z0+.3,.42,.38,.14,.07,mat.linen).rotation.z=.12;rbox(living,7.05,Y+.68,z0+.32,.4,.36,.14,.07,mat.spread).rotation.z=-.1;rbox(living,6.6,Y+.58,z0+.55,.9,.04,.55,.02,M({color:'#6c7a5a',roughness:1}));
LIVED=false;
LIVED=++ITEM; const carpet=bx(living,5.2,7.5,Y+.78,Y+2.36,.862,.875,mat.wallCarpet);rod(living,[5.15,Y+2.38,.9],[7.55,Y+2.38,.9],.012,mat.brass,8)}
LIVED=false;
function frame(g,axis,c,u,y,w,h,m,dir){const P=(a0,a1,b0,b1,d0,d1,mm)=>axis==='z'?bx(g,a0,a1,b0,b1,Math.min(d0,d1),Math.max(d0,d1),mm):bx(g,Math.min(d0,d1),Math.max(d0,d1),b0,b1,a0,a1,mm);P(u-w/2,u+w/2,y-h/2,y+h/2,c,c+dir*.02,mat.walnut);const o=axis==='z'?plane(g,u,y,c+dir*.021,w-.05,h-.05,m,0,dir>0?0:Math.PI):plane(g,c+dir*.021,y,u,w-.05,h-.05,m,0,dir>0?Math.PI/2:-Math.PI/2)}
LIVED=++ITEM;frame(living,'z',.878,5.62,Y+2.08,.2,.26,mat.photoA,1);frame(living,'z',.878,7.1,Y+2.1,.22,.18,mat.photoB,1);
LIVED=false;
// stenka: wardrobe · vitrine with crystal · bookcase — polished walnut veneer
LIVED=++ITEM;{const xf=8.25,xb=8.688,Y0=Y,Yt=Y+2.28;bx(living,xf,xb,Y0,Y0+.06,2.3,5.4,mat.black);bx(living,xf,xb,Yt-.03,Yt,2.28,5.42,mat.walnut);for(const z of[2.3,3.05,4.3,5.4])bx(living,xf,xb,Y0+.06,Yt,z-.012,z+.012,mat.walnut);bx(living,xb-.01,xb,Y0,Yt,2.3,5.4,mat.walnut);
LIVED=false;
LIVED=++ITEM; bx(living,xf-.01,xf,Y0+.08,Yt-.05,2.33,2.67,mat.walnut);bx(living,xf-.01,xf,Y0+.08,Yt-.05,2.69,3.03,mat.walnut);for(const z of[2.63,2.73])bx(living,xf-.03,xf-.01,Y0+1.0,Y0+1.25,z-.01,z+.01,mat.brass);
LIVED=false;
LIVED=++ITEM; for(const[z0,z1]of[[3.07,4.28],[4.32,5.38]]){bx(living,xf-.01,xf,Y0+.08,Y0+.74,z0,(z0+z1)/2-.005,mat.walnut);bx(living,xf-.01,xf,Y0+.08,Y0+.74,(z0+z1)/2+.005,z1,mat.walnut);bx(living,xf-.03,xf-.01,Y0+.4,Y0+.44,(z0+z1)/2-.08,(z0+z1)/2+.08,mat.brass);
LIVED=false;
LIVED=++ITEM;  for(const y of[.75,1.15,1.56,1.96])bx(living,xf,xb,Y0+y,Y0+y+.02,z0,z1,y===1.15?mat.crystal:mat.walnut);bx(living,xf-.01,xf,Y0+1.96,Yt-.05,z0,z1,mat.walnut);bx(living,xf-.005,xf,Y0+.77,Y0+1.55,z0,z1,mat.glass)}
LIVED=false;
LIVED=++ITEM; // books with titled spines
LIVED=false;
LIVED=++ITEM; for(const[z0,z1,y]of[[4.33,5.37,.77],[4.33,5.37,1.17],[3.08,4.27,1.58],[4.33,5.37,1.58]]){const h=.32;bx(living,xf+.05,xb-.03,Y0+y,Y0+y+h,z0,z1,M({color:'#3a2e24'}));const b=plane(living,xf+.049,Y0+y+h/2,(z0+z1)/2,z1-z0,h,mat.books,0,-Math.PI/2);const uv=b.geometry.attributes.uv,o=rnd()*.6;for(let k=0;k<4;k++)uv.setX(k,o+uv.getX(k)*.4)}
LIVED=false;
LIVED=++ITEM; // crystal and porcelain in the vitrine
LIVED=false;
LIVED=++ITEM; for(let i=0;i<7;i++){const z=3.18+i*.155;lathe(living,[[0,0],[.03,0],[.008,.01],[.006,.07],[.035,.09],[.04,.16],[0,.16]],8.47,Y0+.77,z,mat.crystal,16);lathe(living,[[0,0],[.04,0],[.045,.1],[0,.1]],8.47,Y0+1.17,z,mat.crystal,16)}
LIVED=false;
LIVED=++ITEM; for(let i=0;i<3;i++)cyl(living,8.5,Y0+1.4,3.3+i*.35,.11,.11,.012,M({color:'#f3efe6',roughness:.15}),28,Math.PI/2*.0);lathe(living,[[0,0],[.06,0],[.08,.08],[.05,.15],[.07,.2],[0,.2]],8.47,Y0+1.58,3.35,M({color:'#f5f1e8',roughness:.15}),20);sph(living,8.47,Y0+1.72,3.9,.06,M({color:'#6a4a30',roughness:.6}),1,1.2,1,12);sph(living,8.47,Y0+1.64,3.9,.07,M({color:'#6a4a30',roughness:.6}),1,1,1,12)}
LIVED=false;
// Rubin television on a splayed-leg stand, turned towards the sofa
LIVED=++ITEM;{const g=new THREE.Group();living.add(g);g.position.set(4.8,Y,5.22);g.rotation.y=-.62+Math.PI;bx(g,-.36,.36,.42,.46,-.25,.25,mat.walnut);for(const[x,z]of[[-.32,-.2],[.32,-.2],[-.32,.2],[.32,.2]])rod(g,[x,.42,z],[x*1.1,0,z*1.1],.016,mat.walnut,6);
LIVED=false;
LIVED=++ITEM; rbox(g,0,.73,0,.66,.52,.5,.04,mat.walnut);rbox(g,-.07,.74,-.252,.46,.38,.03,.05,mat.tv);bx(g,.18,.3,.55,.93,-.255,-.25,M({color:'#c9b89a'}));for(let i=0;i<3;i++)cyl(g,.24,.62+i*.1,-.26,.025,.025,.03,mat.black,12,Math.PI/2);cyl(g,0,1.0,0,.18,.18,.005,mat.tulle,24);rod(g,[0,.99,.1],[-.25,1.4,.15],.004,mat.chrome,4);rod(g,[0,.99,.1],[.2,1.42,.12],.004,mat.chrome,4)}
LIVED=false;
// writing table by the window — books, tea, a desk lamp (after the photograph)
LIVED=++ITEM;{const cx=5.92,cz=4.78;bx(living,cx-.58,cx+.58,Y+.72,Y+.76,cz-.4,cz+.4,mat.walnut);for(const[a,b]of[[-.52,-.34],[.52,-.34],[-.52,.34],[.52,.34]])bx(living,cx+a-.025,cx+a+.025,Y,Y+.72,cz+b-.025,cz+b+.025,mat.walnut);bx(living,cx-.55,cx+.55,Y+.62,Y+.72,cz-.37,cz+.37,mat.walnut);
LIVED=false;
LIVED=++ITEM; for(let i=0;i<3;i++)rbox(living,cx-.35,Y+.785+i*.035,cz+.1,.26,.034,.19,.004,pick([mat.red,mat.blue,mat.green,mat.cream]));bx(living,cx-.1,cx+.2,Y+.76,Y+.77,cz-.15,cz+.08,mat.linen);teaGlass(living,cx+.32,Y+.76,cz-.1);
LIVED=false;
LIVED=++ITEM; cyl(living,cx+.4,Y+.77,cz+.25,.07,.08,.02,mat.cream,20);poly(living,[[cx+.4,Y+.78,cz+.25],[cx+.36,Y+1.1,cz+.18],[cx+.2,Y+1.22,cz+.1]],.011,mat.cream);const sh=lathe(living,[[0,0],[.03,0],[.1,-.1],[.1,-.11],[0,-.02]],cx+.2,Y+1.24,cz+.1,M({color:'#e8e2d0',roughness:.35,side:THREE.DoubleSide}),24);sh.rotation.z=.5;
LIVED=false;
LIVED=++ITEM; function chair(g,x,z,ry){const q=new THREE.Group();g.add(q);q.position.set(x,Y,z);q.rotation.y=ry;rbox(q,0,.45,0,.42,.04,.42,.015,mat.walnut);for(const a of[-.18,.18])for(const b of[-.18,.18])rod(q,[a,.44,b],[a*1.08,0,b*1.08],.016,mat.walnut,8);for(const a of[-.18,.18])rod(q,[a,.45,-.18],[a,.95,-.22],.016,mat.walnut,8);rbox(q,0,.86,-.215,.4,.14,.03,.01,mat.walnut);rbox(q,0,.66,-.2,.36,.04,.02,.008,mat.walnut)}
LIVED=false;
LIVED=++ITEM; chair(living,cx-.05,cz-.62,0);chair(living,cx+.78,cz-.05,-Math.PI/2);}
LIVED=false;
// rug, standard lamp, chandelier, ficus, framed picture, ceiling rose
LIVED=++ITEM;bx(living,5.0,8.0,Y+.004,Y+.016,1.75,4.2,mat.rug);
LIVED=false;
LIVED=++ITEM;{const x=7.95,z=1.25;for(let a=0;a<3;a++){const ang=a*2.09;rod(living,[x,Y+.25,z],[x+Math.cos(ang)*.2,Y,z+Math.sin(ang)*.2],.01,mat.brass,6)}rod(living,[x,Y+.25,z],[x,Y+1.45,z],.012,mat.brass,8);lathe(living,[[.12,0],[.24,0],[.25,.02],[.16,.36],[.15,.38]],x,Y+1.3,z,mat.lampShade,32)}
LIVED=false;
LIVED=++ITEM;{const x=6.5,z=3.25,y=Y+CH;cyl(living,x,y-.01,z,.3,.3,.012,mat.ceiling,40);cyl(living,x,y-.03,z,.07,.05,.04,mat.brass,20);rod(living,[x,y-.05,z],[x,y-.45,z],.012,mat.brass,8);lathe(living,[[0,0],[.09,.02],[.11,.07],[.05,.11],[0,.11]],x,y-.6,z,mat.brass,24);
LIVED=false;
LIVED=++ITEM; for(let k=0;k<5;k++){const a=k*Math.PI*2/5,ex=x+Math.cos(a)*.34,ez=z+Math.sin(a)*.34;poly(living,[[x+Math.cos(a)*.08,y-.54,z+Math.sin(a)*.08],[x+Math.cos(a)*.22,y-.64,z+Math.sin(a)*.22],[ex,y-.58,ez]],.009,mat.brass,6);cyl(living,ex,y-.56,ez,.035,.02,.03,mat.brass,14);cyl(living,ex,y-.51,ez,.012,.012,.07,mat.cream,8);sph(living,ex,y-.455,ez,.022,mat.lampWarm,1,1.6,1,10);for(let d=0;d<3;d++)sph(living,x+Math.cos(a+d*.2-.2)*.26,y-.7-d*.03,z+Math.sin(a+d*.2-.2)*.26,.014,mat.crystal,1,1.8,1,6)}
LIVED=false;
LIVED=++ITEM; for(let k=0;k<10;k++){const a=k*.628;sph(living,x+Math.cos(a)*.1,y-.68,z+Math.sin(a)*.1,.012,mat.crystal,1,2,1,6)}}
LIVED=false;
const livingLight=new THREE.PointLight('#ffd49c',5.5,6,2);livingLight.position.set(6.5,Y+2.0,3.25);living.add(livingLight);
LIVED=++ITEM;lathe(living,[[0,0],[.14,0],[.17,.3],[0,.3]],4.62,Y,1.05,mat.terracotta,18);plantSpots.push({x:4.62,y:Y+1.05,z:1.05,r:.3,h:.5,n:260,pal:['#2f4a26','#3e5a2c','#4c6a34','#26401f'],big:1});rod(living,[4.62,Y+.3,1.05],[4.64,Y+1.4,1.06],.012,mat.bark,6);
LIVED=false;
LIVED=++ITEM;frame(living,'x',4.332,3.9,Y+1.7,.7,.5,mat.photoB,1);cyl(living,4.335,Y+2.05,3.0,.12,.12,.03,mat.clock,32,0,Math.PI/2);
LIVED=false;

// ── BEDROOM / СПАЛЬНЯ ────────────────────────────────────────────────
room(bedroom,8.82,11.7,.85,5.7,{floor:mat.parquet,walls:{zmin:{m:mat.bedPaper},zmax:{m:mat.bedPaper,holes:[{u0:9.1,u1:10.5,v0:Y+.85,v1:Y+2.3},{u0:10.65,u1:11.4,v0:Y-1,v1:Y+2.3}]},xmin:{m:mat.bedPaper,holes:[{u0:1.3,u1:2.1,v0:Y-1,v1:Y+2.02}]},xmax:{m:mat.bedPaper,holes:[{u0:2.6,u1:3.8,v0:Y+.85,v1:Y+2.3}]}}});
doorway(bedroom,'x',8.7,8.82,1.3,2.1,2.02,{hinge:'u0',swing:1,angle:1.45});
innerWindow(bedroom,'z',6,-1,9.1,10.5,Y+.85,Y+2.3,{radiator:true,tulle:false,rod:false});innerWindow(bedroom,'z',6,-1,10.65,11.4,Y,Y+2.3,{door:true,rod:false});
LIVED=++ITEM;rod(bedroom,[8.95,Y+2.5,5.2],[11.6,Y+2.5,5.2],.014,mat.brass,10);drape(bedroom,'z',5.24,8.95,10.58,Y+2.48,Y+.6,mat.tulle,16,.025);drape(bedroom,'z',5.28,11.42,11.62,Y+2.48,Y+.05,mat.tulle,3,.03);drape(bedroom,'z',5.16,8.9,9.35,Y+2.48,Y+.05,mat.curtain,6,.04);
LIVED=false;
innerWindow(bedroom,'x',12,-1,2.6,3.8,Y+.85,Y+2.3,{tulle:true,tulleLow:.85,rod:true});
// balcony door leaf, open into the room
{const grp=new THREE.Group();bedroom.add(grp);grp.position.set(11.37,Y,5.72);grp.rotation.y=Math.atan2(Math.sin(1.15),-Math.cos(1.15));const w=.66,h=2.22;bx(grp,0,.07,0,h,-.03,.03,mat.frame);bx(grp,w-.07,w,0,h,-.03,.03,mat.frame);bx(grp,.07,w-.07,0,.9,-.025,.025,mat.frame);bx(grp,.07,w-.07,h-.07,h,-.03,.03,mat.frame);bx(grp,.07,w-.07,.9,.97,-.03,.03,mat.frame);bx(grp,.07,w-.07,.97,h-.07,-.004,.004,mat.glass);rod(grp,[w-.08,1.05,-.05],[w-.08,1.2,-.05],.01,mat.brass,6)}
// bed with the pyramid of lace pillows
LIVED=++ITEM;{const x0=10.0,x1=11.62,z0=.88,z1=2.9,cx=(x0+x1)/2;bx(bedroom,x0,x1,Y+.12,Y+.36,z0+.05,z1,mat.walnut);bx(bedroom,x0-.02,x1+.02,Y,Y+1.05,z0,z0+.05,mat.walnut);bx(bedroom,x0+.08,x1-.08,Y+.45,Y+.95,z0+.05,z0+.06,mat.oak);bx(bedroom,x0-.02,x1+.02,Y,Y+.62,z1-.05,z1,mat.walnut);
LIVED=false;
LIVED=++ITEM; rbox(bedroom,cx,Y+.45,(z0+z1)/2+.02,x1-x0-.06,.2,z1-z0-.12,.06,mat.linen);rbox(bedroom,cx,Y+.53,(z0+z1)/2+.12,x1-x0+.06,.12,z1-z0-.28,.05,mat.spread);bx(bedroom,x0-.03,x0-.01,Y+.22,Y+.52,z0+.3,z1-.1,mat.spread);bx(bedroom,x1+.01,x1+.03,Y+.22,Y+.52,z0+.3,z1-.1,mat.spread);
LIVED=false;
LIVED=++ITEM; for(const x of[cx-.37,cx+.37]){const p=rbox(bedroom,x,Y+.78,z0+.25,.64,.5,.2,.09,mat.linen);p.rotation.x=-.5;const l=bx(bedroom,x-.3,x+.3,Y+.56,Y+1.0,z0+.33,z0+.335,mat.tulle);l.rotation.x=-.5}{const p=rbox(bedroom,cx,Y+1.02,z0+.36,.5,.42,.18,.08,mat.linen);p.rotation.x=-.28;const l=bx(bedroom,cx-.24,cx+.24,Y+.84,Y+1.2,z0+.455,z0+.46,mat.tulle);l.rotation.x=-.28}
LIVED=false;
LIVED=++ITEM; bx(bedroom,10.08,11.54,Y+.9,Y+2.2,.862,.875,mat.bedCarpet)}
LIVED=false;
// night stand, lamp, alarm clock; wardrobe with mirror; dressing table (трюмо); rug; chair with a cardigan
LIVED=++ITEM;bx(bedroom,9.55,9.95,Y,Y+.55,.9,1.28,mat.walnut);bx(bedroom,9.54,9.96,Y+.55,Y+.57,.88,1.3,mat.walnut);lathe(bedroom,[[0,0],[.06,0],[.04,.2],[.02,.22],[0,.22]],9.75,Y+.57,1.06,mat.cream,16);lathe(bedroom,[[.06,0],[.13,0],[.08,.16],[.07,.16]],9.75,Y+.72,1.06,mat.lampShade,24);cyl(bedroom,9.66,Y+.6,1.22,.035,.035,.05,mat.red,16);
LIVED=false;
const bedLamp=new THREE.PointLight('#ffcc88',1.2,3,2);bedLamp.position.set(9.75,Y+.85,1.06);bedroom.add(bedLamp);
LIVED=++ITEM;bx(bedroom,8.83,9.42,Y+.06,Y+1.95,2.95,4.15,mat.walnut);for(let i=0;i<4;i++)cyl(bedroom,8.9+(i%2)*.46,Y+.03,3.0+(i>>1)*1.1,.02,.015,.06,mat.walnut,8);bx(bedroom,9.42,9.43,Y+.12,Y+1.9,2.98,3.54,mat.walnut);bx(bedroom,9.42,9.43,Y+.12,Y+1.9,3.56,4.12,mat.walnut);bx(bedroom,9.43,9.435,Y+.4,Y+1.7,3.62,4.06,mat.mirror);for(const z of[3.5,3.6])bx(bedroom,9.43,9.45,Y+1.0,Y+1.14,z-.008,z+.008,mat.brass);rbox(bedroom,9.12,Y+2.05,3.55,.5,.2,.7,.03,mat.brownPaint);
LIVED=false;
LIVED=++ITEM;{const xw=11.688;bx(bedroom,11.28,xw,Y,Y+.72,3.95,4.85,mat.walnut);bx(bedroom,11.27,xw,Y+.72,Y+.74,3.93,4.87,mat.walnut);bx(bedroom,11.6,xw,Y+.74,Y+1.72,4.15,4.65,mat.walnut);bx(bedroom,11.595,11.6,Y+.78,Y+1.68,4.19,4.61,mat.mirror);
LIVED=false;
LIVED=++ITEM; for(const s of[-1,1]){const g=new THREE.Group();bedroom.add(g);g.position.set(11.6,Y+.74,s>0?4.65:4.15);g.rotation.y=s*.6;bx(g,-.02,0,0,.85,s>0?0:-.26,s>0?.26:0,mat.walnut);bx(g,-.025,-.02,.04,.81,s>0?.02:-.24,s>0?.24:-.02,mat.mirror)}
LIVED=false;
LIVED=++ITEM; for(let i=0;i<4;i++)lathe(bedroom,[[0,0],[.025,0],[.028,.06],[.01,.08],[.012,.1],[0,.1]],11.42+rand(0,.1),Y+.74,4.25+i*.12,mat.crystal,12);bx(bedroom,11.35,11.5,Y+.74,Y+.82,4.62,4.8,mat.red);cyl(bedroom,11.48,Y+.745,4.4,.16,.16,.004,mat.tulle,24);cyl(bedroom,11.0,Y+.42,4.4,.16,.16,.05,mat.sofa,20);for(let a=0;a<4;a++)rod(bedroom,[11+Math.cos(a*1.57+.78)*.12,Y+.4,4.4+Math.sin(a*1.57+.78)*.12],[11+Math.cos(a*1.57+.78)*.14,Y,4.4+Math.sin(a*1.57+.78)*.14],.012,mat.walnut,6)}
LIVED=false;
LIVED=++ITEM;bx(bedroom,9.55,11.0,Y+.004,Y+.016,3.05,4.3,mat.rug);
LIVED=false;
LIVED=++ITEM;{const q=new THREE.Group();bedroom.add(q);q.position.set(9.12,Y,5.05);q.rotation.y=2.4;rbox(q,0,.45,0,.42,.04,.42,.015,mat.walnut);for(const a of[-.18,.18])for(const b of[-.18,.18])rod(q,[a,.44,b],[a*1.08,0,b*1.08],.016,mat.walnut,8);for(const a of[-.18,.18])rod(q,[a,.45,-.18],[a,.95,-.22],.016,mat.walnut,8);rbox(q,0,.86,-.215,.4,.14,.03,.01,mat.walnut);rbox(q,0,.62,-.16,.38,.36,.1,.05,M({color:'#8a5a5a',roughness:1}))}
LIVED=false;
LIVED=++ITEM;{const x=10.25,z=3.2,y=Y+CH;rod(bedroom,[x,y,z],[x,y-.4,z],.006,mat.black,4);lathe(bedroom,[[.05,0],[.28,.2],[.29,.22],[.04,.02]].map(([a,b])=>[a,-b]),x,y-.35,z,M({color:'#e9dcc0',roughness:.8,side:THREE.DoubleSide,emissive:'#ffcf8a',emissiveIntensity:.25}),32);sph(bedroom,x,y-.45,z,.05,mat.lampWarm,1,1,1,10)}
LIVED=false;
const bedLight=new THREE.PointLight('#ffd6a0',2.4,7,2);bedLight.position.set(10.25,Y+2.05,3.2);bedroom.add(bedLight);

// ── BALCONY / БАЛКОН ─────────────────────────────────────────────────
LIVED=++ITEM;rod(balcony,[9.1,Y+1.95,7.02],[11.7,Y+1.95,7.02],.005,mat.metalDark,5);rod(balcony,[9.1,Y+1.95,6.6],[11.7,Y+1.95,6.6],.005,mat.metalDark,5);for(const x of[9.08,11.72])rod(balcony,[x,Y+1.0,7.1],[x,Y+2.2,7.1],.015,mat.metalDark,6);
LIVED=false;
LIVED=++ITEM;for(const[x,w,m,z]of[[9.15,.55,mat.cloth,7.02],[9.75,.3,mat.clothBlue,7.03],[9.2,.35,mat.clothRed,6.6],[9.6,.4,mat.cloth,6.61]]){const d=drape(balcony,'z',z,x,x+w,Y+1.94,Y+1.94-rand(.5,1.0),m,2,.015);d.userData.cloth=true}
LIVED=false;
LIVED=++ITEM;rbox(balcony,9.4,Y+.2,6.4,.5,.4,.4,.02,mat.lightWood);for(let i=0;i<4;i++)cyl(balcony,9.25+i*.1,Y+.5,6.4,.045,.045,.16,mat.crystal,14);cyl(balcony,11.4,Y+.22,6.35,.16,.16,.035,mat.lightWood,20);for(let a=0;a<3;a++)rod(balcony,[11.4+Math.cos(a*2.1)*.1,Y+.2,6.35+Math.sin(a*2.1)*.1],[11.4+Math.cos(a*2.1)*.15,Y,6.35+Math.sin(a*2.1)*.15],.012,mat.lightWood,6);
LIVED=false;
LIVED=++ITEM;bx(balcony,9.15,10.15,Y+1.07,Y+1.24,7.0,7.2,mat.lightWood);for(let i=0;i<4;i++){plantSpots.push({x:9.3+i*.22,y:Y+1.33,z:7.1,r:.11,h:.1,n:60,pal:['#4c6a34','#5d7a3a','#6a7a3a']});plantSpots.push({x:9.3+i*.22,y:Y+1.42,z:7.1,r:.06,h:.04,n:14,pal:['#c8322a','#e0a030','#d8483a'],small:1})}
LIVED=false;
LIVED=++ITEM;rod(balcony,[11.72,Y,6.2],[11.62,Y+1.4,6.25],.012,mat.lightWood,6);sph(balcony,11.72,Y+.1,6.2,.1,M({color:'#b8a060',roughness:1}),1,1.5,.5,8);
LIVED=false;
