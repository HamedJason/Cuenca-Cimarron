"""Pone a las escuelas del catálogo el punto del DENUE del INEGI cuando la SEP no las ubica.

La SEP marca en el centro de Tijuana (32.497, -117.08) las escuelas sin ubicación. Este script cruza cada
una con el DENUE (sector 61, Tijuana y Playas de Rosarito) por nombre, colonia, calle y nivel, y guarda
el punto en backend/database/data/catalogo-escuelas-2026.json.gz con geo = inegi (nombre y dirección
coinciden) o aprox (solo coincide el nombre, que es único en la ciudad). Las que la SEP sí ubica quedan
con geo = sep.

Uso (desde la raíz del repositorio):
  1. Descarga el CSV de "Servicios educativos" en https://www.inegi.org.mx/app/descarga/ (DENUE)
  2. python3 infra/ubicar-escuelas-denue.py ruta/a/denue_inegi_61_.csv          (solo muestra cuántas)
     python3 infra/ubicar-escuelas-denue.py ruta/a/denue_inegi_61_.csv write    (guarda el catálogo)

Corre sobre el catálogo original de la SEP (lat y lng sin tocar), por eso guarda la copia en
infra/catalogo-escuelas-sep-2026.json.gz la primera vez.
"""
import csv
import json,gzip,os,re,unicodedata,math,collections,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLED=os.path.join(ROOT,'backend/database/data/catalogo-escuelas-2026.json.gz')
ORIGINAL=os.path.join(ROOT,'infra/catalogo-escuelas-sep-2026.json.gz')
if not os.path.exists(ORIGINAL):
    open(ORIGINAL,'wb').write(open(BUNDLED,'rb').read())
cat=json.load(gzip.open(ORIGINAL))
SKIP=('611621','611691','611631','611421','611411','611431','611698','611699')  # deporte, clases particulares, idiomas, computación, etc.
den=[r for r in csv.DictReader(open(sys.argv[1],encoding='latin1',newline=''))
     if r['cve_ent']=='02' and r['cve_mun'] in('004','005') and not r['codigo_act'].startswith(SKIP)]
MODE=sys.argv[2] if len(sys.argv)>2 else ''
def norm(t):
    t=unicodedata.normalize('NFD',str(t or '')).encode('ascii','ignore').decode().lower()
    t=t.replace('0z','oz')
    return re.sub(r'[^a-z0-9 ]',' ',t)
STOP=set('de del la las el los y e en a al escuela esc primaria secundaria preescolar jardin ninos nino federal federalizada estatal general tecnica tec num no numero turno matutino vespertino nocturno continuo completo colegio instituto centro educativo educacion especial plantel cct sep isep inicial jn of oficial prof profa profr profesor profesora lic dr gral ing'.split())
def toks(t): return [w for w in norm(t).split() if w not in STOP and len(w)>1 or w.isdigit()]
def lvl_den(c):
    if c.startswith('61111'):return 'preescolar'
    if c.startswith('61112'):return 'primaria'
    if c[:5] in('61113','61114'):return 'secundaria'
    if c[:5] in('61115','61116'):return 'media-superior'
    if c.startswith('61118'):return 'especial'
    if c.startswith('6111'):return 'mixta'
    return 'otra'
def km(a,b,c,d): return math.hypot((a-c)*111.0,(b-d)*94.0)
ASTOP=set('calle avenida av blvd boulevard bulevar privada cerrada andador callejon circuito prolongacion carretera camino sin nombre ninguno colonia fraccionamiento fracc zona urbana seccion barrio delegacion conjunto habitacional infonavit unidad'.split())
def atoks(t): return set(w for w in norm(t).split() if w not in ASTOP and len(w)>2)
D=[]
for r in den:
    D.append(dict(name=r['nom_estab'],nt=set(toks(r['nom_estab']))|set(toks(r['raz_social'])) if False else set(toks(r['nom_estab'])),
      st=atoks(r['nom_vial']),col=atoks(r['nomb_asent']),num=r['numero_ext'].strip(),lvl=lvl_den(r['codigo_act']),
      pub=r['codigo_act'][-1]=='2',lat=float(r['latitud']),lng=float(r['longitud']),mun=r['municipio']))
def sim(a,b):
    if not a or not b: return 0
    return len(a&b)/min(len(a),len(b)) if min(len(a),len(b)) else 0
from difflib import SequenceMatcher
def tsame(x,y): return x==y or (len(x)>4 and len(y)>4 and (x.startswith(y[:5]) and SequenceMatcher(None,x,y).ratio()>=0.84))
def jac(a,b):
    if not a or not b: return 0
    hit=sum(1 for x in a if any(tsame(x,y) for y in b))
    return hit/(len(a)+len(b)-hit)
res=[]
for s in cat:
    nt=set(toks(s['name'])); st=atoks(re.sub(r'\d+','',s.get('address') or '')); col=atoks(s.get('colonia') or '')
    num=(re.findall(r'\d+',s.get('address') or '') or [''])[-1]
    mun='Tijuana' if s['municipality']=='Tijuana' else 'Playas de Rosarito'
    best=[]
    for d in D:
        if d['mun']!=mun: continue
        lv=s.get('level'); 
        lvok = d['lvl']=='mixta' or d['lvl']==lv or (lv is None) or (d['lvl']=='otra' and lv=='media-superior')
        if not lvok: continue
        ns=jac(nt,d['nt']) if nt else 0
        cs=jac(col,d['col']); ss=jac(st,d['st'])
        nm = 1 if num and num==d['num'] else 0
        sc= 3*ns + 1.5*cs + 1.2*ss + 0.8*nm + (0.3 if (s.get('sector')=='publica')==d['pub'] else 0)
        best.append((sc,ns,cs,ss,nm,d))
    best.sort(key=lambda x:-x[0])
    if not best: res.append((s,None,0)); continue
    b=best[0]; second=best[1][0] if len(best)>1 else 0
    sc,ns,cs,ss,nm,d=b
    # confianza
    def rule(sc,ns,cs,ss,nm,d):
        if ns>=0.5 and (cs>=0.5 or ss>=0.5): return 'alta'
        if ns>=0.34 and cs>=0.5 and ss>=0.5: return 'alta'
        if cs>=0.6 and ss>=0.6 and nm: return 'direccion'
        return None
    conf=rule(*b)
    far=lambda o: km(o[5]['lat'],o[5]['lng'],d['lat'],d['lng'])>0.3
    if conf and any(rule(*o)==conf and far(o) and o[0]>=sc-0.5 for o in best[1:6]): conf=None
    if not conf and ns>=0.99 and len(nt)>=2:
        # nombre completo y único en la ciudad
        same=[o for o in best if o[1]>=0.99 and far(o)]
        twins=sum(1 for x in cat if x is not s and set(toks(x['name']))==nt and x['municipality']==s['municipality'])
        if not same and twins==0: conf='nombre'
    res.append((s,d if conf else None,conf,b,second))
PH=(32.497,-117.08)
ph=[r for r in res if (r[0]['lat'],r[0]['lng'])==PH]
real=[r for r in res if (r[0]['lat'],r[0]['lng'])!=PH]
print('sin ubicacion',len(ph),collections.Counter(r[2] for r in ph))
print('con ubicacion SEP',len(real),collections.Counter(r[2] for r in real))
# validacion: distancia vs SEP real coords
for c in("alta","direccion","nombre"):
    ds=sorted(km(r[0]['lat'],r[0]['lng'],r[1]['lat'],r[1]['lng']) for r in real if r[2]==c)
    if ds: print(c,'n',len(ds),'mediana km',round(ds[len(ds)//2],3),'p90',round(ds[int(len(ds)*.9)],3),'>1km',sum(x>1 for x in ds))
if MODE=='far':
    for r in real:
        if r[2]=='alta':
            k=km(r[0]['lat'],r[0]['lng'],r[1]['lat'],r[1]['lng'])
            if k>1: print(round(k,1),'|',r[0]['name'],'|',r[0].get('address'),'|',r[0].get('colonia'),'||',r[1]['name'],'|',' '.join(r[1]['st']),'|',' '.join(r[1]['col']),'| ns=%.2f cs=%.2f ss=%.2f'%r[3][1:4])
if MODE=='miss':
    import random; random.seed(5)
    m=[r for r in ph if r[2] is None]
    print(collections.Counter(r[0]['sector'] for r in m), collections.Counter(r[0]['level'] for r in m))
    for r in random.sample(m,25):
        b=r[3]; print(r[0]['name'],'|',r[0].get('address'),'|',r[0].get('colonia'),'||',b[5]['name'],'|',' '.join(b[5]['col']),'| ns=%.2f cs=%.2f ss=%.2f'%b[1:4])
if MODE=='write':
    out=[]; c=collections.Counter()
    for r in res:
        s=dict(r[0]); conf=r[2]
        if (s['lat'],s['lng'])!=PH and s.get('lat') is not None: s['geo']='sep'
        elif conf in('alta','direccion'): s['lat'],s['lng'],s['geo']=round(r[1]['lat'],6),round(r[1]['lng'],6),'inegi'
        elif conf=='nombre': s['lat'],s['lng'],s['geo']=round(r[1]['lat'],6),round(r[1]['lng'],6),'aprox'
        else: s['lat']=s['lng']=s['geo']=None
        c[s['geo']]+=1; out.append(s)
    print(c)
    data=json.dumps(out,ensure_ascii=False,separators=(',',':')).encode()
    import gzip as g
    with open(BUNDLED,'wb') as f:
        f.write(g.compress(data,9,mtime=0))
