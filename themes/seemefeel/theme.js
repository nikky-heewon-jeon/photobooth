// 심의필 (SEEMEFEEL) — KBS KONG 음악 토크쇼.
// 키아트 언어: 순수 흑백 선화 + 망점(스크린톤) · 굵은 검정 테두리 · 부크크 명조 ·
// 바닥에 꽉 찬 로고타입 + 태그라인 한 줄.
const TAGLINE='심의를 준수하는 저품격 음악 토크쇼';
const RED='#ca2b22';

// 망점(스크린톤) — 4px 타일을 한 번 만들어 재사용한다. 점을 하나씩 찍으면 미리보기가 버벅인다.
let _tone=null;
function tone(x){
  if(_tone) return _tone;
  const c=document.createElement('canvas'); c.width=c.height=6;
  const q=c.getContext('2d'); q.fillStyle='rgba(8,8,8,.55)';
  q.beginPath(); q.arc(1.5,1.5,1.5,0,7); q.arc(4.5,4.5,1.5,0,7); q.fill();
  return _tone=x.createPattern(c,'repeat');
}
const cuts=g=>Array.from({length:g.SHOTS},(_,i)=>[g.PAD, g.PAD+i*(g.PH+g.GAP), g.PW, g.PH]);

export default {
  name: '심의필',
  slug: 'seemefeel',
  foot: 196,
  css: 'theme.css',
  brand: ['assets/illust.jpg'],          // 화면 왼쪽에 세우는 키아트
  images: { logo: 'assets/logo.png' },   // 스트립 하단 로고(빨강)
  filters: [
    {id:'original', name:'오리지널', css:'none'},
    {id:'tone',     name:'스크린톤', css:'grayscale(1) contrast(1.18)'},
  ],
  frames: [
    {id:'tone', name:'기본', bg:'#0a0a0a', txt:RED},
  ],
  draw(x, g){
    if(g.filter.id==='tone'){                             // 흑백일 때만 망점을 덮어 만화 인화처럼
      x.fillStyle=tone(x);
      cuts(g).forEach(([cx,cy,cw,ch])=>x.fillRect(cx,cy,cw,ch));
    }
    x.strokeStyle='rgba(255,255,255,.5)'; x.lineWidth=1;
    cuts(g).forEach(([cx,cy,cw,ch])=>x.strokeRect(cx-.5,cy-.5,cw+1,ch+1));

    const L=g.img.logo; let lh=0;
    if(L && L.complete && L.naturalWidth){
      const lw=g.W*0.72; lh=lw*L.naturalHeight/L.naturalWidth;
      x.drawImage(L, (g.W-lw)/2, g.baseY+26, lw, lh);
    }
    x.textAlign='center';
    x.fillStyle='rgba(255,255,255,.72)'; x.font='300 11px "BookkMyungjo", serif';
    x.fillText(TAGLINE, g.W/2, g.baseY+48+lh);
    x.fillStyle=RED; x.font='300 12px "BookkMyungjo", serif';
    x.fillText(g.letterSpace(g.date,1), g.W/2, g.baseY+70+lh);
  },
};
