
// ───────────────────────── TYPE IN THE SCENE — a museum walk ─────────────────────────
// Short fragments float beside the route, like placards in a gallery: a few on the approach, several up the stairs,
// one or two in each room. Each belongs to a point on the path; it assembles as you reach it and dissolves as you pass,
// whether you scroll, walk or fly. Colour is sampled from the frame, so the type wears the scene around it.
const cssRenderer=new CSS3DRenderer();cssRenderer.setSize(innerWidth,innerHeight);cssRenderer.domElement.id='type-layer';document.body.insertBefore(cssRenderer.domElement,document.querySelector('.vignette'));
const typeScene=new THREE.Scene(),PLATES=[];
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
function stationHTML(st){return `<div class="st-float">${st.num?`<div class="pl-tag" style="--d:0ms"><span class="pl-num">${st.num}</span><span class="pl-ru">${st.ru}</span></div>`:''}${st.title?`<div class="pl-title"><span class="blk" style="--d:80ms">${esc(st.title)}</span></div>`:''}${st.text?`<p class="pl-copy" style="--d:${st.title?260:60}ms">${esc(st.text)}</p>`:''}${st.html||''}</div>`}
function viewAt(p){const u=curveU(p),P=posCurve.getPoint(u),dir=dirCurve.getPoint(u).normalize(),rt=new THREE.Vector3().crossVectors(dir,_up);if(rt.lengthSq()<1e-6)rt.set(1,0,0);rt.normalize();return{P,dir,rt,up:new THREE.Vector3().crossVectors(rt,dir).normalize()}}
function addStation(st){const el=document.createElement('div');el.className='plate st'+(st.cls?' '+st.cls:'');el.innerHTML=stationHTML(st);el.setAttribute('aria-hidden','true');
 const V=viewAt(st.at),d=st.d,pos=V.P.clone().addScaledVector(V.dir,d).addScaledVector(V.rt,(st.ox??-.3)*d).addScaledVector(V.up,(st.oy??.06)*d);
 const o=new CSS3DObject(el);o.position.copy(pos);o.lookAt(V.P);o.scale.setScalar((st.w??.42)*d/1000);typeScene.add(o);el.style.setProperty('--fl',rand(5,8).toFixed(1)+'s');
 PLATES.push({o,el,p0:st.p0,p1:st.p1,range:Math.max(3.2,d*1.9),zone:st.zone,on:false,vis:0,occ:0,tick:Math.floor(rnd()*8),site:!!st.site})}
const K=i=>keyT[i],mid=(a,b)=>(a+b)/2,lastK=keyT.length-1;
// [route index, fragment, distance ahead, side (−left / +right), height, keyframes it stays for]
const WALK=[
 [1,{num:'01',ru:'МИКРОРАЙОН',title:'The block',text:'A skyline made of repetition: twelve storeys, forty-eight flats, one staircase.'},40,-.32,.1,1],
 [2,{text:'The design: the standard prefab flat — concrete panels made in a factory, assembled on site.'},30,.3,.05,1],
 [3,{num:'02',ru:'ФАСАД',title:'A repeated window',text:'Every window the same size, from Riga to Vladivostok.'},12,-.34,.08,1],
 [4,{text:'Residents answered with their own architecture: glazed, boarded, planted balconies.'},9,.32,.05,1],
 [5,{text:'Подъезд № 1 — one entrance, one staircase, forty-eight front doors.'},5,-.3,.04,1],
 [7,{num:'03',ru:'ПОДЪЕЗД',title:'Between doors',text:'The shared part of home. Everyone passes through; nobody stays.'},2.6,-.32,.06,1],
 [9,{text:'Mailboxes, a radiator, one bulb per landing.'},2,.3,.04,1],
 [10,{text:'Eleven flights up. The norms required a lift only above five storeys.'},3.2,.1,-.02,1],
 [12,{text:'Oil paint to shoulder height, washable where hands and bags touch. Whitewash above.'},1.8,.3,.02,1],
 [14,{text:'A rubbish chute on every half-landing, sold as modern convenience.'},1.9,-.3,.04,1],
 [18,{text:'The hall: coats, a mirror, a telephone — often after years on a waiting list.'},2,.33,.04,1],
 [20,{num:'04',ru:'КУХНЯ',title:'Six square metres',text:'Planned tiny: cooking was meant to move to canteens.'},1.7,-.34,.06,1],
 [21,{text:'It never did. The kitchen became the room for late-night talk.'},1.6,.33,.04,1],
 [23,{num:'05',ru:'ЗАЛ',title:'Nothing ordinary',text:'Living room, dining room, guest room — and a bedroom when the sofa unfolds.'},2.6,-.33,.06,1],
 [25,{text:'The wall carpet: warmth for a cold panel wall, and savings you could hang.'},2.8,-.34,.04,1],
 [26,{text:'The stenka: imported veneer, crystal, subscription books — prestige where goods were scarce.'},2.2,.3,.04,1],
 [28,{num:'06',ru:'СПАЛЬНЯ',title:'A private world',text:'Wardrobe, bed and dressing table: a matching set, waited for for years.'},2,-.3,.06,1],
 [30,{text:'Pillows stacked under lace — a village dowry, carried into the city.'},2.4,-.34,.04,1],
 [32,{num:'07',ru:'БАЛКОН',title:'The world outside',text:'Cellar, pantry, drying room.'},2,-.3,.05,1],
 [34,{text:'Glazing it — rarely with permission — was the only way to add a room.'},8,-.3,.04,0],
 [36,{num:'08',ru:'СИСТЕМА',title:'The system',text:'Across the road, a new block. Watch how it was made.'},12,-.33,.08,0],
 [36,{text:'The design was a method. Vitaly Lagutenko’s K-7 series, from Workshop No. 7 of Mosproekt, is usually credited as the template.'},11,.3,-.02,0],
 [37,{text:'A kit from the house-building factory. In the 1-464 series, wall panels came 2.6 or 3.2 m wide — one per room, windows fitted.'},9,-.3,.05,0],
 [38,{num:'№ 6',ru:'THE ROOM',title:'The room you stood in',text:'A floor slab, the walls, then the bathroom arrives whole — a finished sanitary cabin, lowered in by crane.'},3.2,-.34,.07,0],
 [39,{text:'Five storeys and no lift: the norms required one only above five. The same kit, floor after floor — a Leningrad block went up in five days.'},12,.3,.03,0],
 [40,{text:'Finished — and empty. Every window a room waiting for its family.'},14,-.3,.04,0],
 [42,{text:'Flat № 6 again: the same plan, in another building.'},5,.28,.06,0],
 [44,{num:'09',ru:'НОВОСЕЛЬЕ',title:'Housewarming',text:'Bare concrete. Then the finishers: whitewash, plaster, parquet, paper.'},2.5,-.32,.08,0],
 [45,{text:'Then the family’s things, carried up the stairs: the sofa-bed, the stenka, the carpet for the wall.'},2.4,.3,.06,0],
 [46,{num:'№ 6',ru:'НАЧАЛО',title:'A new story begins',text:'The same room you stood in. Another building, another family — and it starts again.'},2.5,-.3,.07,0]];
for(const[k,st,d,ox,oy,span]of WALK){const k1=Math.min(lastK,k+span);addStation(Object.assign(st,{at:K(k),d,ox,oy,p0:mid(K(Math.max(0,k-1)),K(k)),p1:k1>=lastK?1.01:mid(K(k1),K(Math.min(lastK,k1+1))),zone:K(k)<tOf('door')-.01||k>=34?'out':'in'}))}
// the landing: a placard with the plan of flat № 6 beside a room in a kommunalka
{const sc=40,R=(S,x0,x1,z0,z1,label,area,i,cls='')=>{const[a,b]=S(x0,z0),[c,d]=S(x1,z1),cx=((a+c)/2).toFixed(0),cy=((b+d)/2).toFixed(0);return `<rect class="${cls}" x="${a.toFixed(1)}" y="${b.toFixed(1)}" width="${(c-a).toFixed(1)}" height="${(d-b).toFixed(1)}" style="--i:${i}"/>${label?`<text x="${cx}" y="${cy}">${label}</text>`:''}${area?`<text class="a" x="${cx}" y="${+cy+20}">${area}</text>`:''}`};
 const S6=(x,z)=>[(x-1.4)*sc,(z+3.7)*sc];
 const plan=`<svg class="plan" viewBox="0 0 ${(10.6*sc).toFixed(0)} ${(11.1*sc).toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${R(S6,1.65,4.2,-1.6,2.98,'HALL','10.1 m²',1)}${R(S6,3.55,4.2,-1.6,.43,'STORE','1.3',2,'fill')}${R(S6,1.65,4.2,3.1,5.7,'KITCHEN','6.6 m²',3)}${R(S6,4.32,8.7,.85,5.7,'LIVING ROOM','21.2 m²',4)}${R(S6,8.82,11.7,.85,5.7,'BEDROOM','14.0 m²',5)}${R(S6,1.65,4.2,-3.5,-1.72,'BATH + WC','4.5 m²',6)}${R(S6,8.95,11.85,6.0,7.25,'BALCONY','',7)}</svg>`;
 const ST=(x,z)=>[(x+.2)*sc,(z+1.2)*sc];
 const typ=`<svg class="plan typ" viewBox="0 0 ${(8.8*sc).toFixed(0)} ${(6.7*sc).toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${R(ST,0,3.2,0,5.3,'LIVING','17 m²',1)}${R(ST,3.2,5.8,0,3.5,'ROOM','9 m²',2)}${R(ST,5.8,8.4,0,2.3,'KITCHEN','6 m²',3)}${R(ST,3.2,3.95,3.5,5.3,'','',4,'fill')}${R(ST,3.95,6.8,3.5,5.3,'HALL','',5)}${R(ST,5.8,8.4,2.3,3.5,'','',6)}${R(ST,6.8,8.4,3.5,5.3,'BATH','3 m²',7)}${R(ST,.4,2.8,-1,0,'','',8)}</svg>`;
 const komm=`<svg class="plan komm" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="280" height="280" style="--i:1"/>${[0,1,2,3].map(i=>`<rect x="${10+i*70}" y="10" width="70" height="120" style="--i:${i+2}"/><text x="${45+i*70}" y="78">1 family</text>`).join('')}<rect x="10" y="190" width="140" height="100" style="--i:6"/><text x="80" y="245">shared kitchen</text><rect x="150" y="190" width="140" height="100" style="--i:7"/><text x="220" y="245">shared bath</text></svg>`;
 addStation({at:K(16),d:1.9,ox:-.2,oy:.04,w:.46,p0:mid(K(15),K(16)),p1:mid(K(18),K(19)),zone:'in',cls:'st-plan',num:'№ 6',ru:'THE PLAN',title:'A flat of one’s own',
  html:`<div class="plans"><figure>${plan}<figcaption>Flat № 6, as modelled · ~58 m² · two rooms (the bedroom reached through the living room), own kitchen, combined bathroom, storeroom, balcony</figcaption></figure><figure>${typ}<figcaption>A typical 1-464 two-room flat · ~44 m² · adjoining rooms, 6 m² kitchen, combined bathroom, storeroom — schematic, same scale, after published figures</figcaption></figure><figure>${komm}<figcaption>Before · one room per family in a shared kommunalka</figcaption></figure></div>`})}
{const walk=PLATES.filter(p=>!p.hero).sort((a,b)=>a.p0-b.p0);walk.forEach((p,i)=>{const nx=walk.slice(i+1).find(q=>q.p0>p.p0+.002);p.p1=Math.max(p.p1,p.p0+.03,nx?Math.min(nx.p0+.01,p.p0+.1):p.p1)})}
// the title card of the whole journal hangs in the sky over the district
{const V=viewAt(0),el=document.createElement('div');el.className='plate st hero-plate';el.setAttribute('aria-hidden','true');el.innerHTML=`<div class="st-float"><div class="pl-tag" style="--d:0ms"><span class="pl-num">№ 002</span><span class="pl-ru">Behind the concrete</span></div><div class="pl-title"><span class="blk" style="--d:80ms;font-size:320px">ДОМА</span><br><span class="blk" style="--d:200ms;font-size:70px">A building. A thousand lives.</span></div><p class="pl-copy" style="--d:420ms">A walk into a late-Soviet flat, and the system that built it. Scroll to enter ↓</p></div>`;
 const o=new CSS3DObject(el);o.position.copy(V.P).addScaledVector(V.dir,52).addScaledVector(V.rt,-.17*52).addScaledVector(V.up,.13*52);o.lookAt(V.P);o.scale.setScalar(.44*52/1000);typeScene.add(o);PLATES.push({o,el,p0:-1,p1:.035,range:0,zone:'out',on:false,vis:0,occ:0,tick:0,hero:true})}

// ── the scene's own palette: sample the graded frame, derive ink / paper / accent, ease towards it
const palRT=new THREE.WebGLRenderTarget(24,14,{type:THREE.UnsignedByteType,depthBuffer:false});const palPx=new Uint8Array(24*14*4);
const palMat=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},uExp:{value:1}},vertexShader:quadVS,fragmentShader:'uniform sampler2D tDiffuse;uniform float uExp;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*uExp;c=c/(1.+c*.55);gl_FragColor=vec4(pow(c,vec3(1./2.2)),1.);}',depthTest:false,depthWrite:false});
const palQuad=new FullScreenQuad(palMat);
const PAL={ink:new THREE.Color('#20251f'),paper:new THREE.Color('#dde1db'),accent:new THREE.Color('#c4533a')},_pc=new THREE.Color(),_hsl={};
function samplePalette(){if(!composer)return;palMat.uniforms.tDiffuse.value=composer.writeBuffer.texture;palMat.uniforms.uExp.value=renderer.toneMappingExposure;renderer.setRenderTarget(palRT);palQuad.render(renderer);renderer.readRenderTargetPixels(palRT,0,0,24,14,palPx);renderer.setRenderTarget(null);
 const px=[];for(let i=0;i<24*14;i++){const r=palPx[i*4]/255,g=palPx[i*4+1]/255,b=palPx[i*4+2]/255;_pc.setRGB(r,g,b,THREE.SRGBColorSpace);_pc.getHSL(_hsl);px.push({r,g,b,h:_hsl.h,s:_hsl.s,l:_hsl.l})}
 px.sort((a,b)=>a.l-b.l);const avg=arr=>arr.reduce((a,p)=>[a[0]+p.r,a[1]+p.g,a[2]+p.b],[0,0,0]).map(v=>v/arr.length);
 const dk=avg(px.slice(0,Math.ceil(px.length*.22))),lt=avg(px.slice(Math.floor(px.length*.7)));
 new THREE.Color().setRGB(...dk,THREE.SRGBColorSpace).getHSL(_hsl);const inkC=new THREE.Color().setHSL(_hsl.h,Math.min(.35,_hsl.s*1.2),.1);
 new THREE.Color().setRGB(...lt,THREE.SRGBColorSpace).getHSL(_hsl);const papH=_hsl.h,papC=new THREE.Color().setHSL(_hsl.h,Math.min(.18,_hsl.s),Math.max(.84,Math.min(.92,_hsl.l+.1)));
 let best=null,bs=0;for(const p of px){const sc=Math.pow(p.s,1.4)*THREE.MathUtils.smoothstep(p.l,.12,.35)*(1-THREE.MathUtils.smoothstep(p.l,.8,.95));if(sc>bs){bs=sc;best=p}}
 let accC;if(best&&best.s>.2){accC=new THREE.Color().setHSL(best.h,THREE.MathUtils.clamp(best.s*1.5,.55,.85),THREE.MathUtils.clamp(best.l,.46,.58))}else{accC=new THREE.Color().setHSL((.03+papH*.08)%1,.62,.52)}
 PAL.ink.lerp(inkC,.3);PAL.paper.lerp(papC,.3);PAL.accent.lerp(accC,.22);
 const acHSL=PAL.accent.getHSL({});const R=document.documentElement.style;R.setProperty('--ink','#'+PAL.ink.getHexString(THREE.SRGBColorSpace));R.setProperty('--paper','#'+PAL.paper.getHexString(THREE.SRGBColorSpace));R.setProperty('--red','#'+PAL.accent.getHexString(THREE.SRGBColorSpace));R.setProperty('--accent-ink',acHSL.l>.52?'var(--ink)':'#f4f2ec')}

// ── per frame: which fragments are present; never draw one behind the eye, hide it when a wall stands in front
const _tv=new THREE.Vector3(),_fw=new THREE.Vector3(),_tray=new THREE.Raycaster();_tray.firstHitOnly=true;let palTick=0;
function typeUpdate(){const exploring=free||walking,inside=zone==='stair'||zone==='flat';camera.getWorldDirection(_fw);
 for(const p of PLATES){_tv.copy(p.o.position).sub(camera.position);const dist=_tv.length(),ahead=_tv.dot(_fw)/Math.max(dist,1e-4);let want;
  if(p.hero)want=!exploring&&progress<.035;
  else if(!exploring)want=progress>=p.p0&&progress<p.p1;
  else want=!p.site&&dist<p.range&&(p.zone==='in')===inside;
  if(ahead<.25||dist<.55)want=false;
  if(want&&(p.tick++%8===0)){_tray.set(camera.position,_tv.clone().divideScalar(dist));_tray.far=Math.max(0,dist-.3);p.occ=_tray.intersectObjects(SOLIDS,false).length?1:0}
  if(want!==p.on){p.on=want;p.el.classList.toggle('on',want)}
  const tgt=want&&!p.occ?1:0;p.vis=lerp(p.vis,tgt,.1);p.el.style.opacity=p.vis.toFixed(3);p.o.visible=p.vis>.01&&ahead>.1}
 cssRenderer.render(typeScene,camera);
 if(composer&&++palTick%24===1)samplePalette()}

// ── as designed ↔ as lived: dissolve everything a family brought in, leaving the standard flat as delivered
let livedTarget=1;$('#lived').oninput=e=>{livedTarget=+e.target.value};
function livedUpdate(dt){const u=WX.uLived;u.value=lerp(u.value,livedTarget,1-Math.exp(-dt*3.2));const v=u.value;
 for(const o of LIVED_MESHES){const on=o.material.userData.hardLived?v>.5:v>.004;if(o.visible!==on){o.visible=on;o.layers.set(on?0:1);renderer.shadowMap.needsUpdate=true}}
 const pl=splatSets.find(o=>o.name==='plants');if(pl)pl.material.uniforms.uOpacity.value=smooth(v,.2,.9);
 document.body.classList.toggle('in-flat',zone==='flat'||zone==='balcony')}
// ── the website recedes: chrome fades away while you explore, returns when you reach for it
let uiTimer=0;function wakeUI(){document.body.classList.remove('ui-idle');clearTimeout(uiTimer);uiTimer=setTimeout(()=>{if((progress>.03||walking||free)&&document.getElementById('chapters-pop').hidden)document.body.classList.add('ui-idle')},2400)}
addEventListener('mousemove',()=>{if(!document.pointerLockElement)wakeUI()});addEventListener('touchstart',wakeUI,{passive:true});addEventListener('keydown',e=>{if(!['w','a','s','d','shift','q','e'].includes(e.key.toLowerCase()))wakeUI()});wakeUI();
addEventListener('resize',()=>cssRenderer.setSize(innerWidth,innerHeight));
window.domaType={PLATES,PAL,samplePalette:()=>{try{samplePalette();return 'ok'}catch(e){return String(e)}}};
