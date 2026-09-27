
// ───────────────────────── THE SITE — across the road, a new block is assembled the way the system intended ─────────────────────────
// A five-storey large-panel section of the 1-464 kind, on the same plan as flat № 6. The kit arrives from the house-building
// factory; the crane sets it floor by floor: room-sized floor slabs, back and gable wall panels with windows already fitted,
// interior bearing walls, the bathroom as one finished sanitary cabin, the stair flights, and last the front panels — so you
// watch the rooms take shape before they are closed. Five storeys, so no lift. Scroll drives the build (0 → 1).
const site=new THREE.Group();site.name='site';scene.add(site);
const SCX=-34,SCZ=43,SFLOORS=5,SITE_M=new THREE.Matrix4().makeTranslation(SCX,0,SCZ).multiply(new THREE.Matrix4().makeRotationY(Math.PI));
const SITE_C=new THREE.Vector3(SCX,0,SCZ),toWorld=(x,y,z)=>new THREE.Vector3(x,y,z).applyMatrix4(SITE_M);
const mud=M({map:T(concreteC,2),color:'#6d5f4c',roughness:1}),boards=M({map:T(oakC,1),color:'#8a7a60',roughness:.9}),craneYellow=M({color:'#c9a23a',roughness:.55,metalness:.3});
const newConcrete=M({map:T(concreteC,1.6),color:'#c4c3bb',roughness:.95}),cabinTile=mat.bathTile;
const siteLit=M({color:'#6a5a40',emissive:'#ffcf8a',emissiveIntensity:0,roughness:1});
// a piece is built with the ordinary helpers in the tower's own frame, merged per material, then moved onto the site
function piece(build){const tmp=new THREE.Group();build(tmp);tmp.updateMatrixWorld(true);const buckets=new Map();
 tmp.traverse(o=>{if(!o.isMesh)return;let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));const mode=o.material.userData.uv||'world';if(mode!=='keep')projectUV(g,mode);g.applyMatrix4(SITE_M);
  if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(g)});
 const P=new THREE.Group();P.visible=false;const box=new THREE.Box3();for(const[m,gs]of buckets){const mg=mergeGeometries(gs,false);mg.computeBoundingSphere();mg.computeBoundingBox();box.union(mg.boundingBox);const me=new THREE.Mesh(mg,m);me.castShadow=!m.transparent;me.receiveShadow=true;P.add(me)}
 P.userData.top=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,(box.min.z+box.max.z)/2);P.userData.half=new THREE.Vector2((box.max.x-box.min.x)/2,(box.max.z-box.min.z)/2);site.add(P);return P}
// static: churned ground, board fence with a gate, a stack of floor slabs, the site cabin, a panel carrier with its load
{const st=new THREE.Group();site.add(st);bx(st,-62,-6,-.02,.07,31,58,mud);
 for(let x=-62;x<-6;x+=2.05){if(x>-26&&x<-18)continue;bx(st,x,x+2,0,2.1,30.8,30.9,boards)}for(let z=31;z<58;z+=2.05){bx(st,-62.1,-62,0,2.1,z,z+2,boards);bx(st,-6.1,-6,0,2.1,z,z+2,boards)}
 for(let k=0;k<6;k++)bx(st,-58,-52,.07+k*.24,.29+k*.24,34,37.2,newConcrete);for(const x of[-57,-53])bx(st,x,x+.15,.07,.12,33.8,37.4,boards);
 bx(st,-14,-10,0,2.6,52,54.4,M({color:'#5a6a5a',roughness:.7}));bx(st,-14.1,-9.9,2.6,2.75,51.9,54.5,mat.steel);bx(st,-13,-12,.9,1.9,51.97,52,mat.glassFake);
 // panel carrier (панелевоз): tractor unit and an A-frame trailer with three room-sized panels leaning on it
 const tx=-22,tz=33.2;rbox(st,tx+6.2,1.35,tz,2.1,2.1,2.4,.12,M({color:'#4f6a5e',roughness:.5,metalness:.2}));bx(st,tx+5.3,tx+6.9,1.9,2.35,tz-1.15,tz+1.15,mat.glassFake);
 bx(st,tx-3,tx+5,.75,.95,tz-1.1,tz+1.1,mat.metalDark);for(const x of[tx-2,tx-.9,tx+3.8,tx+6.6])for(const s of[-1,1]){const w=cyl(st,x,.5,tz+s*1.05,.5,.5,.35,mat.black,16,Math.PI/2)}
 for(const s of[-1,1]){sqrod(st,[tx-2.6,.95,tz],[tx-2.6,3.6,tz+s*.05],.12,mat.metalDark);sqrod(st,[tx+4.4,.95,tz],[tx+4.4,3.6,tz+s*.05],.12,mat.metalDark)}bx(st,tx-2.7,tx+4.5,3.5,3.62,tz-.1,tz+.1,mat.metalDark);
 for(const s of[-1,1])for(let k=0;k<(s>0?2:1);k++){const p=bx(st,tx-2.3,tx+4.1,.95,3.45,tz+s*(.22+k*.3),tz+s*(.22+k*.3)+s*.24,newConcrete);p.rotation.x=s*.08}
 st.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}})}
// the tower crane behind the block: lattice mast, slewing jib, trolley, hook with a four-leg sling
const crane=new THREE.Group();site.add(crane);const CRW=toWorld(0,0,-9.5),CRX=CRW.x,CRZ=CRW.z,CRH=22;
{const q=crane,s=.8;for(const[a,b]of[[-s,-s],[s,-s],[s,s],[-s,s]])rod(q,[CRX+a,0,CRZ+b],[CRX+a,CRH,CRZ+b],.06,craneYellow,6);
 for(let y=0;y<CRH;y+=2){const c=[[-s,-s],[s,-s],[s,s],[-s,s],[-s,-s]];for(let i=0;i<4;i++){rod(q,[CRX+c[i][0],y,CRZ+c[i][1]],[CRX+c[i+1][0],y+2,CRZ+c[i+1][1]],.025,craneYellow,4);rod(q,[CRX+c[i][0],y,CRZ+c[i][1]],[CRX+c[i+1][0],y,CRZ+c[i+1][1]],.025,craneYellow,4)}}
 bx(q,CRX-2,CRX+2,-.2,.6,CRZ-2,CRZ+2,mat.plinth);q.traverse(o=>{if(o.isMesh)o.castShadow=true})}
const slew=new THREE.Group();slew.position.set(CRX,CRH,CRZ);crane.add(slew);
{const q=slew;for(const z of[-.6,.6])rod(q,[-9,0,z],[32,0,z],.07,craneYellow,6);rod(q,[-9,1.4,0],[32,.3,0],.06,craneYellow,6);for(let x=-9;x<32;x+=1.6){for(const z of[-.6,.6])rod(q,[x,0,z],[x+.8,1.4-(x+9)*.027,0],.025,craneYellow,4);rod(q,[x,0,-.6],[x,0,.6],.025,craneYellow,4)}
 rod(q,[0,0,0],[0,5,0],.1,craneYellow,6);rod(q,[0,5,0],[30,.3,0],.02,mat.metalDark,4);rod(q,[0,5,0],[-9,.3,0],.02,mat.metalDark,4);
 bx(q,-9,-6,-1.4,.2,-1,1,mat.plinth);bx(q,-.2,1.8,-1.6,.2,.7,2.2,M({color:'#d9d4c3',roughness:.6}));bx(q,1.8,1.82,-1.4,-.1,.8,2.1,mat.glassFake)}
const trolley=new THREE.Group();slew.add(trolley);bx(trolley,-.5,.5,-.4,0,-.7,.7,mat.metalDark);
const hook=new THREE.Mesh(new THREE.BoxGeometry(.4,.5,.3),mat.metalDark);site.add(hook);
const slingGeo=new THREE.BufferGeometry();slingGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(10*3),3));const sling=new THREE.LineSegments(slingGeo,new THREE.LineBasicMaterial({color:'#2a2a28'}));sling.frustumCulled=false;site.add(sling);
crane.traverse(o=>{if(o.isMesh)o.castShadow=true});

// ── the kit, in order. Phases: foundation, five floors, roof — floor 1 is the floor of flat № 6 and is built slowly
const PHASES=[];const phase=(t0,t1)=>{const p={t0,t1,pieces:[]};PHASES.push(p);return p};
const add=(ph,fn)=>ph.pieces.push(piece(fn));
const BAYS=[-12,-8.76,-4.26,-1.65,1.65,4.26,8.76,12];
{const ph=phase(.02,.08);for(const[a,b,c,d]of[[-12,12,5.7,6],[-12,12,-6,-5.7],[-12,-11.7,-5.7,5.7],[11.7,12,-5.7,5.7],[-12,12,-.1,.1]])add(ph,g=>bx(g,a,b,0,F0,c,d,mat.plinth))}
const IW=[['z',2.98,3.1,1.65,4.2,[[2.5,3.3]]],['z',-1.72,-1.6,1.65,4.2,[[1.95,2.6]]],['z',-3.62,-3.5,1.5,11.7,[]],['x',4.2,4.32,-5.7,5.7,[[1.35,2.65]]],['z',.73,.85,4.32,11.7,[]],['x',8.7,8.82,-5.7,5.7,[[1.3,2.1],[-4.2,-3.4]]],['x',3.45,3.55,-1.6,.53,[[-1.05,-.4]]],['z',.43,.53,3.45,4.2,[]]];
function iwall(g,[ax,c0,c1,u0,u1,doors],y,s){const holes=doors.map(([a,b])=>({u0:a,u1:b,v0:y-1,v1:y+2.05}));if(ax==='z'){const a=s>0?u0:-u1,b=s>0?u1:-u0;wall(g,'z',c0,c1,a,b,y,y+H-.22,s>0?holes:holes.map(h=>({...h,u0:-h.u1,u1:-h.u0})),newConcrete)}else wall(g,'x',s>0?c0:-c1,s>0?c1:-c0,u0,u1,y,y+H-.22,holes,newConcrete)}
function cabin(g,y,s){const X=v=>s*v,x0=Math.min(X(1.66),X(4.19)),x1=Math.max(X(1.66),X(4.19));bx(g,x0,x1,y,y+.06,-3.49,-1.73,cabinTile);for(const[a,b,c,d]of[[x0,x1,-3.49,-3.43],[x0,x1,-1.79,-1.73],[x0,x0+.06,-3.49,-1.73],[x1-.06,x1,-3.49,-1.73]])bx(g,a,b,y,y+2.42,c,d,cabinTile);bx(g,x0,x1,y+2.42,y+2.48,-3.49,-1.73,newConcrete);rbox(g,(X(1.7)+X(3.14))/2,y+.34,-3.14,1.44,.56,.64,.06,mat.enamel)}
function stairUnit(g,y){for(const x of[-1.65,1.5])bx(g,x,x+.15,y,y+H-.22,-1.35,5.7,newConcrete);bx(g,-1.5,1.5,y,y+H-.22,-1.35,-1.2,newConcrete);bx(g,-1.5,1.5,y-.2,y,-1.2,.6,mat.terrazzo);bx(g,-1.5,1.5,y+1.2,y+1.4,3.2,5.7,mat.terrazzo);
 for(const[x0,x1,zS,zE,y0]of[[-1.45,-.35,.6,3.2,y],[.35,1.45,3.2,.6,y+1.4]]){const dir=Math.sign(zE-zS);for(let i=0;i<8;i++){const top=y0+(i+1)*.1556,za=zS+dir*i*.325,zb=zS+dir*(i+1)*.325;bx(g,x0,x1,top-.16,top,Math.min(za,zb),Math.max(za,zb),mat.terrazzo)}}}
function frontPanel(g,f,xa,xb){const y=yF(f),hs=[...frontOpenings(f),...(f>0?frontOpenings(f-1).filter(o=>o.kind==='stair'):[])].map(o=>({u0:o.c-o.w/2,u1:o.c+o.w/2,v0:o.y0,v1:o.y1,kind:o.kind})).filter(h=>h.u0>=xa-.01&&h.u1<=xb+.01);
 if(xa<0&&xb>0&&f===0)hs.push({u0:-.7,u1:.7,v0:y-1,v1:y+1.1,kind:'entry'});wall(g,'z',5.7,6,xa,xb,Math.max(y,F0),y+H,hs,mat.facade);for(const h of hs){if(h.kind==='entry')continue;const v0=Math.max(h.v0,y),v1=Math.min(h.v1,y+H);if(v1-v0>.3)windowUnit(g,'z',6,-1,h.u0,h.u1,v0,v1,{real:true,door:h.kind==='balc'})}}
function backPanel(g,f,xa,xb){const y=yF(f),hs=backHoles.filter(h=>h.n===f&&h.u0>=xa-.01&&h.u1<=xb+.01);wall(g,'z',-6,-5.7,xa,xb,y,y+H,hs,mat.facade);for(const h of hs)windowUnit(g,'z',-6,1,h.u0,h.u1,h.v0,h.v1,{real:true})}
function sidePanel(g,f,s,za,zb){const y=yF(f),hs=sideHoles.filter(h=>h.n===f&&h.u0>=za-.01&&h.u1<=zb+.01),c0=s>0?11.7:-12,c1=s>0?12:-11.7;wall(g,'x',c0,c1,za,zb,y,y+H,hs,mat.facade);for(const h of hs)windowUnit(g,'x',s>0?12:-12,s>0?-1:1,h.u0,h.u1,h.v0,h.v1,{real:true})}
for(let f=0;f<SFLOORS;f++){const ph=f===0?phase(.08,.24):f===1?phase(.26,.62):phase(.62+(f-2)*.085,.62+(f-1)*.085),y=yF(f);
 for(let i=0;i<7;i++)for(const[za,zb]of[[-6,0],[0,6]])add(ph,g=>bx(g,BAYS[i]+.01,BAYS[i+1]-.01,y-.22,y,za+.01,zb-.01,newConcrete));
 for(let i=0;i<7;i++)add(ph,g=>backPanel(g,f,BAYS[i],BAYS[i+1]));
 for(const s of[-1,1])for(const[za,zb]of[[-5.7,0],[0,5.7]])add(ph,g=>sidePanel(g,f,s,za,zb));
 if(f===APT){for(const w of IW)add(ph,g=>iwall(g,w,y,1));add(ph,g=>{for(const w of IW)iwall(g,w,y,-1)})}else for(const s of[-1,1])add(ph,g=>{for(const w of IW)iwall(g,w,y,s)});
 for(const s of[-1,1])add(ph,g=>cabin(g,y,s));
 add(ph,g=>stairUnit(g,y));
 const order=[0,1,2,3,6,5,4];for(const i of order)add(ph,g=>frontPanel(g,f,BAYS[i],BAYS[i+1]));
 if(f>0)for(const s of[-1,1])add(ph,g=>{const xa=s>0?8.95:-11.85,xb=s>0?11.85:-8.95;bx(g,xa,xb,y-.16,y,6,7.25,mat.plinth);bx(g,xa,xb,y,y+1.02,7.13,7.21,newConcrete);bx(g,xa,xa+.08,y,y+1.02,6,7.21,newConcrete);bx(g,xb-.08,xb,y,y+1.02,6,7.21,newConcrete)})}
{const ph=phase(.87,.92),y=yF(SFLOORS);for(let i=0;i<4;i++)add(ph,g=>bx(g,-12+i*6,-6+i*6,y-.22,y,-6,6,mat.roof));add(ph,g=>{bx(g,-12,12,y,y+.6,5.8,6,mat.facade);bx(g,-12,12,y,y+.6,-6,-5.8,mat.facade)})}
// when the family moves in: some windows light up around the block (not the new flat № 6 — the camera is inside it)
const siteLife=piece(g=>{for(let f=0;f<SFLOORS;f++)for(const o of frontOpenings(f)){if(o.kind==='stair'||(f===APT&&o.c>1.65)||rnd()<.45)continue;bx(g,o.c-o.w/2,o.c+o.w/2,o.y0,o.y1,5.3,5.32,siteLit)}});

// ── the new flat № 6. When the block is finished the camera climbs in through the living-room window of the flat on the same
// plan as the one you walked through. The finishers come first (whitewash, plaster, parquet, skirting, the window's inner sash
// and the doors), then the paper, then the family's things one by one — the same room, rebuilt in another building. Nothing is
// invented: every piece is copied from the living room itself, and arrives with the same dissolve as the as-lived slider.
const HOME=new THREE.Group();HOME.name='newflat';HOME.visible=false;site.add(HOME);const uArrive={value:0},HOME_GLOW=[];
// the site's slabs are 2 cm thicker than the tower's ceiling lining allows: squash the copy by a hair so the ceiling shows
const ARR_SQ=new THREE.Matrix4().makeTranslation(0,AY,0).multiply(new THREE.Matrix4().makeScale(1,(H-.226)/CH,1)).multiply(new THREE.Matrix4().makeTranslation(0,-AY,0));
function arriveShader(sh){sh.uniforms.uArrive=uArrive;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aArr;uniform float uArrive;varying float vArr;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat ae=clamp((uArrive-aArr.x)/aArr.z,0.,1.);vArr=ae;transformed.y+=aArr.y*(1.-ae)*(1.-ae)*.55;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vArr;').replace('void main() {','void main() {\nif(vArr<.001)discard;')}
const arriveW=function(sh,r){weatherPatch.call(this,sh,r);arriveShader(sh);sh.fragmentShader=sh.fragmentShader.replace('step(vWP.y,34.4);','step(vWP.y,34.4);inside=1.;').replace('#include <map_fragment>','#include <map_fragment>\nif(vArr<.999){float an=wn(vWP.xz*3.1+vWP.y*2.3)*.5+wn(vWP.xy*8.3+vWP.z*2.1)*.3+wn(vWP.zy*21.+vWP.x*5.)*.2;if(an>vArr*1.05-.02)discard;}')};
const arriveP=function(sh){arriveShader(sh);sh.fragmentShader=sh.fragmentShader.replace('if(vArr<.001)discard;','if(vArr<.001||fract(sin(dot(floor(gl_FragCoord.xy*.5),vec2(12.9898,78.233)))*43758.5453)>vArr)discard;')};
const _arrMats=new Map();function arriveMat(m){let c=_arrMats.get(m);if(c)return c;const w=m.onBeforeCompile===weatherPatch;c=m.clone();c.userData=Object.assign({},m.userData);c.onBeforeCompile=w?arriveW:arriveP;c.customProgramCacheKey=()=>w?'arriveW':'arriveP';
 if(c.emissive&&c.emissiveIntensity>0&&c.emissive.getHex()!==0){c.userData.glow=c.emissiveIntensity;HOME_GLOW.push(c)}_arrMats.set(m,c);return c}
const homeLight=new THREE.PointLight('#ffd49c',0,8,2);homeLight.position.copy(toWorld(6.5,AY+2.0,3.25));scene.add(homeLight);
const homeDay=new THREE.PointLight('#dce7e3',0,8,1.5);homeDay.position.copy(toWorld(6.5,AY+1.55,5.0));scene.add(homeDay);
const SITE_PLANTS=[];
{const recs=[],bb=new THREE.Box3();const inRoom=b=>b.min.x>4.29&&b.max.x<8.72&&b.min.z>.7&&b.max.z<5.75&&b.min.y>AY-.05&&b.max.y<AY+CH+.05;
 for(const g of[living,hall,bedroom]){g.updateMatrixWorld(true);g.traverse(o=>{if(!o.isMesh)return;bb.setFromObject(o);if(g!==living&&!inRoom(bb))return;recs.push({o,box:bb.clone(),m:o.material,id:o.userData.lived})})}
 // 1 · the fit-out, in the order the finishers worked; 2 · the paper; 3 · the furniture, grouped into whole pieces
 const FIT=[[mat.ceiling,.08,.07],[mat.bareWall,.13,.07],[mat.parquet,.18,.07],[mat.baseboard,.24,.04]];
 const fit=recs.filter(r=>!r.id&&r.m!==mat.tulle&&r.m!==mat.curtain),paper=recs.filter(r=>r.id===true),things=recs.filter(r=>typeof r.id==='number'||r.m===mat.tulle||r.m===mat.curtain);
 fit.forEach((r,i)=>{const f=FIT.find(q=>q[0]===r.m);if(f){r.t=f[1]+(i%5)*.006;r.dur=f[2]}else{r.t=.27+(i/fit.length)*.08;r.dur=.04}r.mot=0});
 paper.forEach((r,i)=>{r.t=.35+i*.01;r.dur=.07;r.mot=0});
 // pieces: statements that touch belong together (a stenka's carcass, doors, shelves, books); rugs and hangings stand alone
 const items=new Map();for(const r of things){const k=typeof r.id==='number'?r.id:'soft';if(!items.has(k))items.set(k,{k,box:new THREE.Box3(),recs:[]});const it=items.get(k);it.box.union(r.box);it.recs.push(r)}
 const list=[...items.values()],par=list.map((_,i)=>i),find=i=>par[i]===i?i:(par[i]=find(par[i])),sz=new THREE.Vector3();
 const flat=it=>{it.box.getSize(sz);return Math.min(sz.x,sz.y,sz.z)<.03&&Math.max(sz.x,sz.y,sz.z)>.5};
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){if(flat(list[i])||flat(list[j])||list[i].k==='soft'||list[j].k==='soft')continue;if(list[i].box.clone().expandByScalar(.015).intersectsBox(list[j].box))par[find(i)]=find(j)}
 const groups=new Map();list.forEach((it,i)=>{const r=find(i);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(it)});
 const vol=g=>{const b=new THREE.Box3();for(const it of g)b.union(it.box);b.getSize(sz);return{b,v:sz.x*sz.y*sz.z}};
 const order=[...groups.values()].map(g=>({g,...vol(g)})).map(o=>Object.assign(o,{rank:o.b.max.y<AY+.05?-1:o.g.some(it=>it.k==='soft')?.02:o.v})).sort((a,b)=>b.rank===a.rank?0:a.rank<0?-1:b.rank<0?1:b.rank-a.rank);
 let n=0;for(const o of order)n+=1+o.g.length*.35;let c=0;
 for(const o of order){c+=1;o.g.sort((a,b)=>(a.k==='soft'?1e9:a.k)-(b.k==='soft'?1e9:b.k));for(const it of o.g){const t=.44+(c/n)*.4;for(const r of it.recs){r.t=t;r.dur=.045;r.mot=o.rank<0?0:1}c+=.35}}
 const buckets=new Map();
 for(const r of recs){if(r.t===undefined)continue;const o=r.o;let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
  if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));const mode=r.m.userData.uv||'world';if(mode!=='keep')projectUV(g,mode);g.applyMatrix4(ARR_SQ).applyMatrix4(SITE_M);
  const a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=r.t;a[i+1]=r.mot;a[i+2]=r.dur}g.setAttribute('aArr',new THREE.BufferAttribute(a,3));
  const m=arriveMat(r.m);if(!buckets.has(m))buckets.set(m,[]);buckets.get(m).push(g)}
 for(const[m,gs]of buckets){const mg=mergeGeometries(gs,false);gs.forEach(x=>x.dispose());if(!mg)continue;mg.computeBoundingSphere();const me=new THREE.Mesh(mg,m);me.receiveShadow=true;me.castShadow=false;me.userData.scan=true;me.frustumCulled=false;HOME.add(me)}
 // the geraniums and the ficus come too
 for(const s of plantSpots)if(s.x>4.3&&s.x<8.72&&s.z>.7&&s.z<5.75&&s.y>AY-.1&&s.y<AY+CH){const w=toWorld(s.x,AY+(s.y-AY)*(H-.226)/CH,s.z);SITE_PLANTS.push(Object.assign({},s,{x:w.x,y:w.y,z:w.z}))}}
let homeT=-1;
function homeUpdate(h){h=clamp(h,0,1);if(Math.abs(h-homeT)<1e-4)return;homeT=h;uArrive.value=h;HOME.visible=h>.001;const done=h<.9;HOME.children.forEach(o=>o.userData.scan=done);
 homeDay.intensity=h>0?11*seasonK.inI*smooth(h,0,.04):0;const lamp=smooth(h,.86,.93);homeLight.intensity=5.5*Math.max(.6,seasonK.lamp)*lamp;for(const m of HOME_GLOW)m.emissiveIntensity=m.userData.glow*(.08+.92*lamp);
 siteLit.emissiveIntensity=smooth(h,.88,1)*1.1;siteLife.visible=h>.88;const sp=splatSets.find(o=>o.name==='siteplants');if(sp){sp.visible=h>.5;sp.material.uniforms.uOpacity.value=smooth(h,.7,.8)}}
let siteT=-1;const _hp=new THREE.Vector3(),_hk=new THREE.Vector3();
function siteUpdate(t){t=clamp(t,0,1);if(Math.abs(t-siteT)<1e-4)return;siteT=t;let active=null;
 for(const ph of PHASES){const n=ph.pieces.length,span=(ph.t1-ph.t0)/n,len=span*3;ph.pieces.forEach((p,i)=>{const st=ph.t0+i*span,e=clamp((t-st)/Math.min(len,ph.t1+span-st),0,1);if(e<=0){p.visible=false;return}p.visible=true;
  const k=e<.6?0:(e-.6)/.4,ease=1-Math.pow(1-k,3),lift=e<.6?1:1-ease;p.position.set(Math.sin(e*8+i)*.18*lift,14*lift,Math.cos(e*6+i)*.14*lift);if(e<1)active=p})}
  const top=active?_hp.copy(active.userData.top).add(active.position):_hp.set(SCX,yF(SFLOORS)+3,SCZ);const dx=top.x-CRX,dz=top.z-CRZ;slew.rotation.y=-Math.atan2(dz,dx);trolley.position.set(clamp(Math.hypot(dx,dz),3,30),-.3,0);
 crane.updateMatrixWorld(true);trolley.getWorldPosition(_hk);const hy=top.y+2.2;hook.position.set(top.x,hy,top.z);const a=slingGeo.attributes.position;a.setXYZ(0,_hk.x,_hk.y-.4,_hk.z);a.setXYZ(1,top.x,hy+.25,top.z);
 const h=active?active.userData.half:new THREE.Vector2(.3,.3);let k=2;for(const[sx,sz]of[[-1,-1],[1,-1],[1,1],[-1,1]]){a.setXYZ(k++,top.x,hy-.25,top.z);a.setXYZ(k++,top.x+sx*Math.min(h.x,2.5)*.9,top.y,top.z+sz*Math.min(h.y,2.5)*.9)}a.needsUpdate=true;sling.visible=hook.visible=!!active}
siteUpdate(0);
