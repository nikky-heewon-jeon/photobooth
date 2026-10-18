// 테마 계약 검사: node check.mjs — themes/* 전부 열어 필수 필드를 확인한다.
// 지금 계약은 캔버스 색 프레임({bg,txt}) 기준. 오버레이 PNG 프레임을 쓰게 되면 여기도 같이 고친다.
import {readdirSync} from 'node:fs';
let bad=0;
for(const d of readdirSync('themes',{withFileTypes:true}).filter(d=>d.isDirectory())){
  const err=[];
  try{
    const T=(await import(`./themes/${d.name}/theme.js`)).default;
    if(!T.name) err.push('name 없음');
    if(!Array.isArray(T.frames)||!T.frames.length) err.push('frames 비었음');
    (T.frames||[]).forEach((f,i)=>{ if(!f.id||!f.name||!f.bg||!f.txt) err.push(`frames[${i}]에 id·name·bg·txt 중 누락`); });
    if(T.phrases!==undefined && !Array.isArray(T.phrases)) err.push('phrases가 배열이 아님'); // 없어도 됨 — 문구 칸을 안 쓰는 테마
    if(T.filters!==undefined && (!Array.isArray(T.filters)||!T.filters.length)) err.push('filters가 비었음'); // 없으면 엔진 기본 필터
    (T.filters||[]).forEach((f,i)=>{ if(!f.id||!f.name||!f.css) err.push(`filters[${i}]에 id·name·css 중 누락`); });
  }catch(e){ err.push('import 실패: '+e.message); }
  console.log(err.length?`✗ ${d.name} — ${err.join(' / ')}`:`✓ ${d.name}`);
  if(err.length) bad++;
}
process.exit(bad?1:0);
