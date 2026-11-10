function e([e,t],n){let r=!1;for(let i=0,a=n.length-1;i<n.length;a=i++){let[o,s]=n[i],[c,l]=n[a];s>t!=l>t&&e<(c-o)*(t-s)/(l-s)+o&&(r=!r)}return r}function t(t,n,r){function i(e,i){let a=Math.floor(Math.min(e[0],i[0]))-30,o=Math.floor(Math.min(e[1],i[1]))-30,s=Math.ceil(Math.max(e[0],i[0]))+30-a,c=Math.ceil(Math.max(e[1],i[1]))+30-o,l=e=>[a+e%s+.5,o+Math.floor(e/s)+.5],u=([e,t])=>Math.floor(t-o)*s+Math.floor(e-a),d=new Uint8Array(s*c),f=new Float32Array(s*c);for(let e=0;e<s*c;e++){let n=l(e),i=t(n[0],n[1]);d[e]=i.dentro&&!r(n)?1:0,f[e]=i.calle?1:2.5}let p=u(e),m=u(i);d[p]=d[m]=1;let h=new Float64Array(s*c).fill(1/0),g=new Int32Array(s*c).fill(-1),_=e=>Math.hypot(l(e)[0]-i[0],l(e)[1]-i[1]),v=[[_(p),p]],y=(e,t)=>{v.push([e,t]);for(let e=v.length-1;e>0;){let t=e-1>>1;if(v[t][0]<=v[e][0])break;[v[t],v[e]]=[v[e],v[t]],e=t}},b=()=>{let e=v[0],t=v.pop();if(v.length){v[0]=t;for(let e=0;;){let t=2*e+1,n=t+1,r=e;if(t<v.length&&v[t][0]<v[r][0]&&(r=t),n<v.length&&v[n][0]<v[r][0]&&(r=n),r===e)break;[v[r],v[e]]=[v[e],v[r]],e=r}}return e};h[p]=0;let x=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];for(;v.length;){let[,e]=b();if(e===m)break;let t=e%s,r=Math.floor(e/s),i=n(...l(e));for(let[a,o]of x){let u=t+a,p=r+o;if(u<0||p<0||u>=s||p>=c)continue;let m=p*s+u;if(!d[m]||a&&o&&(!d[r*s+u]||!d[p*s+t])||Math.abs(n(...l(m))-i)>1.1)continue;let v=h[e]+Math.hypot(a,o)*f[m];v<h[m]&&(h[m]=v,g[m]=e,y(v+_(m),m))}}let S=[];if(g[m]>=0||m===p)for(let e=m;e>=0&&e!==p;e=g[e])S.unshift(l(e));else S=[];let C=[e,...S.slice(0,-1),i],w=(e,t)=>{let n=Math.ceil(Math.hypot(t[0]-e[0],t[1]-e[1])/.25);for(let r=1;r<n;r++)if(!d[u([e[0]+(t[0]-e[0])*r/n,e[1]+(t[1]-e[1])*r/n])])return!1;return!0},T=[C[0]];for(let e=0;e<C.length-1;){let t=e+1;for(;t+1<C.length&&t-e<40&&w(C[e],C[t+1]);)t++;T.push(C[t]),e=t}let E=[T[0]];for(let e=1;e<T.length;e++){let[t,n]=T[e-1],[r,i]=T[e],a=Math.max(1,Math.ceil(Math.hypot(r-t,i-n)/.5));for(let e=1;e<=a;e++)E.push([t+(r-t)*e/a,n+(i-n)*e/a])}return E}function a(t,n){let i=[t.reduce((e,t)=>e+t[0],0)/t.length,t.reduce((e,t)=>e+t[1],0)/t.length],a=1/0;for(let o=Math.floor(Math.min(...t.map(e=>e[1])))-2;o<=Math.max(...t.map(e=>e[1]))+2;o++)for(let s=Math.floor(Math.min(...t.map(e=>e[0])))-2;s<=Math.max(...t.map(e=>e[0]))+2;s++){let c=[s+.5,o+.5];if(r(c)||e(c,t)||![[1,0],[-1,0],[0,1],[0,-1]].some(([n,r])=>e([c[0]+n,c[1]+r],t)))continue;let l=Math.hypot(c[0]-n[0],c[1]-n[1]);l<a&&(a=l,i=c)}return i}return{rutaLibre:i,puertaDe:a}}var n=(e,t)=>`
<div class="d-tel" aria-label="Llamada a ${e}">
  <div class="d-tel-cuerpo">
    <p class="d-tel-llamando">Llamando…</p>
    <p class="d-tel-a">${e}</p>
    <div class="d-tel-aviso">${t.map((e,t)=>`<p style="animation-delay:${.6+t*.9}s">${e}</p>`).join(``)}</div>
    <div class="d-tel-colgar" aria-hidden="true"></div>
  </div>
</div>`,r=(e,t,n=``)=>`
<div class="d-tel" aria-label="Mensaje de ${e}">
  <div class="d-tel-cuerpo">
    <p class="d-tel-llamando">Mensaje nuevo</p>
    <p class="d-tel-a">${e}</p>
    ${n?`<div class="d-tel-foto">${n}</div>`:``}
    <div class="d-tel-aviso">${t.map((e,t)=>`<p style="animation-delay:${.6+t*.9}s">${e}</p>`).join(``)}</div>
  </div>
</div>`;export{n,t as r,r as t};