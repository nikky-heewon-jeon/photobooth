// 심의필 (SEEMEFEEL) — KBS KONG 음악 토크쇼.
// 1080×1920 키비주얼(꽃 지면 + 로고타입)을 프레임으로 쓰고, 출연자 일러스트를 컷 안에 세운다.
// 팬은 출연자 시선 반대편 빈자리에 선다. 라이브뷰에 반투명 가이드로 그 자리를 보여준다.
const RED='#ca2b22';
const F={w:1080,h:1920, fx0:54,fx1:1026, fy0:48, floral1:1360}; // 프레임 이미지 치수(실측)

// 와이드 9:16 — 원본 프레임 그대로, 지면 폭을 꽉 채운 납작 4컷
const WIDE=(()=>{ const L=90,R=F.w-90,top=84,bot=1330,gap=22,w=R-L,h=Math.floor((bot-top-gap*3)/4);
  return {W:F.w, H:F.h, rects:[0,1,2,3].map(i=>[L,top+i*(h+gap),w,h])}; })();
// 세로 스트립 — 꽃 지면을 거울 반복해 늘리고 로고 밴드를 바닥에 고정, 3:2 4컷
const TALL=(()=>{ const pad=56,gap=28,w=F.fx1-F.fx0-pad*2,h=Math.round(w/1.5),bodyH=pad+4*h+3*gap+pad;
  return {W:F.w, H:F.fy0+bodyH+(F.h-F.floral1), bodyH, rects:[0,1,2,3].map(i=>[F.fx0+pad,F.fy0+pad+i*(h+gap),w,h])}; })();
// 흰 종이 프레임(실사용) — 여백을 최소로, 컷이 폭을 거의 다 차지. 하단에 도장 하나가 4컷 아래를 물고 사선으로
const PTALL=(()=>{ const pad=40,gap=28,w=F.w-pad*2,h=Math.round(w/1.5); const r=[0,1,2,3].map(i=>[pad,pad+i*(h+gap),w,h]); const last=r[3];
  return {W:F.w, H:last[1]+last[3]+280, rects:r, stamp:{cx:F.w/2+90, cy:last[1]+last[3]+20, w:760, deg:-15}}; })();
const LAYOUT={ floral:{wide:WIDE, tall:TALL}, paper:{tall:PTALL} };

// 컷별 출연자 배치 — side 설 자리 · scale 컷 높이 대비 · down 아래로 내림(음수면 위로) · anchor 기준변. 4컷은 팬만.
// 팬은 출연자가 몸을 기울이거나 손짓하는 쪽(비어 있는 쪽)에 선다.
const PLAN={
  illust:{ // 반신 일러스트
    wide:[{img:'cha',side:'R',scale:1.55,down:.04,anchor:'top'},
          {img:'kim',side:'C',scale:1.55,down:.03,anchor:'top'},
          {img:'pd', side:'L',scale:1.35,down:.04,anchor:'top'}, null],
    tall:[{img:'cha',side:'R',scale:1.20,down:.16},
          {img:'kim',side:'C',scale:0.95,down:.14},
          {img:'pd', side:'L',scale:0.94,down:.12}, null],
  },
  photo:{  // 전신 실사 — 일러스트처럼 상반신만 보이게 키우고, 하트 손이 가운데 오게. 팬은 오른쪽 (세로만 씀)
    tall:[{img:'pcha',side:'L',scale:1.9,down:.06,anchor:'top',shift:-.02},  // 하트 손이 컷 가운데 오게 왼쪽으로 — 몸 왼쪽은 잘림
          {img:'pkim',side:'L',scale:1.9,down:.06,anchor:'top',shift:+.08},  // 손(하트)이 컷 가운데
          {img:'ppd', side:'L',scale:1.9,down:.10,anchor:'top',shift:0}, null], // 왼쪽 절반을 차지 — 하트의 왼쪽 반, 팬이 오른쪽 반
  },
};

const ready=im=>im&&im.complete&&im.naturalWidth>0;
let _tone=null;
function tone(x){ // 망점 — 6px 타일 한 번 만들어 재사용
  if(_tone) return _tone;
  const c=document.createElement('canvas'); c.width=c.height=6;
  const q=c.getContext('2d'); q.fillStyle='rgba(8,8,8,.55)';
  q.beginPath(); q.arc(1.5,1.5,1.5,0,7); q.arc(4.5,4.5,1.5,0,7); q.fill();
  return _tone=x.createPattern(c,'repeat');
}
const _paper={};
function paperCanvas(W,H){ // 흰 종이 질감 — 알갱이 + 섬유결 + 옅은 얼룩. 누렇게는 안 한다. 크기별로 한 번만 그려 캐시
  const k=W+'x'+H; if(!_paper[k]){ const c=document.createElement('canvas'); c.width=W; c.height=H; const q=c.getContext('2d');
    let s=1234; const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    q.fillStyle='#fcfbf9'; q.fillRect(0,0,W,H); // 더 흰 종이
    for(let i=0;i<7;i++){ const px=rnd()*W,py=rnd()*H,r=200+rnd()*320; const g=q.createRadialGradient(px,py,0,px,py,r); g.addColorStop(0,'rgba(60,60,60,.03)'); g.addColorStop(1,'rgba(60,60,60,0)'); q.fillStyle=g; q.fillRect(px-r,py-r,r*2,r*2); } // 톤 얼룩
    q.strokeStyle='rgba(70,70,70,.10)'; q.lineWidth=1;
    for(let i=0;i<Math.round(W*H/1100);i++){ const px=rnd()*W,py=rnd()*H,a=rnd()*Math.PI,l=5+rnd()*16; q.beginPath(); q.moveTo(px,py); q.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l); q.stroke(); } // 섬유결
    q.fillStyle='rgba(50,50,50,.09)'; for(let i=0;i<Math.round(W*H/300);i++) q.fillRect(rnd()*W,rnd()*H,1+rnd()*1.5,1+rnd()*1.5); // 알갱이
    _paper[k]=c; }
  return _paper[k];
}
function paperBg(x,W,H){ x.drawImage(paperCanvas(W,H),0,0); }
function printOn(x,W,H,[rx,ry,rw,rh]){ // 사진 위에 종이 질감을 곱한다 — 종이에 인화된 것처럼 알갱이가 비친다
  x.save(); x.globalCompositeOperation='multiply'; x.globalAlpha=.55; x.drawImage(paperCanvas(W,H),rx,ry,rw,rh,rx,ry,rw,rh); x.restore();
}
function seal(x,im,{cx,cy,w,deg}){ // 도장 — multiply로 종이에 스민 느낌
  const h=w*im.naturalHeight/im.naturalWidth;
  x.save(); x.translate(cx,cy); x.rotate(deg*Math.PI/180); x.globalAlpha=.94; x.globalCompositeOperation='multiply';
  x.drawImage(im,-w/2,-h/2,w,h); x.restore();
}
function cover(x,img,dx,dy,dw,dh){ // 비율 유지하고 가운데를 채운다
  const s=Math.max(dw/img.width,dh/img.height), cw=dw/s, ch=dh/s;
  x.drawImage(img,(img.width-cw)/2,(img.height-ch)/2,cw,ch,dx,dy,dw,dh);
}
function host(x,im,dx,dy,dw,dh,{side,scale,down=0,anchor='bottom',shift=0}){ // 컷 밖은 잘린다(의도)
  const h=dh*scale, w=h*im.naturalWidth/im.naturalHeight, inset=dw*0.03;
  const px = (side==='L'? dx+inset : side==='R'? dx+dw-w-inset : dx+(dw-w)/2) + dw*shift; // shift: 컷 폭 대비 좌우 이동(+오른쪽)
  const py = anchor==='top' ? dy+dh*down : dy+dh-h+dh*down;
  x.save(); x.beginPath(); x.rect(dx,dy,dw,dh); x.clip(); x.drawImage(im,px,py,w,h); x.restore();
}
function border(x,dx,dy,dw,dh){ x.strokeStyle='#141414'; x.lineWidth=4; x.strokeRect(dx-2,dy-2,dw+4,dh+4); }
function tallBg(x,fr){ // 상단 테두리 + 꽃 지면 거울 타일(이음새 없음) + 로고 밴드
  const logoBand=F.h-F.floral1, bodyH=TALL.bodyH;
  x.fillStyle='#141414'; x.fillRect(0,0,F.w,TALL.H);
  x.drawImage(fr,0,0,F.w,F.fy0, 0,0,F.w,F.fy0);
  const sy=F.fy0, sh=F.floral1-F.fy0; let y=F.fy0, flip=false;
  while(y<F.fy0+bodyH){
    const dh=Math.min(sh, F.fy0+bodyH-y); x.save();
    if(flip){ x.translate(0,y+dh); x.scale(1,-1); x.drawImage(fr,0,sy+(sh-dh),F.w,dh, 0,0,F.w,dh); }
    else x.drawImage(fr,0,sy,F.w,dh, 0,y,F.w,dh);
    x.restore(); y+=dh; flip=!flip;
  }
  x.drawImage(fr,0,F.floral1,F.w,logoBand, 0,F.fy0+bodyH,F.w,logoBand);
}

export default {
  name: '심의필',
  slug: 'seemefeel',
  css: 'theme.css',
  images: { frame:'assets/frame.jpg',
            cha:'assets/cha.png',   kim:'assets/kim.png',   pd:'assets/pd.png',      // 일러스트
            pcha:'assets/pcha.webp', pkim:'assets/pkim.webp', ppd:'assets/ppd.webp',   // 실사 누끼
            stamp:'assets/stamp.png' },                                                 // 도장 로고(종이 프레임용)
  filters: [
    {id:'original', name:'오리지널', css:'none'},
    {id:'tone',     name:'스크린톤', css:'grayscale(1) contrast(1.18)'},
  ],
  frames: [ // layout: 캔버스·컷 배치 / cast: 어떤 출연자 그림을 세울지
    {id:'wide-i', name:'와이드 일러스트', layout:'wide', cast:'illust', bg:'#0a0a0a', txt:RED},
    {id:'tall-i', name:'세로 일러스트',   layout:'tall', cast:'illust', bg:'#0a0a0a', txt:RED},
    {id:'tall-p', name:'세로 실사',       layout:'tall', cast:'photo',  paper:true, bg:'#f7f6f2', txt:RED}, // paper: 꽃 대신 흰 종이 + 도장
  ],

  // 스트립 전체를 그린다 — 캔버스 크기·배경·컷·출연자·테두리
  compose(cv, shots, g){
    const fr=g.img.frame;
    if(!ready(fr)){ cv.width=9; cv.height=16; return; } // 프레임 이미지 로딩 전
    const L=LAYOUT[g.frame.paper?'paper':'floral'][g.frame.layout], plan=PLAN[g.frame.cast][g.frame.layout];
    cv.width=L.W; cv.height=L.H; const x=cv.getContext('2d'); x.imageSmoothingQuality='high';
    if(g.frame.paper) paperBg(x,L.W,L.H); else if(g.frame.layout==='wide') x.drawImage(fr,0,0); else tallBg(x,fr);
    L.rects.forEach((r,i)=>{
      const s=shots[i];
      if(s) cover(x,s,...r); else { x.fillStyle='#bdbdbd'; x.fillRect(...r); }
      if(g.filter.id==='tone'){ x.fillStyle=tone(x); x.fillRect(...r); }
      const p=plan[i]; if(p && ready(g.img[p.img])) host(x,g.img[p.img],...r,p);
      if(g.frame.paper) printOn(x,L.W,L.H,r);
      border(x,...r);
    });
    if(g.frame.paper && ready(g.img.stamp)) seal(x,g.img.stamp,L.stamp); // 4컷 아래를 물고 찍힌 도장
  },

  // 라이브뷰 가이드 — 이 컷에 실제로 담기는 띠만 밝게, 출연자를 반투명으로 제자리에
  guide(x, g){
    const L=LAYOUT[g.frame.paper?'paper':'floral'][g.frame.layout], [,,cw,ch]=L.rects[g.i];
    const bh=Math.min(g.H, g.W/(cw/ch)), by=(g.H-bh)/2;   // 3:2 라이브뷰를 컷 비율로 가운데 자른 띠
    if(bh<g.H-1){ x.fillStyle='rgba(0,0,0,.55)'; x.fillRect(0,0,g.W,by); x.fillRect(0,by+bh,g.W,g.H-by-bh); }
    const p=PLAN[g.frame.cast][g.frame.layout][g.i], im=p&&g.img[p.img];
    if(ready(im)){ x.globalAlpha=.5; host(x,im,0,by,g.W,bh,p); x.globalAlpha=1; }
  },
};
