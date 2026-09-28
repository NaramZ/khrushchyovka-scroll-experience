
// ───────────────────────── bake everything into a handful of draw calls ─────────────────────────
for(const g of ROOTS)bake(g);
// window light: rect area lights stand in for the sky seen through each real window
const windowLights=[];
// daylight bouncing in through each real window (a cheap point source just inside the glass)
// (ranges kept short: point lights pass through walls, and a long one lit the kitchen from the living room and the stair)
function windowLight(x,y,z,w,h,tx,ty,tz,intensity,range=6){const l=new THREE.PointLight('#dce7e3',intensity*w*h*1.15,range,1.5);l.position.set(x,y,z).lerp(new THREE.Vector3(tx,ty,tz),.12/Math.hypot(tx-x,ty-y,tz-z)*6);scene.add(l);windowLights.push({l,base:l.intensity});return l}
windowLight(6.5,Y+1.58,5.64,2.1,1.4,6.5,Y+1.1,0,4.2);windowLight(3.0,Y+1.58,5.64,1.2,1.4,3.0,Y+1.1,0,1.7,3.6);windowLight(9.8,Y+1.58,5.64,1.3,1.4,9.8,Y+1.1,0,3);windowLight(11.03,Y+1.15,5.64,.7,2.2,11.03,Y+1.0,0,2.2);windowLight(0,yF(0)+2.85,5.64,1.4,1.2,0,yF(0)+2.2,0,3.2);
const stairLights=[[0,2.05,4.5,2.2],[0,3.45,-.3,2.2],[0,5.3,4.5,1.8],[0,6.25,-.3,2.2]].map(([x,y,z,i])=>{const l=new THREE.PointLight('#ffd49a',i,6,2);l.position.set(x,y,z);scene.add(l);return{l,base:i}});
const flatLights=[hallLight,kitchenLight,livingLight,bedLight,bedLamp].map(l=>{scene.attach(l);return{l,base:l.intensity}});

// ───────────────────────── the route ─────────────────────────
// [name, position, look-at, dwell] — the camera physically walks through every doorway on the way
const route=[
 ['block',[54,37,68],[0,15,0],1.2],[,[40,27,52],[0,13,0]],[,[25,16,34],[4,9,5]],
 ['facade',[15.5,8.4,20.5],[7.2,5.4,6],1.1],[,[7,3.4,14.5],[.5,2.1,6]],[,[1.3,1.66,9.6],[.3,1.5,5]],
 ['door',[.35,1.62,6.7],[.4,1.6,3]],[,[.4,1.62,4.6],[.85,2.3,1.2]],[,[.85,1.95,2.8],[.8,2.8,.5]],[,[.8,2.6,1.2],[.3,3.6,0]],
 ['stair',[.05,2.45,1.3],[-1.6,4.85,1.0],1.3],[,[-.5,2.65,.3],[-.9,4.2,3.4]],[,[-.85,3.8,2.9],[-.6,4.4,5.2]],[,[-.3,4.0,4.45],[.9,4.6,2.6]],[,[.85,4.3,2.7],[.85,5.5,.2]],[,[.85,5.3,.9],[1.2,5.3,-.3]],
 ['landing',[.7,5.4,-.3],[2.4,5.2,-.3]],[,[1.6,5.4,-.3],[3.0,5.25,.4]],['hall',[2.75,5.4,-.1],[2.9,5.2,3.2],.4],[,[2.9,5.4,2.6],[2.9,5.2,4.4]],[,[2.95,5.4,3.25],[2.6,5.0,5.2]],
 ['kitchen',[3.25,5.42,3.6],[2.1,4.85,5.35],1.2],[,[2.95,5.4,2.75],[4.6,5.3,2.0]],[,[4.27,5.4,2.0],[6.5,5.2,3.2]],[,[5.2,5.4,2.6],[7.5,5.0,3.3]],
 ['living',[5.05,5.45,3.9],[7.4,4.9,1.4],1.3],[,[6.3,5.4,3.1],[8.6,5.2,1.8]],[,[8.2,5.4,1.75],[9.6,5.2,2.2]],[,[8.78,5.4,1.72],[10.0,5.2,2.8]],[,[9.6,5.4,2.4],[10.8,4.9,1.6]],
 ['bedroom',[9.75,5.45,4.65],[11.0,4.75,1.5],1.2],[,[10.4,5.4,4.95],[11.05,5.3,6.5]],[,[11.0,5.4,5.45],[11.0,5.3,7.0]],[,[11.02,5.4,6.05],[10.4,5.2,8]],
 ['balcony',[10.75,5.45,6.22],[5,2.2,20],1.4],[,[6,11,16],[-30,6,42]],
 ['site',[-12,16,20],[-34,6,43],1.0],[,[-27,8.5,25],[-39,5,40]],['room',[-40.4,5.45,31.8],[-40.5,5.1,40],1.8],[,[-30,12,21],[-34,8,43]],['built',[-52,13,20],[-34,8,44],1.4],
 [,[-40.5,5.9,30],[-40.5,5.3,39]],[,[-40.5,5.3,35.6],[-40.3,5.2,41]],[,[-40.3,5.35,38],[-40.8,5.0,41.5]],
 ['home',[-39.05,5.45,39.1],[-41.4,4.9,41.6],7],[,[-39.3,5.4,38.75],[-41.6,5.0,40.9],8],['end',[-38.95,5.5,38.4],[-41.2,5.0,41.7],5]];
const P=route.map(r=>new THREE.Vector3(...r[1])),L=route.map(r=>new THREE.Vector3(...r[2]));
const cum=[0];for(let i=1;i<route.length;i++){const d=P[i].distanceTo(P[i-1]),turn=L[i].clone().sub(P[i]).normalize().angleTo(L[i-1].clone().sub(P[i-1]).normalize());cum.push(cum[i-1]+Math.pow(d,.55)*.55+turn*.35+(route[i-1][3]||0)*.5+(route[i][3]||0)*.5)}
const total=cum[cum.length-1],keyT=cum.map(c=>c/total),tOf=n=>keyT[route.findIndex(r=>r[0]===n)];
const posCurve=new THREE.CatmullRomCurve3(P,false,'centripetal'),dirCurve=new THREE.CatmullRomCurve3(L.map((l,i)=>l.clone().sub(P[i]).normalize().multiplyScalar(3)),false,'catmullrom',.5);
// the build follows the camera: the floor of flat № 6 goes up while you stand at the unfinished living room
function siteProgress(p){const iS=route.findIndex(r=>r[0]==='site'),iR=route.findIndex(r=>r[0]==='room'),A=[[keyT[iS-1],0],[keyT[iS],.05],[keyT[iS+1],.26],[keyT[iR],.5],[keyT[iR+1],.7],[tOf('built'),1]];if(p<=A[0][0])return 0;for(let i=1;i<A.length;i++)if(p<=A[i][0])return lerp(A[i-1][1],A[i][1],(p-A[i-1][0])/(A[i][0]-A[i-1][0]));return 1}
// then the new flat fills: fit-out, paper, furniture, lights — from the moment you climb through the window to the last frame
function homeProgress(p){const iH=route.findIndex(r=>r[0]==='home'),A=[[keyT[iH-1],0],[keyT[iH],.12],[keyT[iH+1],.62],[keyT[route.length-1],1]];if(p<=A[0][0])return 0;for(let i=1;i<A.length;i++)if(p<=A[i][0])return lerp(A[i-1][1],A[i][1],(p-A[i-1][0])/(A[i][0]-A[i-1][0]));return 1}
function curveU(t){let i=0;while(i<keyT.length-2&&t>keyT[i+1])i++;const f=clamp((t-keyT[i])/(keyT[i+1]-keyT[i]),0,1);return(i+f)/(keyT.length-1)}
const chapterNames=['block','facade','stair','kitchen','living','bedroom','balcony','site','home'],stops=chapterNames.map(tOf);
const chapters=[
 {title:'The block',ru:'МИКРОРАЙОН',copy:'A skyline made of repetition. Twelve storeys, forty-eight flats, one staircase.',place:'EXTERIOR · COURTYARD',
  ctx:'In 1955 a decree “on eliminating excesses” ended the ornamented Stalinist style; in 1957 the state promised every family a flat of its own, ending the shared kommunalka. The answer was the factory: identical concrete panels cast off-site and craned into place in weeks. By the 1970s the five-storey Khrushchyovka had grown into nine- to sixteen-storey blocks — more flats per scarce plot, grouped into microdistricts with a school, a shop and a courtyard.'},
 {title:'A repeated<br>window',ru:'ФАСАД',copy:'Glazed balconies, boarded balconies, geraniums. A standard facade quietly becomes a collection of portraits.',place:'EXTERIOR · FACADE',
  ctx:'Standard series — 1-464, II-49, P-44 and dozens more — meant every window was a catalogue part, the same size from Riga to Vladivostok. Residents answered with their own architecture: over the 1980s and 90s balconies were glazed with whatever frames could be found and became pantries, workshops and summer bedrooms. The irregularity is private life leaking through a public grid.'},
 {title:'Between<br>doors',ru:'ПОДЪЕЗД',copy:'The shared part of home. Two-tone paint, a lift, the chute, eleven flights turning upward.',place:'INTERIOR · STAIRWELL',
  ctx:'Stairwells were painted to be scrubbed, not admired: glossy oil paint to shoulder height where hands, bags and prams touch the wall, cheap lime whitewash above — so the line follows the stair. Building norms demanded a lift only above five storeys, which is why the first mass blocks stopped at five; taller blocks brought lifts and a rubbish chute on every half-landing, sold as modern convenience.'},
 {title:'Six square<br>metres',ru:'КУХНЯ',copy:'Tea. Dinner. Ironing. Conversation. The smallest room carries the most life.',place:'FLAT № 6 · KITCHEN',
  ctx:'Early mass-housing kitchens were planned at five to six square metres: cooking was meant to move to canteens, and every metre saved became another flat. It never quite happened. The kitchen turned into the warmest, most private room — away from the formal living room and the thin walls — and “kitchen conversations” late into the night became shorthand for friendship, gossip and quiet dissent.'},
 {title:'Nothing<br>ordinary',ru:'ЗАЛ',copy:'A sofa-bed, the stenka, a family table beneath a carpet hung on the wall.',place:'FLAT № 6 · LIVING ROOM',
  ctx:'In a two-room flat the zal was everything at once — dining room, guest room and, with the sofa unfolded, a bedroom — so furniture had to fold, stack and store. The wall carpet warmed cold panel walls and muffled neighbours, but it was also savings and status: carpets were scarce and queued for. The polished stenka, often imported from the GDR, Czechoslovakia or Yugoslavia, displayed crystal and subscription book sets — prestige where goods were hard to find.'},
 {title:'A private<br>world',ru:'СПАЛЬНЯ',copy:'Pillows stacked like a pyramid, a dressing table with three mirrors, the wardrobe that came with the marriage.',place:'FLAT № 6 · BEDROOM',
  ctx:'Bedroom furniture usually arrived as a set — wardrobe, bed and trumo in matching veneer — bought after years on a waiting list or for a wedding, and kept for decades. The pyramid of pillows under a lace cover came from village dowry tradition: proof of a well-kept house, carried into the new flats by a generation that had only just moved to the city.'},
 {title:'The world<br>outside',ru:'БАЛКОН',copy:'Laundry, jars, a stool. From here the block turns back into a city — every window another room like this one.',place:'FLAT № 6 · BALCONY',
  ctx:'With almost no storage indoors, the balcony became the flat’s cellar and attic: jars of home preserves, skis, potatoes, a bicycle, laundry drying in every season. Most were built open; glazing them later — rarely with permission — was one of the few ways to add space to a flat that was otherwise identical to the one below.'},
 {title:'The system',ru:'СИСТЕМА',copy:'Across the road, a new block. Watch it being made the way the system intended.',place:'MICRODISTRICT · A NEW BLOCK',
  ctx:'The design was never one building but a method: identical reinforced-concrete panels cast in a factory, trucked to site and craned into place, floor by floor. Engineer Vitaly Lagutenko’s K-7 series of the late 1950s is usually credited as the template for the five-storey Khrushchyovka, and standard series such as 1-464 carried the approach across the country. Speed and repetition were the point: more families could be housed, sooner.'},
 {title:'Housewarming',ru:'НОВОСЕЛЬЕ',copy:'The same room, in another building. The finishers, the paper, the furniture — and another family’s story begins.',place:'A NEW BLOCK · FLAT № 6',
  ctx:'A flat came after years on a waiting list, kept by the workplace or the district council; the family received an order (ордер) for it and the keys once the state commission had accepted the building — often before the courtyard was paved. Finishing was part of the kit: whitewashed ceilings, parquet or linoleum, paper on the walls. The furniture followed from the old room in a kommunalka or from the shop queue, and the housewarming, novoselye, was held in rooms that were still half empty.'}];
document.querySelector('.track-line').insertAdjacentHTML('beforeend',stops.slice(1).map(s=>`<i style="left:${(s*100).toFixed(1)}%"></i>`).join(''));

// ───────────────────────── labels anchored in world space ─────────────────────────
const labels=[];function label(text,sub,p,from,to,scale=1,out=false){const el=document.createElement('div');el.className='world-label';el.innerHTML='<b>'+text+'</b><small>'+sub+'</small>';$('#labels').append(el);const i0=route.findIndex(r=>r[0]===from),i1=route.findIndex(r=>r[0]===to);labels.push({el,p:new THREE.Vector3(...p),start:keyT[Math.max(0,i0-1)],end:keyT[Math.min(keyT.length-1,i1+1)]+.001,scale,out,occluded:false})}

// ───────────────────────── interaction ─────────────────────────
let target=0,progress=0,free=false,current=-1,last=0,returning=false,lookOffset={x:0,y:0},drag=null,savedOverflow='',audioContext=null,audioGain=null,soundOn=false,walking=false;
function scrollProgress(){return clamp(scrollY/(document.documentElement.scrollHeight-innerHeight),0,1)}
addEventListener('scroll',()=>{if(!free&&!walking)target=scrollProgress()},{passive:true});
function go(index){if(walking)setWalk(false);if(free)setFree(false);gsap.killTweensOf(window);const i=clamp(index,0,stops.length-1),y=stops[i]*(document.documentElement.scrollHeight-innerHeight);if(reduced){scrollTo(0,y);return}const v={y:scrollY},dist=Math.abs(stops[i]-progress);gsap.to(v,{y,duration:clamp(1+dist*6,1.2,4),ease:'power2.inOut',onUpdate:()=>scrollTo(0,v.y)})}
$('#home').onclick=()=>go(0);document.querySelectorAll('[data-stop]').forEach(b=>b.onclick=()=>go(+b.dataset.stop));$('#prev').onclick=()=>go(current-1);$('#next').onclick=()=>go(current+1);
const savedPos=new THREE.Vector3(),savedLook=new THREE.Vector3();
function setFree(on,silent=false){if(on&&walking)setWalk(false);free=on;document.body.classList.toggle('free',on);$('#explore').setAttribute('aria-pressed',on);$('#explore').textContent=on?'Back to the journey':'Fly around';controls.enabled=on;keys.clear();drag=null;
 if(on){savedPos.copy(camera.position);savedLook.copy(controls.target);savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';canvas.focus({preventScroll:true})}
 else{document.body.style.overflow=savedOverflow;if(silent)return;returning=true;lookOffset.x=lookOffset.y=0;const p={t:0},from=camera.position.clone(),to=controls.target.clone();gsap.to(p,{t:1,duration:reduced?0:1.2,ease:'power2.inOut',onUpdate:()=>{camera.position.lerpVectors(from,savedPos,p.t);controls.target.lerpVectors(to,savedLook,p.t);camera.lookAt(controls.target)},onComplete:()=>{returning=false}})}}
$('#explore').onclick=()=>setFree(!free);
// ── chapters: a pop-up index of the eight spaces
{const pop=$('#chapters-pop');pop.querySelector('ol').innerHTML=chapters.map((c,i)=>`<li><button data-go="${i}"><span class="cn">0${i+1}</span><span class="ct">${c.title.replace('<br>',' ')}</span><span class="cr">${c.ru}</span></button></li>`).join('');
 const openC=on=>{pop.hidden=!on;wakeUI();$('#chapters-btn').setAttribute('aria-expanded',on)};$('#chapters-btn').onclick=e=>{e.stopPropagation();openC(pop.hidden)};pop.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{openC(false);go(+b.dataset.go)});addEventListener('pointerdown',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!$('#chapters-btn').contains(e.target))openC(false)});addEventListener('keydown',e=>{if(e.key==='Escape')openC(false)})}
// ── seasons & atmosphere panel
const panel=$('#atmos-panel');
function openPanel(on){panel.hidden=!on;$('#season-btn').setAttribute('aria-expanded',on)}
$('#season-btn').onclick=e=>{e.stopPropagation();openPanel(panel.hidden)};addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&e.target!==$('#season-btn'))openPanel(false)});
function chooseSeason(name){applySeason(name);const S=SEASONS[name];document.querySelectorAll('[data-season]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.season===name));try{localStorage.setItem('doma-season',name)}catch{}}
document.querySelectorAll('[data-season]').forEach(b=>b.onclick=()=>chooseSeason(b.dataset.season));
$('#haze').oninput=e=>{const v=+e.target.value;setIndoorHaze(v);$('#haze-val').textContent=Math.round(v*100)+'%';try{localStorage.setItem('doma-haze',v)}catch{}};
// the memory dial: from now to a faded memory in which only the shape of the building is left
// the memory control: a painted strip in the margin, Now at the bottom and Only the shape at the top; drag the handle, click a mark, scroll over it, or use the arrow keys
{const el=$('#memory'),out=$('#memory-val'),thumb=el.querySelector('.mem-thumb'),fill=el.querySelector('.mem-fill'),line=el.querySelector('.mem-line'),marks=[...el.querySelectorAll('.mem-marks li')].reverse(),words=['Now','Recalled','Fading','Faded','Only the shape'],idx=v=>Math.min(4,Math.round(v*4)),say=v=>words[idx(v)];
 let val=0;const set=v=>{val=clamp(v,0,1);MEMORY.target=val;const p=`calc(8px + (100% - 16px) * ${val})`;thumb.style.bottom=p;fill.style.height=`calc((100% - 16px) * ${val})`;marks.forEach((m,i)=>m.classList.toggle('on',i===idx(val)));out.textContent=say(val);$('#memory-ui .mem-now').textContent=say(val);el.setAttribute('aria-valuenow',Math.round(val*100));el.setAttribute('aria-valuetext',say(val));try{localStorage.setItem('doma-memory',val)}catch{}};
 const at=e=>{const b=line.getBoundingClientRect();return 1-(e.clientY-b.top)/b.height};
 let dragging=false;el.addEventListener('pointerdown',e=>{dragging=true;el.setPointerCapture(e.pointerId);el.focus({preventScroll:true,focusVisible:false});set(at(e));wakeUI();e.preventDefault()});
 el.addEventListener('pointermove',e=>{if(dragging){set(at(e));wakeUI()}});const stop=()=>{dragging=false};el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);
 el.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();set(val-(e.deltaY||-e.deltaX)*.0012);wakeUI()},{passive:false});
 el.addEventListener('keydown',e=>{const k=e.key,step={ArrowUp:.05,ArrowRight:.05,ArrowDown:-.05,ArrowLeft:-.05,PageUp:.25,PageDown:-.25}[k];if(step!==undefined)set(val+step);else if(k==='Home')set(0);else if(k==='End')set(1);else return;e.preventDefault();e.stopPropagation();wakeUI()});
 el.addEventListener('dblclick',()=>set(0));
 // folded away by default: a small tab that says where you are; open it when you want it
 {const ui=$('#memory-ui'),tab=$('#memory-lab'),fold=on=>{ui.classList.toggle('folded',on);tab.setAttribute('aria-expanded',!on);try{localStorage.setItem('doma-memory-open',on?'0':'1')}catch{}};let open=false;try{open=localStorage.getItem('doma-memory-open')==='1'}catch{}fold(!open);tab.onclick=()=>fold(!ui.classList.contains('folded'))}
 let v0=0;try{v0=+(localStorage.getItem('doma-memory')||0)}catch{}MEMORY.v=v0;set(v0)}
const paintUI=[['paint','level',v=>Math.round(v*100)+'%'],['brush','brush',v=>v.toFixed(1)+'×'],['focus','focus',v=>Math.round(v*100)+'%'],['strokes','strokes',v=>Math.round(v*100)+'%']];
for(const[id,key,fmt]of paintUI){const el=$('#'+id);el.oninput=e=>{PAINT[key]=+e.target.value;$('#'+id+'-val').textContent=fmt(PAINT[key]);try{localStorage.setItem('doma-'+id,PAINT[key])}catch{}};try{const v=localStorage.getItem('doma-'+id);if(v!==null)PAINT[key]=+v}catch{}el.value=PAINT[key];$('#'+id+'-val').textContent=fmt(PAINT[key]);if(!paint)el.disabled=true}
$('#outdoor-splats').onchange=e=>{atmosOn=e.target.checked;atmosphere.forEach(o=>o.visible=atmosOn)};
{let sN='summer',hV=1;try{sN=localStorage.getItem('doma-season')||sN;hV=+(localStorage.getItem('doma-haze')??1);}catch{}if(!SEASONS[sN])sN='summer';chooseSeason(sN);$('#haze').value=hV;setIndoorHaze(hV);$('#haze-val').textContent=Math.round(hV*100)+'%'}

function lockPointer(){try{const r=canvas.requestPointerLock?.();r?.catch?.(()=>{})}catch{}}
// ── WALK: first person on foot — mouse to look, W A S D to move, Shift to run; collides with walls, climbs stairs
const EYE=1.6,RAD=.24,STEP=.42,player={feet:new THREE.Vector3(),vy:0,yaw:0,pitch:0,ground:true,bob:0};
const walkRay=new THREE.Raycaster();walkRay.firstHitOnly=true;let bvhReady=false;const _o=new THREE.Vector3(),_dir=new THREE.Vector3(),DOWN=new THREE.Vector3(0,-1,0);
function prepareBVH(){if(bvhReady)return;for(const o of COLLIDERS)if(!o.geometry.boundsTree)o.geometry.computeBoundsTree();bvhReady=true}
function cast(origin,d,far){walkRay.set(origin,d);walkRay.near=0;walkRay.far=far;const h=walkRay.intersectObjects(COLLIDERS,false);return h.length?h[0]:null}
function groundBelow(p,up=STEP,far=4){_o.set(p.x,p.y+up,p.z);const h=cast(_o,DOWN,up+far);return h?h.point.y:null}
function pushOut(){const f=player.feet;for(const hgt of[.46,1.0,1.5])for(let k=0;k<12;k++){const a=k/12*Math.PI*2;_dir.set(Math.cos(a),0,Math.sin(a));_o.set(f.x,f.y+hgt,f.z);const h=cast(_o,_dir,RAD);if(h)f.addScaledVector(_dir,-(RAD-h.distance)-.002)}}
function setWalk(on){if(on===walking)return;if(on&&free)setFree(false,true);walking=on;document.body.classList.toggle('walking',on);$('#walk').setAttribute('aria-pressed',on);$('#walk').textContent=on?'Back to the journey':'Walk around';$('#walk-in').textContent=on?'Back to the journey':'Walk around the flat';keys.clear();controls.enabled=false;
 if(on){$('#walk-hint').textContent='Preparing the floor…';prepareBVH();savedPos.copy(camera.position);savedLook.copy(controls.target);savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const z=zoneOf(camera.position);camera.getWorldDirection(_dir);if(z==='out'){player.feet.set(.45,0,12.8);player.yaw=0;player.pitch=0}else{player.feet.copy(camera.position);player.feet.y-=EYE;player.yaw=Math.atan2(-_dir.x,-_dir.z);player.pitch=0}
  const g=groundBelow(player.feet,1.2,6);if(g!==null)player.feet.y=g;player.vy=0;camera.fov=mobile?78:72;camera.updateProjectionMatrix();$('#walk-hint').innerHTML=mobile?'Drag to look · arrows to walk':'Click to look around · W A S D walk · Shift run · Esc frees the mouse · G to leave';if(!mobile)lockPointer()}
 else{if(document.pointerLockElement)document.exitPointerLock();document.body.style.overflow=savedOverflow;returning=true;{const u=curveU(progress);posCurve.getPoint(u,savedPos);dirCurve.getPoint(u,_dir).normalize();savedLook.copy(savedPos).addScaledVector(_dir,3)}lookOffset.x=lookOffset.y=0;const p={t:0},from=camera.position.clone(),q0=camera.quaternion.clone(),tmp=new THREE.Object3D();tmp.position.copy(savedPos);tmp.lookAt(savedLook);const q1=tmp.quaternion.clone();controls.target.copy(savedLook);
  gsap.to(p,{t:1,duration:reduced?0:1.3,ease:'power2.inOut',onUpdate:()=>{camera.position.lerpVectors(from,savedPos,p.t);camera.quaternion.slerpQuaternions(q0,q1,p.t)},onComplete:()=>{returning=false;target=scrollProgress()}})}}
$('#walk').onclick=()=>setWalk(!walking);$('#walk-in').onclick=()=>setWalk(!walking);$('#resume').onclick=()=>{if(walking)setWalk(false);else if(free)setFree(false)};
canvas.addEventListener('click',()=>{if(walking&&!mobile&&!document.pointerLockElement)lockPointer()});
addEventListener('mousemove',e=>{if(walking&&document.pointerLockElement===canvas){player.yaw-=e.movementX*.0022;player.pitch=clamp(player.pitch-e.movementY*.0022,-1.45,1.45)}});
let walkDrag=null;canvas.addEventListener('pointerdown',e=>{if(walking&&!document.pointerLockElement){walkDrag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)}});canvas.addEventListener('pointermove',e=>{if(walking&&walkDrag){player.yaw-=(e.clientX-walkDrag.x)*.005;player.pitch=clamp(player.pitch-(e.clientY-walkDrag.y)*.005,-1.45,1.45);walkDrag={x:e.clientX,y:e.clientY}}});canvas.addEventListener('pointerup',()=>walkDrag=null);
function walkUpdate(dt){const run=keys.has('shift'),sp=run?3.4:1.55,fw=_a.set(-Math.sin(player.yaw),0,-Math.cos(player.yaw)),rt=_b.set(Math.cos(player.yaw),0,-Math.sin(player.yaw)),mv=new THREE.Vector3();
 if(keys.has('w')||keys.has('arrowup'))mv.add(fw);if(keys.has('s')||keys.has('arrowdown'))mv.sub(fw);if(keys.has('d')||keys.has('arrowright'))mv.add(rt);if(keys.has('a')||keys.has('arrowleft'))mv.sub(rt);const moving=mv.lengthSq()>0;
 if(moving){mv.normalize().multiplyScalar(sp*dt);const n=Math.max(1,Math.ceil(mv.length()/.06));mv.divideScalar(n);for(let i=0;i<n;i++){player.feet.add(mv);pushOut()}}else pushOut();
 const g=groundBelow(player.feet);if(g!==null&&player.vy<=0&&player.feet.y-g<(player.ground?.45:.05)){player.feet.y=g>player.feet.y?lerp(player.feet.y,g,1-Math.exp(-dt*22)):g;player.vy=0;player.ground=true}
 else{player.vy-=9.8*dt;player.feet.y+=player.vy*dt;player.ground=false;if(g!==null&&player.feet.y<g){player.feet.y=g;player.vy=0;player.ground=true}}
 if(player.feet.y<-3){player.feet.set(.45,0,12.8);player.vy=0}
 player.bob+=moving?dt*(run?11:7.5):0;const bob=moving?Math.sin(player.bob)*(run?.035:.022):0;camera.position.set(player.feet.x,player.feet.y+EYE+bob,player.feet.z);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');controls.target.copy(camera.position).add(camera.getWorldDirection(_dir))}
canvas.addEventListener('pointerdown',e=>{if(!free&&e.pointerType!=='touch'){drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)}});canvas.addEventListener('pointermove',e=>{if(drag&&!free){lookOffset.x=clamp((e.clientX-drag.x)/innerWidth,-.3,.3);lookOffset.y=clamp((e.clientY-drag.y)/innerHeight,-.22,.22)}});function endDrag(){drag=null;gsap.to(lookOffset,{x:0,y:0,duration:reduced?0:1.4,ease:'power2.out'})}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
const keys=new Set();addEventListener('keydown',e=>{if($('#notes').open||e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();if(k==='escape'&&free){setFree(false);return}if(k==='escape'&&walking&&!document.pointerLockElement){setWalk(false);return}if(k==='f'){setFree(!free);return}if(k==='g'){setWalk(!walking);return}if(k==='m')toggleSound();if((free||walking)&&['w','a','s','d','q','e','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){e.preventDefault();keys.add(k)}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();keys.add(b.dataset.key);b.setPointerCapture(e.pointerId)};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key)});
const notes=$('#notes');
$('#archive').onclick=()=>{if(document.pointerLockElement)document.exitPointerLock();notes.showModal();controls.enabled=false;keys.clear();JOURNAL.open()};
notes.querySelectorAll('.close').forEach(b=>b.onclick=()=>notes.close());
{const pb=notes.querySelector('.n-print'),setP=on=>{notes.classList.toggle('printed',on);pb.setAttribute('aria-pressed',on);pb.textContent=on?'Handwritten':'Printed text';try{localStorage.setItem('doma-print',on?'1':'0')}catch{}if(notes.open)JOURNAL.repaginate()};let p0=false;try{p0=localStorage.getItem('doma-print')==='1'}catch{}setP(p0);pb.onclick=()=>setP(!notes.classList.contains('printed'))}
notes.addEventListener('close',()=>{controls.enabled=free&&!walking;JOURNAL.close()});
$('#sound').onclick=toggleSound;

// ───────────────────────── per-frame ─────────────────────────
const raycaster=new THREE.Raycaster(),projected=new THREE.Vector3(),dir=new THREE.Vector3();let labelTick=0;
function updateLabels(){camera.updateMatrixWorld();for(const a of labels){let fade=Math.min(clamp((progress-a.start)*60,0,1),clamp((a.end-progress)*60,0,1));const dist=camera.position.distanceTo(a.p);if(free||walking)fade=(a.out?(zone==='out'||zone==='balcony')&&dist<70:zone!=='out'&&dist<6.5)?.85:0;projected.copy(a.p).project(camera);if(projected.z>1||Math.abs(projected.x)>1.15||Math.abs(projected.y)>1.15)fade=0;
 const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight,scale=clamp((dist>15?35:4.5)/dist,.62,1.12)*a.scale;if(x>innerWidth-(mobile?190:250))fade*=.2;if(y<90||y>innerHeight-100)fade=0;
 if(fade>.05&&labelTick%10===0){dir.copy(a.p).sub(camera.position).normalize();raycaster.set(camera.position,dir);raycaster.far=Math.max(0,dist-.35);const hits=raycaster.intersectObjects(SOLIDS.filter(o=>o.visible&&o.parent.visible),false);a.occluded=hits.length>0}
 if(a.occluded)fade*=.06;a.el.style.opacity=fade.toFixed(3);a.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${scale.toFixed(3)})`}labelTick++}
const aptGroups=[shell,hall,kitchen,living,bedroom,bath,balcony];
const _shaftC=new THREE.Vector3(5,5,3);let zone='out',shadowZone='',exposure=1,envI=.6,hemiI=.5;const workPos=new THREE.Vector3(),workLook=new THREE.Vector3(),forward=new THREE.Vector3(),right=new THREE.Vector3();
let dream=0,frames=0,slowFrames=0,frameAcc=0,frameCount=0;
function zoneOf(p){{const xl=SCX-p.x,zl=SCZ-p.z;if(Math.abs(xl)<12&&Math.abs(zl)<5.8&&p.y>AY&&p.y<AY+CH)return'newflat'}if(Math.abs(p.x)<12&&Math.abs(p.z)<6&&p.y<ROOF){if(Math.abs(p.x)<1.6)return'stair';if(p.x>1.6&&p.y>Y&&p.y<Y+CH)return'flat';return'stair'}if(p.x>8.9&&p.x<11.9&&p.z>5.9&&p.z<7.3&&p.y>Y&&p.y<Y+2.6)return'balcony';return'out'}
function render(ms){requestAnimationFrame(render);if(document.hidden){last=ms;return}if(notes.open){last=ms;JOURNAL.frame(ms);return}tick(ms)}
function tick(ms){const dt=Math.min(Math.max((ms-last)/1000,0)||.016,.05);last=ms;
 if(walking&&!returning)walkUpdate(dt);
 else if(!free&&!returning){progress=reduced?target:lerp(progress,target,1-Math.exp(-dt*5.5));const u=curveU(progress);posCurve.getPoint(u,workPos);dirCurve.getPoint(u,workLook).normalize();
  // a neck, not a gimbal: never tip past ~70° up or down, so the head can't flip over when the path turns
  {const h=Math.hypot(workLook.x,workLook.z);if(h<.34&&h>1e-5){const k=.34/h;workLook.x*=k;workLook.z*=k;workLook.y=Math.sign(workLook.y)*.94}}
  const inT=smooth(progress,tOf('door')-.03,tOf('door')+.01);camera.fov=lerp(mobile?60:44,mobile?80:68,inT);camera.updateProjectionMatrix();camera.position.copy(workPos);
  right.crossVectors(workLook,_up).normalize();workLook.addScaledVector(right,lookOffset.x*1.6).addScaledVector(_up,lookOffset.y*1.4).normalize();controls.target.copy(workPos).addScaledVector(workLook,3);camera.lookAt(controls.target)}
 else if(free){const z=zoneOf(camera.position),speed=(z==='out'?14:1.7)*dt;camera.getWorldDirection(forward);right.crossVectors(forward,camera.up).normalize();const delta=new THREE.Vector3();if(keys.has('w')||keys.has('arrowup'))delta.addScaledVector(forward,speed);if(keys.has('s')||keys.has('arrowdown'))delta.addScaledVector(forward,-speed);if(keys.has('a')||keys.has('arrowleft'))delta.addScaledVector(right,-speed);if(keys.has('d')||keys.has('arrowright'))delta.addScaledVector(right,speed);if(keys.has('q'))delta.y-=speed;if(keys.has('e'))delta.y+=speed;camera.position.add(delta);controls.target.add(delta);controls.update()}
 // eye adaptation between the bright courtyard, the dim stairwell and the lamp-lit flat
 zone=zoneOf(camera.position);const inside=zone==='stair'||zone==='flat';const k=1-Math.exp(-dt*2.2);
 const inKitchen=zone==='flat'&&camera.position.x<4.2&&camera.position.z>3.0;dream=lerp(dream,inKitchen?1:0,1-Math.exp(-dt*1.4));const K=seasonK,ia=K.inAmb,ie=K.inExp,tgt=zone==='out'?[K.exp,envBase,hemiBase]:zone==='balcony'?[K.exp*1.05,envBase*.8,hemiBase*.8]:zone==='stair'?[1.45*ie,.2*ia,.16*ia]:zone==='newflat'?[1.12*ie,.34*ia,.26*ia]:inKitchen?[1.12*ie/Math.sqrt(K.inI),.27*ia,.19*ia]:[1.18*ie,.24*ia,.16*ia];exposure=lerp(exposure,tgt[0],k);envI=lerp(envI,tgt[1],k);hemiI=lerp(hemiI,tgt[2],k);renderer.toneMappingExposure=exposure;
 // the kitchen is remembered rather than seen: light blooms and haloes, blacks go milky, colour softens — like a dream of it
 if(bloom){const dk=dream/Math.pow(K.inI,1.5);bloom.strength=K.bloom+dk*.38;bloom.threshold=.95-dk*.2;bloom.radius=.7+dream*.25}if(grade){const u=grade.uniforms;u.uLift.value.set(K.lift[0]+dream*.04,K.lift[1]+dream*.036,K.lift[2]+dream*.028);u.uSat.value=K.sat*(1-.14*dream)}scene.environmentIntensity=envI;hemi.intensity=hemiI;
 scene.fog.density=inside||zone==='newflat'?.0045:fogBase;const nr=walking?.05:zone==='out'?(camera.position.y>5?.4:.15):.04;if(camera.near!==nr){camera.near=nr;camera.updateProjectionMatrix()}
 const sz=inside||zone==='balcony'?'in':'out';if(sz!==shadowZone){shadowZone=sz;if(sz==='in')frameShadow(5,4.6,1.6,12);else frameShadow(0,14,0,44)}
 const near=camera.position.distanceTo(new THREE.Vector3(6,5,2))<70;for(const g of aptGroups)g.visible=near;stair.visible=camera.position.distanceTo(new THREE.Vector3(0,8,2))<90;
 for(const o of splatSets){const n=o.name;if(n==='haze'||n==='far-city'||n==='far-trees')o.visible=atmosOn&&!inside&&zone!=='newflat'&&o.geometry.userData.count>0;else if(n==='shafts'||n==='dust'||n==='roomhaze')o.visible=!o.userData.off&&(inside||zone==='balcony'||camera.position.distanceTo(_shaftC)<25)}
 {const u=precip.material.uniforms;u.uCam.value.copy(camera.position);u.uTime.value=ms/1000;u.uFogDensity.value=scene.fog.density;precip.visible=atmosOn&&u.uMode.value>0}
 const pr=renderer.getPixelRatio(),scale=innerHeight*pr/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2));precip.material.uniforms.uScale.value=scale;for(const o of splatSets){const u=o.material.uniforms;u.uTime.value=ms/1000;u.uScale.value=scale;u.uFogDensity.value=scene.fog.density}
 if(current===-1||frames%3===0){const idx=stops.reduce((best,s,i)=>progress>=(i===0?0:(stops[i-1]+s)/2)?i:best,0);if(idx!==current){current=idx;const ch=chapters[idx];$('#stage-no').textContent=`0${idx+1} / ${ch.ru}`;$('#stage-title').innerHTML=ch.title;$('#stage-copy').textContent=ch.copy;$('#stage-context').textContent=ch.ctx;$('#place').textContent=ch.place;$('#progress-text').innerHTML=`<b>${String(idx+1).padStart(2,'0')}</b> ${ch.title.replace('<br>',' ')} <span>${ch.ru}</span>`;document.querySelectorAll('[data-stop]').forEach((b,i)=>{b.classList.toggle('active',i===idx);if(i===idx)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});$('#prev').disabled=idx===0;$('#next').disabled=idx===stops.length-1}}
 $('#hero').style.opacity=clamp(1-progress*14,0,1);$('#hero').style.transform=`translateY(${-progress*260}px)`;$('#stage-caption').classList.toggle('hidden',progress<.045||free||walking);$('#progress-bar').style.width=(progress*100).toFixed(2)+'%';
 MEMORY.v=lerp(MEMORY.v,MEMORY.target,1-Math.exp(-dt*2.5));if(grade)grade.uniforms.uFade.value=MEMORY.v;
 updateLabels();updateFocus(dt);siteUpdate(free||walking?1:siteProgress(progress));homeUpdate(free||walking?1:homeProgress(progress));livedUpdate(dt);soundUpdate(dt);
 if(composer)composer.render(dt);else renderer.render(scene,camera);typeUpdate();frames++;
 // adaptive resolution keeps the walk smooth on smaller GPUs
 if(frames>30){frameAcc+=dt;frameCount++;if(frameCount===75){const avg=frameAcc/frameCount;frameAcc=0;frameCount=0;if(avg>.026){if(pixelRatio>1){pixelRatio=Math.max(1,pixelRatio-.25);resize()}else if(gtao&&gtao.enabled){gtao.enabled=false}else if(pixelRatio>.75){pixelRatio-=.125;resize()}}}}
 if(!window.domaReady){window.domaReady=true;clearTimeout(window.domaTimeout);document.body.classList.add('loaded')}
 window.domaState={progress,current,zone,free,walking,season,feet:player.feet.toArray().map(v=>+v.toFixed(2)),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,frames,pixelRatio,gtao:!!(gtao&&gtao.enabled),camera:camera.position.toArray().map(v=>+v.toFixed(2)),fps:Math.round(1/dt)}}
function resize(){mobile=innerWidth<700;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(pixelRatio);renderer.setSize(innerWidth,innerHeight);if(composer){composer.setPixelRatio(pixelRatio);composer.setSize(innerWidth,innerHeight)}if(bloom)bloom.resolution.set(innerWidth,innerHeight);target=scrollProgress()}
addEventListener('resize',resize);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();window.domaFail('The graphics context was interrupted. Reload to return to the journal.')});
prepareBVH();renderer.shadowMap.needsUpdate=true;target=scrollProgress();progress=target;requestAnimationFrame(render);
window.domaDebug={THREE,scene,camera,PAINT,setWalk,player,keys,chooseSeason,setIndoorHaze,route,keyT,stops,go,renderer,composer,gtao,bloom,setPR:v=>{pixelRatio=v;resize()},bench:(n=20)=>{tick(performance.now());gl.finish();const t=performance.now();for(let i=0;i<n;i++){tick(performance.now());gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4))}return +((performance.now()-t)/n).toFixed(2)},frame:(n=1)=>{for(let i=0;i<n;i++)tick(performance.now());return window.domaState},setProgress:v=>{scrollTo(0,v*(document.documentElement.scrollHeight-innerHeight));target=progress=v;tick(performance.now());tick(performance.now()+16);return window.domaState},free:(p,l)=>{if(!free)setFree(true);camera.position.set(...p);controls.target.set(...l);controls.update();tick(performance.now());return window.domaState}};
