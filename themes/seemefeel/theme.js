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
  photo:{  // 전신 실사 — 일러스트처럼 상반신만 보이게 키우고, 셋 다 같은 자리(왼쪽에서 11%)에. 팬은 오른쪽
    wide:[{img:'pcha',side:'L',scale:3.0,down:-.02,anchor:'top',shift:-.02},
          {img:'pkim',side:'L',scale:3.0,down:-.02,anchor:'top',shift:+.08},
          {img:'ppd', side:'L',scale:3.0,down:.02,anchor:'top',shift:+.08}, null], // 김은하: 올린 팔까지 보이게
    tall:[{img:'pcha',side:'L',scale:1.9,down:.06,anchor:'top',shift:-.02},  // 하트 손이 컷 가운데 오게 왼쪽으로 — 몸 왼쪽은 잘림
          {img:'pkim',side:'L',scale:1.9,down:.06,anchor:'top',shift:+.08},  // 손(하트)이 컷 가운데
          {img:'ppd', side:'L',scale:1.9,down:.03,anchor:'top',shift:+.08}, null], // 머리 위로 올린 팔(하트 윗부분)까지 컷 안에
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
            pcha:'assets/pcha.webp', pkim:'assets/pkim.webp', ppd:'assets/ppd.webp' }, // 실사 누끼
  filters: [
    {id:'original', name:'오리지널', css:'none'},
    {id:'tone',     name:'스크린톤', css:'grayscale(1) contrast(1.18)'},
  ],
  frames: [ // layout: 캔버스·컷 배치 / cast: 어떤 출연자 그림을 세울지
    {id:'wide-i', name:'와이드 일러스트', layout:'wide', cast:'illust', bg:'#0a0a0a', txt:RED},
    {id:'tall-i', name:'세로 일러스트',   layout:'tall', cast:'illust', bg:'#0a0a0a', txt:RED},
    {id:'wide-p', name:'와이드 실사',     layout:'wide', cast:'photo',  bg:'#0a0a0a', txt:RED},
    {id:'tall-p', name:'세로 실사',       layout:'tall', cast:'photo',  bg:'#0a0a0a', txt:RED},
  ],

  // 스트립 전체를 그린다 — 캔버스 크기·배경·컷·출연자·테두리
  compose(cv, shots, g){
    const fr=g.img.frame;
    if(!ready(fr)){ cv.width=9; cv.height=16; return; } // 프레임 이미지 로딩 전
    const L=g.frame.layout==='wide'?WIDE:TALL, plan=PLAN[g.frame.cast][g.frame.layout];
    cv.width=L.W; cv.height=L.H; const x=cv.getContext('2d'); x.imageSmoothingQuality='high';
    if(g.frame.layout==='wide') x.drawImage(fr,0,0); else tallBg(x,fr);
    L.rects.forEach((r,i)=>{
      const s=shots[i];
      if(s) cover(x,s,...r); else { x.fillStyle='#bdbdbd'; x.fillRect(...r); }
      if(g.filter.id==='tone'){ x.fillStyle=tone(x); x.fillRect(...r); }
      const p=plan[i]; if(p && ready(g.img[p.img])) host(x,g.img[p.img],...r,p);
      border(x,...r);
    });
  },

  // 라이브뷰 가이드 — 이 컷에 실제로 담기는 띠만 밝게, 출연자를 반투명으로 제자리에
  guide(x, g){
    const L=g.frame.layout==='wide'?WIDE:TALL, [,,cw,ch]=L.rects[g.i];
    const bh=Math.min(g.H, g.W/(cw/ch)), by=(g.H-bh)/2;   // 3:2 라이브뷰를 컷 비율로 가운데 자른 띠
    if(bh<g.H-1){ x.fillStyle='rgba(0,0,0,.55)'; x.fillRect(0,0,g.W,by); x.fillRect(0,by+bh,g.W,g.H-by-bh); }
    const p=PLAN[g.frame.cast][g.frame.layout][g.i], im=p&&g.img[p.img];
    if(ready(im)){ x.globalAlpha=.5; host(x,im,0,by,g.W,bh,p); x.globalAlpha=1; }
  },
};
