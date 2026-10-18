// 기본 테마 — 캔버스 색 프레임만. 에셋 없음.
// 새 포토부스를 만들 땐 이 폴더를 복사해서 값만 바꾼다(엔진은 건드리지 않는다).
export default {
  name: 'PHOTO BOOTH',   // <title>·헤더에 표시
  slug: 'photobooth',    // 저장 파일명 접두사
  frames: [
    {id:'white', name:'화이트', bg:'#f7f7f4', txt:'#111'},
    {id:'black', name:'블랙',   bg:'#101010', txt:'#f4f4f4'},
  ],
  phrases: ['','오늘 좋았다','또 보자'],  // 첫 항목이 기본값. ''는 문구 없음
  // css: 'theme.css',  // 선택 — 이 폴더의 CSS를 덧씌운다(폰트·색·장식)
};
