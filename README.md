# photobooth

4컷 자동촬영 포토부스. 엔진은 하나, 포토부스마다 테마 폴더 하나.

```
index.html          엔진. ?theme=<폴더명> 으로 테마를 불러온다. 테마를 추가해도 여기는 안 고친다
d.html              QR로 들어오는 사진 저장 페이지 (테마 공유)
qrcode.js           QR 생성 (외부 의존성 없음)
check.mjs           테마 계약 검사
themes/base/        기본 테마 — 화이트·블랙 캔버스 프레임
```

열기: `python3 -m http.server 8787` → http://localhost:8787/?theme=base
`file://`로 열면 카메라가 안 잡힌다 — localhost 또는 HTTPS에서만 동작한다.

## 새 포토부스 만들기

```bash
cp -r themes/base themes/<이름>
node check.mjs                      # 계약 통과 확인
open http://localhost:8787/?theme=<이름>
```

`themes/<이름>/theme.js`의 값만 고친다. 계약:

| 필드 | 필수 | 뜻 |
|---|---|---|
| `name` | O | `<title>`과 화면 헤더 |
| `slug` | | 저장 파일명 접두사 (기본 `photobooth`) |
| `frames` | O | `{id, name, sub?, color?, bg, txt}` 배열. 스트립 배경색과 글자색. `sub`는 칩 둘째 줄(작게), `color`는 칩 색 |
| `phrases` | O | 문구 칩. 첫 항목이 기본값, `''`는 문구 없음 |
| `css` | | 이 폴더의 CSS를 덧씌운다 (폰트·색·장식) |

에셋(이미지·폰트)은 테마 폴더 안에 둔다. 엔진의 `asset(경로)`가 `themes/<이름>/` 기준으로 풀어준다.

필터(오리지널·흑백·하두리)와 촬영 스펙(4컷·3:2·DPR 3)은 엔진에 있다 — 테마마다 바뀔 일이 아니라서 밖으로 빼지 않았다.

## 배포

GitHub Pages. 소스가 곧 배포본이라 동기화 단계가 없다.

```bash
gh repo create nikky-heewon-jeon/photobooth --public --source=. --push
# 그다음 레포 Settings > Pages > Source: main / (root) 한 번만 설정
git push    # 이후로는 이것만
```

→ `https://nikky-heewon-jeon.github.io/photobooth/?theme=base`

## QR 저장

결과 화면에서 스트립을 Cloudinary에 무서명 업로드하고, `d.html?img=...` 주소를 QR로 띄운다.
[index.html](index.html)의 `CLOUD_NAME`·`UPLOAD_PRESET` 두 값으로 설정한다. 둘 중 하나라도 비우면
QR 자리에 안내만 뜨고 SAVE(로컬 저장)는 그대로 동작한다.

지금은 지은불사 포토부스의 preset(`jebs-pb`)을 그대로 쓰고 있어서 사진이 같은 폴더에 섞인다.
Cloudinary에서 unsigned preset을 새로 만들어 바꾸면 분리된다.

## 아직 없는 것

- **오버레이 PNG 프레임** — 사진을 투명 창에 깔고 PNG를 덮는 방식. `cc/photo-booth`(지은불사)에
  `composeOverlay`로 있다. 창 좌표를 비율로 재서 `frames[].windows`에 넣어야 하므로 에셋과 좌표가 한 쌍이다
- **전체화면 촬영모드** — 키오스크로 세웠을 때 3·2·1을 놓치지 않게 하는 장치. 지은불사에 있다(약 25줄)
