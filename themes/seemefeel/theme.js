// 심의필 (SEEMEFEEL) — 검은 바탕, 하단에 로고.
// 버전은 frames에 한 줄씩 늘린다. 하단 그림은 draw()가 전부 그린다.
export default {
  name: '심의필',
  slug: 'seemefeel',
  foot: 170,                       // 사진 아래 높이 — 로고가 들어가서 기본(82)보다 크다
  css: 'theme.css',                // 날짜용 타자기 폰트
  images: { logo: 'assets/logo.png' },
  frames: [
    {id:'black', name:'기본', bg:'#0a0a0a', txt:'#ca2b22'}, // txt = 로고에서 뽑은 빨강
  ],
  // phrases 없음 — 문구 칸을 안 쓴다(엔진이 칸 자체를 숨긴다)
  draw(x, g){
    const L=g.img.logo;
    if(L && L.complete && L.naturalWidth){
      const lw=g.W*0.62, lh=lw*L.naturalHeight/L.naturalWidth;
      x.drawImage(L, (g.W-lw)/2, g.baseY+30, lw, lh);
    }
    x.fillStyle=g.frame.txt; x.textAlign='center';
    x.font='400 13px "MomsTypewriter", monospace'; // 로고 빨강 그대로 — 검정 위에서 흐려지지 않게 알파를 뺐다
    x.fillText(g.letterSpace(g.date,1), g.W/2, g.baseY+152);
  },
};
