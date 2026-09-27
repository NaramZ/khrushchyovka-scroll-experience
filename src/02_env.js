
// ───────────────────────── geometry helpers ─────────────────────────
const ROOTS=[];let LIVED=false,ITEM=0;const LIVED_MESHES=[];
function group(name,opt={}){const g=new THREE.Group();g.name=name;Object.assign(g.userData,opt);scene.add(g);ROOTS.push(g);return g}
function mesh(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0){const o=new THREE.Mesh(geo,m);o.userData.lived=LIVED;o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o}
function box(g,x,y,z,w,h,d,m,ry=0){return mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z,0,ry,0)}
function bx(g,x0,x1,y0,y1,z0,z1,m){if(Math.abs(x1-x0)<1e-4||Math.abs(y1-y0)<1e-4||Math.abs(z1-z0)<1e-4)return null;return box(g,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,Math.abs(x1-x0),Math.abs(y1-y0),Math.abs(z1-z0),m)}
function rbox(g,x,y,z,w,h,d,r,m,ry=0,seg=3){r=Math.min(r,w/2-1e-3,h/2-1e-3,d/2-1e-3);return mesh(g,new RoundedBoxGeometry(w,h,d,seg,Math.max(r,1e-3)),m,x,y,z,0,ry,0)}
function cyl(g,x,y,z,rt,rb,h,m,seg=16,rx=0,rz=0,ry=0){return mesh(g,new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z,rx,ry,rz)}
function sph(g,x,y,z,r,m,sx=1,sy=1,sz=1,seg=16){const o=mesh(g,new THREE.SphereGeometry(r,seg,Math.max(6,Math.round(seg*.7))),m,x,y,z);o.scale.set(sx,sy,sz);return o}
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_d=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
function rod(g,a,b,r,m,seg=8){_a.set(...a);_b.set(...b);const len=_a.distanceTo(_b);if(len<1e-4)return;const o=mesh(g,new THREE.CylinderGeometry(r,r,len,seg),m);o.position.copy(_a).add(_b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(_up,_d.subVectors(_b,_a).normalize());return o}
function sqrod(g,a,b,t,m){_a.set(...a);_b.set(...b);const len=_a.distanceTo(_b);const o=mesh(g,new THREE.BoxGeometry(t,len,t),m);o.position.copy(_a).add(_b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(_up,_d.subVectors(_b,_a).normalize());return o}
function poly(g,pts,r,m,seg=8){for(let i=1;i<pts.length;i++)rod(g,pts[i-1],pts[i],r,m,seg);for(let i=1;i<pts.length-1;i++)sph(g,...pts[i],r,m,1,1,1,seg)}
function lathe(g,pts,x,y,z,m,seg=28){return mesh(g,new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg),m,x,y,z)}
function plane(g,x,y,z,w,h,m,rx=0,ry=0,rz=0){return mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z,rx,ry,rz)}
// A wall slab pierced by rectangular openings. axis 'x' → wall normal along x (u runs along z), axis 'z' → normal along z (u runs along x)
function wall(g,axis,c0,c1,u0,u1,v0,v1,holes,m){const ys=new Set([v0,v1]);for(const h of holes){if(h.v1<=v0||h.v0>=v1)continue;ys.add(clamp(h.v0,v0,v1));ys.add(clamp(h.v1,v0,v1))}const Y=[...ys].sort((a,b)=>a-b);
 for(let i=0;i<Y.length-1;i++){const a=Y[i],b=Y[i+1];if(b-a<1e-4)continue;const mid=(a+b)/2,cuts=holes.filter(h=>h.v0<mid&&h.v1>mid).map(h=>[Math.max(u0,h.u0),Math.min(u1,h.u1)]).sort((p,q)=>p[0]-q[0]);let cur=u0;
  const seg=(p,q)=>axis==='x'?bx(g,c0,c1,a,b,p,q,m):bx(g,p,q,a,b,c0,c1,m);for(const[p,q]of cuts){if(p>cur+1e-4)seg(cur,p);cur=Math.max(cur,q)}if(u1>cur+1e-4)seg(cur,u1)}}

// "as lived" things (furniture, carpets, wallpaper, curtains) get their own material twins so they can dissolve away,
// leaving the flat exactly as the standard design delivered it
const _livedCache=new Map();
function livedMat(m){let c=_livedCache.get(m);if(c)return c;if(m.onBeforeCompile===weatherPatch){c=m.clone();c.onBeforeCompile=weatherPatch;c.defines=Object.assign({},m.defines,{LIVED:''});c.userData=Object.assign({},m.userData)}else{c=m.clone();c.userData=Object.assign({},m.userData);c.userData.hardLived=true}c.userData.isLived=true;_livedCache.set(m,c);return c}
// ───────────────────────── baking: merge per material, project UVs in world space ─────────────────────────
const SOLIDS=[],COLLIDERS=[];
const _n=new THREE.Vector3(),_p0=new THREE.Vector3(),_p1=new THREE.Vector3(),_p2=new THREE.Vector3(),_e1=new THREE.Vector3(),_e2=new THREE.Vector3();
function projectUV(geo,mode){const p=geo.attributes.position,count=p.count,uv=new Float32Array(count*2),uv1=(mode==='facade'||mode==='ground')?new Float32Array(count*2):null;
 for(let t=0;t<count;t+=3){_p0.fromBufferAttribute(p,t);_p1.fromBufferAttribute(p,t+1);_p2.fromBufferAttribute(p,t+2);_n.crossVectors(_e1.subVectors(_p1,_p0),_e2.subVectors(_p2,_p0));const ax=Math.abs(_n.x),ay=Math.abs(_n.y),az=Math.abs(_n.z);
  for(let k=0;k<3;k++){const i=t+k,x=p.getX(i),y=p.getY(i),z=p.getZ(i);let u,v;
   if(ax>=ay&&ax>=az){u=_n.x>0?-z:z;v=y}else if(ay>=az){u=x;v=_n.y>0?-z:z}else{u=_n.z>0?x:-x;v=y}
   if(mode==='facade'){uv1[i*2]=u;uv1[i*2+1]=v;let fu;if(ax>=ay&&ax>=az)fu=(z+6)/24+.25;else if(az>=ay)fu=_n.z>0?(x+12)/24:(12-x)/24;else fu=(x+12)/24;uv[i*2]=fu;uv[i*2+1]=y/FH}
   else if(mode==='ground'){uv[i*2]=u;uv[i*2+1]=v;uv1[i*2]=(x+160)/320;uv1[i*2+1]=(-z+160)/320}
   else{uv[i*2]=u;uv[i*2+1]=v}}}
 geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(uv1)geo.setAttribute('uv1',new THREE.BufferAttribute(uv1,2))}
function bake(g){g.updateMatrixWorld(true);const list=[];g.traverse(o=>{if(o.isMesh&&!o.userData.live)list.push(o)});const buckets=new Map();
 for(const o of list){let geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);for(const k of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(k))geo.deleteAttribute(k);
  const m=o.material,mode=m.userData.uv||'world';if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));if(mode!=='keep')projectUV(geo,mode);
  const key=o.userData.lived?livedMat(m):m;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(geo);o.geometry.dispose();o.parent.remove(o)}
 for(const c of[...g.children])if(!c.isMesh&&!c.isLight&&!c.isPoints&&c.children.length===0)g.remove(c);
 for(const[m,geos]of buckets){const merged=mergeGeometries(geos,false);geos.forEach(x=>x.dispose());if(!merged)continue;merged.computeBoundingSphere();merged.computeBoundingBox();const o=new THREE.Mesh(merged,m);o.castShadow=g.userData.cast!==false&&m.userData.cast!==false;o.receiveShadow=true;o.userData.solid=!m.transparent;o.matrixAutoUpdate=false;g.add(o);if(!m.transparent)SOLIDS.push(o);if(!m.userData.noCollide)COLLIDERS.push(o);if(m.userData.isLived)LIVED_MESHES.push(o)}
 g.userData.bounds=new THREE.Box3().setFromObject(g);return g}

// ───────────────────────── sky, image based light, sun ─────────────────────────
// Autumn and winter: a low, milky overcast with only a brighter veil. Spring and summer open up: blue, a sun, white cloud.
function skyCanvas(stops,o={}){const glow=o.glow??.35,nC=o.clouds??90,dark=o.dark??.3;const W=1024,Hh=512,[c,x]=cnv(W,Hh);const g=x.createLinearGradient(0,0,0,Hh);
 g.addColorStop(0,stops[0]);g.addColorStop(.3,stops[1]);g.addColorStop(.47,stops[2]);g.addColorStop(.5,stops[3]);g.addColorStop(.56,stops[3]);g.addColorStop(1,stops[4]);x.fillStyle=g;x.fillRect(0,0,W,Hh);
 const su=(Math.atan2(sunDir.z,sunDir.x)/(2*Math.PI)+.5)*W,sv=(.5-Math.asin(sunDir.y)/Math.PI)*Hh;for(const off of[-W,0,W]){const r=x.createRadialGradient(su+off,sv,0,su+off,sv,Hh*.6);r.addColorStop(0,`rgba(255,252,240,${glow})`);r.addColorStop(1,'rgba(255,255,250,0)');x.fillStyle=r;x.fillRect(0,0,W,Hh);if(o.disc){const d=x.createRadialGradient(su+off,sv,0,su+off,sv,Hh*.05);d.addColorStop(0,`rgba(255,255,248,${o.disc})`);d.addColorStop(.35,`rgba(255,250,235,${o.disc*.9})`);d.addColorStop(1,'rgba(255,250,235,0)');x.fillStyle=d;x.fillRect(0,0,W,Hh)}}
 x.globalCompositeOperation='soft-light';for(let i=0;i<nC;i++){const cy=rand(Hh*.05,Hh*.48),cx=rand(0,W),rw=rand(80,300),rh=rand(12,50),r=x.createRadialGradient(cx,cy,0,cx,cy,rw);const l=rnd()>.5;r.addColorStop(0,l||rnd()>dark/.3?'rgba(255,255,255,.4)':`rgba(40,50,48,${dark})`);r.addColorStop(1,'rgba(128,128,128,0)');x.save();x.translate(cx,cy);x.scale(1,rh/rw);x.translate(-cx,-cy);x.fillStyle=r;x.fillRect(cx-rw,cy-rw,rw*2,rw*2);x.restore()}
 return c}
const pmrem=new THREE.PMREMGenerator(renderer);let skyTex=null,envRT=null;
function setSky(stops,o){const t=new THREE.CanvasTexture(skyCanvas(stops,o));t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;const rt=pmrem.fromEquirectangular(t);scene.background=t;scene.environment=rt.texture;if(skyTex)skyTex.dispose();if(envRT)envRT.dispose();skyTex=t;envRT=rt}
setSky(['#8e9b96','#a7b1aa','#b9c1b8','#b3bab0','#7d8278']);scene.environmentIntensity=.85;
const hemi=new THREE.HemisphereLight('#c7d1cd','#4d4c42',.95);scene.add(hemi);
const sun=new THREE.DirectionalLight('#e6ece6',.55);sun.castShadow=tier>0;sun.shadow.mapSize.set(tier===2?4096:2048,tier===2?4096:2048);sun.shadow.bias=-.0002;sun.shadow.normalBias=.045;sun.shadow.radius=3;scene.add(sun,sun.target);
function frameShadow(cx,cy,cz,r){sun.target.position.set(cx,cy,cz);sun.position.set(cx,cy,cz).addScaledVector(sunDir,120);const c=sun.shadow.camera;c.left=-r;c.right=r;c.top=r;c.bottom=-r;c.near=20;c.far=260;c.updateProjectionMatrix();sun.target.updateMatrixWorld();sun.updateMatrixWorld();renderer.shadowMap.needsUpdate=true}
frameShadow(0,14,0,42);

// ───────────────────────── post processing ─────────────────────────
let composer=null,gtao=null,bloom=null,grade=null;
function buildComposer(){if(tier===0)return;const rt=new THREE.WebGLRenderTarget(innerWidth*pixelRatio,innerHeight*pixelRatio,{type:THREE.HalfFloatType,samples:tier===2?4:0});composer=new EffectComposer(renderer,rt);composer.setPixelRatio(pixelRatio);composer.setSize(innerWidth,innerHeight);composer.addPass(new RenderPass(scene,camera));
 if(tier===2){gtao=new GTAOPass(scene,camera,innerWidth*pixelRatio,innerHeight*pixelRatio);gtao.output=GTAOPass.OUTPUT.Default;gtao.blendIntensity=1;gtao.updateGtaoMaterial({radius:.6,distanceExponent:1.6,thickness:1.2,scale:1.2,samples:12,distanceFallOff:1,screenSpaceRadius:false});gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:5,rings:2,samples:16});
  const gs=gtao.setSize.bind(gtao);gtao.setSize=(w,h)=>gs(Math.max(1,Math.round(w*.5)),Math.max(1,Math.round(h*.5)));gtao.setSize(innerWidth*pixelRatio,innerHeight*pixelRatio);const ov=gtao.overrideVisibility.bind(gtao);gtao.overrideVisibility=function(){ov();this.scene.traverse(o=>{if(o.isMesh&&((o.material&&o.material.transparent)||o.userData.scan))o.visible=false})};composer.addPass(gtao)}
 bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.32,.7,.95);composer.addPass(bloom);
 // colour grade in linear light: Tarkovsky's damp palette — desaturated, cyan-green, lifted blacks
 grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uSat:{value:.72},uTint:{value:new THREE.Vector3(.94,1,.97)},uLift:{value:new THREE.Vector3(.012,.017,.016)},uGamma:{value:1},uFade:{value:0},uFadeCol:{value:new THREE.Vector3(.86,.82,.74)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;uniform float uSat,uGamma,uFade;uniform vec3 uTint,uLift,uFadeCol;varying vec2 vUv;void main(){vec4 t=texture2D(tDiffuse,vUv);vec3 c=t.rgb;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat)*uTint;c=c+uLift*(1.-clamp(l*3.,0.,1.));c=pow(max(c,0.),vec3(uGamma));/* memory: colour drains to warm sepia, contrast flattens towards paper, the edges of the frame are forgotten first */if(uFade>0.){float m=uFade,l2=dot(c,vec3(.2126,.7152,.0722));c=mix(c,vec3(l2)*vec3(1.05,1.,.9),m*.8);float tone=smoothstep(.05,.62,l2);vec3 shape=mix(vec3(.26,.245,.22),uFadeCol,tone);c=mix(c,shape,m*.6);float r=length((vUv-.5)*vec2(1.2,1.));c=mix(c,uFadeCol,smoothstep(.36,.85,r)*m*.8);}gl_FragColor=vec4(c,t.a);}'});composer.addPass(grade);
 composer.addPass(new OutputPass())}
buildComposer();
