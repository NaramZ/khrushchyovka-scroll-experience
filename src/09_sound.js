
// ───────────────────────── SOUND — a radio in the kitchen, the echo of the stair, weather outside ─────────────────────────
// Everything is synthesised: an AM kitchen radio playing "Korobeiniki" (a 19th-century folk tune, public domain) on a
// bayan-like voice with oom-pah bass, hiss, crackle and the hourly time pips; positioned in 3D, so it grows as you
// approach the kitchen and is muffled by walls. Footsteps ring in the stairwell, the lift shaft hums, rain and wind
// sit outside and fall away behind the windows.
/*RADIO*/
const SND={ctx:null,on:false,userOff:false};try{SND.userOff=localStorage.getItem('doma-sound')==='off'}catch{}
function noiseBuf(ctx,sec,kind='white'){const b=ctx.createBuffer(1,ctx.sampleRate*sec,ctx.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(kind==='brown'){v=(v+w*.02)*.985;d[i]=v*3.5}else d[i]=w}return b}
function impulse(ctx,sec,decay){const len=ctx.sampleRate*sec,b=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay)*(i<ctx.sampleRate*.012?.2:1)}return b}
function initAudio(){if(SND.ctx)return;const ctx=SND.ctx=new(window.AudioContext||window.webkitAudioContext)();const master=SND.master=ctx.createGain();master.gain.value=0;const memF=SND.memF=ctx.createBiquadFilter();memF.type='lowpass';memF.frequency.value=20000;master.connect(memF);memF.connect(ctx.destination);
 // rooms: a long, bright stair reverb and a small, soft flat
 const stairVerb=ctx.createConvolver();stairVerb.buffer=impulse(ctx,2.6,2.2);const stairWet=ctx.createGain();stairWet.gain.value=.55;stairVerb.connect(stairWet);stairWet.connect(master);SND.stairVerb=stairVerb;
 const roomVerb=ctx.createConvolver();roomVerb.buffer=impulse(ctx,.45,3);const roomWet=ctx.createGain();roomWet.gain.value=.25;roomVerb.connect(roomWet);roomWet.connect(master);SND.roomVerb=roomVerb;
 // outside: rain / wind bed and distant traffic, muffled indoors
 const rain=ctx.createBufferSource();rain.buffer=noiseBuf(ctx,4);rain.loop=true;const rainF=ctx.createBiquadFilter();rainF.type='bandpass';rainF.frequency.value=2600;rainF.Q.value=.4;const rainG=ctx.createGain();rainG.gain.value=0;rain.connect(rainF);rainF.connect(rainG);
 const wind=ctx.createBufferSource();wind.buffer=noiseBuf(ctx,6,'brown');wind.loop=true;const windF=ctx.createBiquadFilter();windF.type='lowpass';windF.frequency.value=420;const windG=ctx.createGain();windG.gain.value=0;wind.connect(windF);windF.connect(windG);
 const outF=ctx.createBiquadFilter();outF.type='lowpass';outF.frequency.value=9000;rainG.connect(outF);windG.connect(outF);outF.connect(master);rain.start();wind.start();Object.assign(SND,{rainG,windG,outF,rainF});
 // the lift shaft hum, only in the stairwell
 const hum=ctx.createOscillator();hum.frequency.value=49;const hum2=ctx.createOscillator();hum2.frequency.value=98.6;const humG=ctx.createGain();humG.gain.value=0;const h2g=ctx.createGain();h2g.gain.value=.35;hum.connect(humG);hum2.connect(h2g);h2g.connect(humG);humG.connect(master);humG.connect(stairVerb);hum.start();hum2.start();SND.humG=humG;
 // the radio: music bus → AM band → soft clip → occlusion → 3D panner
 const music=ctx.createGain();music.gain.value=.5;const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=320;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;lp.Q.value=1.2;
 const clip=ctx.createWaveShaper();{const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*2.2)}clip.curve=c}
 const hiss=ctx.createBufferSource();hiss.buffer=noiseBuf(ctx,3);hiss.loop=true;const hissF=ctx.createBiquadFilter();hissF.type='bandpass';hissF.frequency.value=3000;hissF.Q.value=.7;const hissG=ctx.createGain();hissG.gain.value=.018;hiss.connect(hissF);hissF.connect(hissG);hiss.start();
 const radioG=ctx.createGain();radioG.gain.value=.9;const occ=ctx.createBiquadFilter();occ.type='lowpass';occ.frequency.value=8000;
 const pan=ctx.createPanner();Object.assign(pan,{panningModel:'HRTF',distanceModel:'inverse',refDistance:.9,rolloffFactor:1.7,maxDistance:40});const rp=[4.12,Y+1.78,3.5];if(pan.positionX){pan.positionX.value=rp[0];pan.positionY.value=rp[1];pan.positionZ.value=rp[2]}else pan.setPosition(...rp);
 music.connect(hp);hp.connect(lp);lp.connect(clip);clip.connect(radioG);hissG.connect(radioG);radioG.connect(occ);occ.connect(pan);pan.connect(master);pan.connect(roomVerb);Object.assign(SND,{music,occ,radioG,pan,hp,lp});
 SND.wow=ctx.createOscillator();SND.wow.frequency.value=.35;SND.wowG=ctx.createGain();SND.wowG.gain.value=6;SND.wow.connect(SND.wowG);SND.wow.start();
 startStations()}
// ── the stations: real period recordings (embedded at build time), each followed by a turn of the dial through static
function b64ToBuf(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer}
async function startStations(){const src=(typeof RADIO_DATA!=='undefined'&&RADIO_DATA)||[];let bufs=[];try{bufs=await Promise.all(src.map(d=>SND.ctx.decodeAudioData(b64ToBuf(d.b64))))}catch{bufs=[]}
 SND.stations=bufs.length;if(!bufs.length){startRadio();return}
 // real broadcasts are already band-limited: open the AM band a little
 SND.music.gain.value=.9;SND.hp.frequency.value=170;SND.lp.frequency.value=5200;
 const c=SND.ctx;let i=Math.floor(Math.random()*bufs.length),t=c.currentTime+.5;
 const tune=(t0,d)=>{const b=c.createBufferSource();b.buffer=noiseBuf(c,d);const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=6;f.frequency.setValueAtTime(600,t0);f.frequency.exponentialRampToValueAtTime(3800,t0+d*.6);f.frequency.exponentialRampToValueAtTime(900,t0+d);const g=c.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.12,t0+.1);g.gain.linearRampToValueAtTime(0,t0+d);b.connect(f);f.connect(g);g.connect(SND.music);b.start(t0);crackles(t0,t0+d)};
 const next=()=>{if(!SND.ctx)return;const b=c.createBufferSource();b.buffer=bufs[i%bufs.length];const g=c.createGain();g.gain.value=1;b.connect(g);g.connect(SND.music);b.start(t);crackles(t,t+b.buffer.duration);const end=t+b.buffer.duration;const d=rand(1.6,3);tune(end-.2,d);t=end+d-.3;i++;SND.timer=setTimeout(next,Math.max(0,(t-c.currentTime-1.5)*1000))};next()}
// ── fallback if the recordings can't be decoded: "Korobeiniki" on a bayan voice, with bass and chords; tempo quickens each time round, as dancers like it
const KOR_A=[[76,1],[71,.5],[72,.5],[74,1],[72,.5],[71,.5],[69,1],[69,.5],[72,.5],[76,1],[74,.5],[72,.5],[71,1.5],[72,.5],[74,1],[76,1],[72,1],[69,1],[69,2]];
const KOR_B=[[74,1.5],[77,.5],[81,1],[79,.5],[77,.5],[76,1.5],[72,.5],[76,1],[74,.5],[72,.5],[71,1],[71,.5],[72,.5],[74,1],[76,1],[72,1],[69,1],[69,2]];
const RCH={Am:[45,[57,60,64]],E:[40,[56,59,64]],Dm:[38,[57,62,65]]},HAR_A=['Am','Am','E','Am'],HAR_B=['Dm','Am','E','Am'];
const mtof=m=>440*Math.pow(2,(m-69)/12);
function voice(t,m,dur,gain=.16){const c=SND.ctx,o1=c.createOscillator(),o2=c.createOscillator(),o3=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;
 o1.type='sawtooth';o2.type='sawtooth';o3.type='square';o1.frequency.value=mtof(m);o2.frequency.value=mtof(m);o2.detune.value=9;o3.frequency.value=mtof(m-12);SND.wowG.connect(o1.detune);SND.wowG.connect(o2.detune);
 const g3=c.createGain();g3.gain.value=.3;o1.connect(f);o2.connect(f);o3.connect(g3);g3.connect(f);f.connect(g);g.connect(SND.music);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.025);g.gain.setValueAtTime(gain*.85,t+dur*.8);g.gain.linearRampToValueAtTime(0,t+dur*.98);for(const o of[o1,o2,o3]){o.start(t);o.stop(t+dur)}}
function pluck(t,m,dur,gain){const c=SND.ctx,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=mtof(m);o.connect(g);g.connect(SND.music);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.start(t);o.stop(t+dur)}
function pips(t){for(let i=0;i<6;i++){const c=SND.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.value=1000;o.connect(g);g.connect(SND.music);const d=i===5?.5:.1;g.gain.setValueAtTime(0,t+i);g.gain.linearRampToValueAtTime(.12,t+i+.005);g.gain.setValueAtTime(.12,t+i+d);g.gain.linearRampToValueAtTime(0,t+i+d+.01);o.start(t+i);o.stop(t+i+d+.05)}}
function crackles(t0,t1){const c=SND.ctx;for(let t=t0;t<t1;t+=Math.random()*.35){const b=c.createBufferSource();b.buffer=SND.click||(SND.click=noiseBuf(c,.01));const g=c.createGain();g.gain.value=Math.random()*.08;b.connect(g);g.connect(SND.music);b.start(t)}}
function startRadio(){const c=SND.ctx;let t=c.currentTime+.6,round=0;
 const schedule=()=>{if(!SND.ctx)return;while(t<c.currentTime+2.2){
   if(round%5===4){pips(t);crackles(t,t+7);t+=7;round++;continue}
   const beat=.42/Math.pow(1.07,round%4);const parts=[[KOR_A,HAR_A],[KOR_A,HAR_A],[KOR_B,HAR_B],[KOR_A,HAR_A]];let tt=t;
   for(const[mel,har]of parts){let bt=0;for(const[m,d]of mel){voice(tt+bt*beat,m,d*beat);bt+=d}for(let bar=0;bar<4;bar++){const[root,ch]=RCH[har[bar]];for(let b=0;b<4;b++){const at=tt+(bar*4+b)*beat;if(b%2===0)pluck(at,root,beat*.9,.22);else for(const n of ch)pluck(at,n,beat*.6,.05)}}tt+=16*beat}
   crackles(t,tt);t=tt+.4;round++}
  SND.timer=setTimeout(schedule,700)};schedule()}
// ── footsteps and the odd door somewhere up the stairwell
function footstep(inStair){const c=SND.ctx,t=c.currentTime+.01,b=c.createBufferSource();b.buffer=SND.stepBuf||(SND.stepBuf=noiseBuf(c,.12));const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=inStair?rand(900,1300):rand(500,700);f.Q.value=1.1;const g=c.createGain();
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(inStair?.32:.14,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+.11);b.connect(f);f.connect(g);g.connect(SND.master);g.connect(inStair?SND.stairVerb:SND.roomVerb);b.start(t);b.stop(t+.13)}
function doorThud(){const c=SND.ctx,t=c.currentTime+.01,b=c.createBufferSource();b.buffer=noiseBuf(c,.4);const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=260;const g=c.createGain();g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);b.connect(f);f.connect(g);g.connect(SND.stairVerb);b.start(t)}
// ── per frame: listener follows the camera; mix follows where you are
const _sp0=new THREE.Vector3(),_sfw=new THREE.Vector3(),_rpOld=new THREE.Vector3(4.12,Y+1.78,3.5),_rpNew=toWorld(8.45,AY+1.2,3.7);let stepAcc=0,doorT=18;
function soundUpdate(dt){if(!SND.ctx)return;const c=SND.ctx,now=c.currentTime,L=c.listener,p=camera.position;camera.getWorldDirection(_sfw);
 if(L.positionX){L.positionX.value=p.x;L.positionY.value=p.y;L.positionZ.value=p.z;L.forwardX.value=_sfw.x;L.forwardY.value=_sfw.y;L.forwardZ.value=_sfw.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0}else{L.setPosition(p.x,p.y,p.z);L.setOrientation(_sfw.x,_sfw.y,_sfw.z,0,1,0)}
 SND.master.gain.setTargetAtTime(SND.on?.9*(1-.35*MEMORY.v):0,now,.4);SND.memF.frequency.setTargetAtTime(20000*Math.pow(.04,Math.pow(MEMORY.v,.8)),now,.3);
 const inKitchen=zone==='flat'&&p.x>1.65&&p.x<4.2&&p.z>3.1&&p.z<5.7,inFlat=zone==='flat',inStair=zone==='stair',outside=!inFlat&&!inStair;
 // in the new flat across the road the radio has come with the family: it plays from the stenka once the lamp is on
 const nf=zone==='newflat',rp=nf?_rpNew:_rpOld;if(SND.pan.positionX){SND.pan.positionX.value=rp.x;SND.pan.positionY.value=rp.y;SND.pan.positionZ.value=rp.z}else SND.pan.setPosition(rp.x,rp.y,rp.z);
 SND.occ.frequency.setTargetAtTime(inKitchen||nf?9000:inFlat?1500:inStair?650:350,now,.25);SND.radioG.gain.setTargetAtTime(nf?.8*clamp(homeLight.intensity/3,0,1):inKitchen||inFlat?.9:inStair?.5:.25,now,nf?1.2:.4);
 const S=SEASONS[season],wet=S.precip===2,snow=S.precip===1;SND.rainG.gain.setTargetAtTime(wet?.12:snow?.02:.03,now,.8);SND.windG.gain.setTargetAtTime(snow?.22:.1,now,.8);SND.rainF.frequency.value=wet?2600:1200;
 SND.outF.frequency.setTargetAtTime(outside||zone==='balcony'?9000:700,now,.3);SND.humG.gain.setTargetAtTime(inStair?.045:0,now,.6);
 // footsteps: one per stride of real movement indoors, ringing in the stair
 const moved=_sp0.distanceTo(p);_sp0.copy(p);if(!outside&&moved<.5){stepAcc+=moved;if(stepAcc>.72){stepAcc=0;footstep(inStair)}}
 if(inStair){doorT-=dt;if(doorT<0){doorT=rand(14,30);doorThud()}}}
async function toggleSound(){try{initAudio();await SND.ctx.resume();SND.on=!SND.on;SND.userOff=!SND.on;try{localStorage.setItem('doma-sound',SND.on?'on':'off')}catch{}$('#sound').textContent=SND.on?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',SND.on)}catch{$('#sound').textContent='Sound unavailable';$('#sound').disabled=true}}
// browsers need a gesture before audio can start: the first click or key turns the sound on (unless you muted it)
function firstGesture(e){if(e&&e.target&&e.target.id==='sound')return;removeEventListener('pointerdown',firstGesture);removeEventListener('keydown',firstGesture);if(SND.userOff||SND.on)return;try{initAudio();SND.ctx.resume();SND.on=true;$('#sound').textContent='Sound on';$('#sound').setAttribute('aria-pressed',true)}catch{}}
addEventListener('pointerdown',firstGesture);addEventListener('keydown',firstGesture);
window.domaSound=SND;
