
// ───────────────────────── ON A PHONE — scroll with your thumb, look with your hands, fly with gestures ─────────────────────────
// • Scroll mode: a finger anywhere on the scene scrolls the journey (the canvas lets vertical pans through).
// • Tilt to look: with the gyroscope on, turning the phone turns your head — around the rail while scrolling, freely
//   while flying. iOS asks permission the first time.
// • Free camera on touch: drag to look, pinch to move forward and back, two fingers to slide, double-tap to go there.
const MOBILE=(()=>{
 const coarse=matchMedia('(pointer: coarse)').matches;
 // ── scrolling vs. gesturing on the canvas
 function touchMode(){canvas.style.touchAction=free||walking?'none':'pan-y'}
 touchMode();

 // ── gyroscope
 const G={on:false,has:false,q:new THREE.Quaternion(),base:null,prev:null,off:{x:0,y:0}};
 const _e=new THREE.Euler(),_q0=new THREE.Quaternion(),_q1=new THREE.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5)),_z=new THREE.Vector3(0,0,1),_d=new THREE.Quaternion(),_de=new THREE.Euler();
 function onOri(e){if(e.alpha==null&&e.beta==null)return;const a=THREE.MathUtils.degToRad(e.alpha||0),b=THREE.MathUtils.degToRad(e.beta||0),g=THREE.MathUtils.degToRad(e.gamma||0),o=THREE.MathUtils.degToRad((screen.orientation&&screen.orientation.angle)||window.orientation||0);
  _e.set(b,a,-g,'YXZ');G.q.setFromEuler(_e).multiply(_q1).multiply(_q0.setFromAxisAngle(_z,-o));G.has=true;if(!G.base){G.base=G.q.clone();G.prev=G.q.clone()}}
 const btns=[...document.querySelectorAll('.gyro-btn')];
 function label(){for(const b of btns){b.setAttribute('aria-pressed',G.on);b.textContent=G.on?'Tilt to look: on':'Tilt to look'}}
 async function setGyro(on){if(on){try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')return}}catch{return}
   G.base=G.prev=null;addEventListener('deviceorientation',onOri);G.on=true}else{removeEventListener('deviceorientation',onOri);G.on=false;G.off.x=G.off.y=0}label()}
 for(const b of btns)b.onclick=()=>setGyro(!G.on);
 if(!('DeviceOrientationEvent' in window)||!coarse)for(const b of btns)b.hidden=true;
 label();

 // ── free camera by touch: first-person gestures
 const pts=new Map();let g0=null,lastTap=0,glide=null;const _dir=new THREE.Vector3(),_rt=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0),_rq=new THREE.Quaternion(),_ray=new THREE.Raycaster(),_ndc=new THREE.Vector2();
 const speed=()=>zoneOf(camera.position)==='out'?1:.25;
 function look(dx,dy){_dir.subVectors(controls.target,camera.position).normalize();_rq.setFromAxisAngle(_up,dx);_dir.applyQuaternion(_rq);_rt.crossVectors(_dir,_up).normalize();const pitch=Math.asin(clamp(_dir.y,-1,1));const np=clamp(pitch+dy,-1.35,1.35);_rq.setFromAxisAngle(_rt,np-pitch);_dir.applyQuaternion(_rq).normalize();controls.target.copy(camera.position).addScaledVector(_dir,3)}
 function move(v){camera.position.add(v);controls.target.add(v)}
 const centroid=()=>{let x=0,y=0;for(const p of pts.values()){x+=p.x;y+=p.y}return{x:x/pts.size,y:y/pts.size}};
 const spread=()=>{const a=[...pts.values()];return a.length<2?0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
 canvas.addEventListener('pointerdown',e=>{if(!free||e.pointerType!=='touch')return;controls.enabled=false;glide&&glide.kill();glide=null;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});try{canvas.setPointerCapture(e.pointerId)}catch{}g0={c:centroid(),s:spread(),n:pts.size};
  if(pts.size===1){const now=performance.now();if(now-lastTap<300)goThere(e);lastTap=now}},true);
 canvas.addEventListener('pointermove',e=>{if(!free||!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const c=centroid();
  if(pts.size===1&&g0.n===1){look((c.x-g0.c.x)*.0055,(c.y-g0.c.y)*.0055)}
  else if(pts.size>=2){const s=spread(),k=speed();_dir.subVectors(controls.target,camera.position).normalize();move(_dir.multiplyScalar((s-g0.s)*.03*k));_rt.crossVectors(_dir.set(0,0,0).subVectors(controls.target,camera.position).normalize(),_up).normalize();move(_rt.multiplyScalar(-(c.x-g0.c.x)*.02*k).addScaledVector(_up,(c.y-g0.c.y)*.02*k));g0.s=s}
  g0.c=c;g0.n=pts.size},true);
 const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);g0=pts.size?{c:centroid(),s:spread(),n:pts.size}:null};
 canvas.addEventListener('pointerup',up,true);canvas.addEventListener('pointercancel',up,true);
 // double-tap: glide towards what you tapped, stopping short of it
 function goThere(e){_ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);_ray.setFromCamera(_ndc,camera);const h=_ray.intersectObjects(SOLIDS.filter(o=>o.visible&&o.parent.visible),false)[0];
  _dir.copy(_ray.ray.direction);const dist=h?Math.max(0,h.distance-(zoneOf(camera.position)==='out'?3:.8)):6*speed();if(dist<.05)return;const from=camera.position.clone(),to=from.clone().addScaledVector(_dir,dist),lookTo=to.clone().addScaledVector(_dir,3);const p={t:0},lf=controls.target.clone();
  glide=gsap.to(p,{t:1,duration:reduced?0:1.1,ease:'power2.inOut',onUpdate:()=>{camera.position.lerpVectors(from,to,p.t);controls.target.lerpVectors(lf,lookTo,p.t)},onComplete:()=>{glide=null}})}

 // ── per frame: the gyroscope turns the head
 function update(dt){touchMode();if(!G.on||!G.has||!G.base)return;
  if(free){_d.copy(G.prev).invert().multiply(G.q);_de.setFromQuaternion(_d,'YXZ');if(Math.abs(_de.y)<.5&&Math.abs(_de.x)<.5)look(_de.y,_de.x);G.prev.copy(G.q);G.off.x=G.off.y=0}
  else{_d.copy(G.base).invert().multiply(G.q);_de.setFromQuaternion(_d,'YXZ');G.off.x=lerp(G.off.x,clamp(-Math.tan(clamp(_de.y,-1.2,1.2))/1.6,-.9,.9),1-Math.exp(-dt*10));G.off.y=lerp(G.off.y,clamp(Math.tan(clamp(_de.x,-1.1,1.1))/1.4,-.75,.75),1-Math.exp(-dt*10));
   G.base.slerp(G.q,1-Math.exp(-dt*.08));G.prev.copy(G.q)}}
 // the free-camera hint speaks the right language for the device
 if(coarse){const h=document.getElementById('free-hint');if(h)h.textContent='Drag to look · Pinch to move · Two fingers to slide · Double-tap to go there · tap Back to the journey'}
 return{update,gyro:G,touchMode,coarse}})();
