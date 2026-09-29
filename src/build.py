import re,os,sys
here=os.path.dirname(os.path.abspath(__file__))
S=lambda f:open(os.path.join(here,f),encoding='utf-8').read()
DBG='--debug' in sys.argv
css=(S('css_orig.txt')+S('css_extra.txt')).replace('.scroll-space{height:1000vh','.scroll-space{height:3560vh').replace('#e5e4dc','#dde1db').replace('#e7e6de','#dfe2dc').replace('#c9c8bd44','#aeb6ae55')
css+=""".notes-cols{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin:34px 0 10px}.notes-cols h3{font:600 26px/1 var(--display);margin:0 0 14px;text-transform:uppercase}.log,.why{margin:0;padding-left:18px;font-size:12px;line-height:1.75}.log li,.why li{margin-bottom:12px}.log b,.why b{font-weight:600}@media(max-width:700px){.notes-cols{grid-template-columns:1fr;gap:18px}}"""
js=''.join((f"\nconsole.log('[doma] {f}',performance.now()|0);\n" if DBG and i else '')+S(f) for i,f in enumerate(['01_core.js','02_env.js','03_tower.js','04_apartment.js','05_district.js','055_site.js','06_atmosphere.js','066_paint.js','07_journey.js','075_journal3d.js','076_mobile.js','08_type.js','09_sound.js','99_end.js']))
orig=open(os.path.join(here,'..','original.html'),encoding='utf-8').read()
imgs=re.findall(r'src="(data:image/[^"]+)"',orig)
notes=S('notes.html')
for i,src in enumerate(imgs[:4]):notes=notes.replace('{IMG%d}'%i,src)
import base64,json
AUD=os.path.join(here,'..','audio')
radio=[{'name':f,'b64':base64.b64encode(open(os.path.join(AUD,f),'rb').read()).decode()} for f in sorted(os.listdir(AUD)) if f.endswith('.m4a')] if os.path.isdir(AUD) else []
js=js.replace('/*RADIO*/','const RADIO_DATA='+json.dumps(radio)+';')
out=S('shell.html').replace('/*CSS*/',css).replace('/*JS*/',js).replace('<!--NOTES-->',notes).replace('<!--TICKS-->','')
out=out.replace('"three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}','"three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/","three-mesh-bvh":"https://cdn.jsdelivr.net/npm/three-mesh-bvh@0.8.3/build/index.module.js"}')
out=out.replace('content="#e5e4dc"','content="#dde1db"')
open(os.path.join(here,'..','index.html'),'w',encoding='utf-8').write(out)
print(len(out),len(imgs))
