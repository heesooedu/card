# 모바일 청첩장

GitHub Pages에 올려 카카오톡으로 공유할 수 있는 정적 모바일 청첩장입니다.

## 수정 방법

1. `config.js`에서 신랑, 신부, 예식일, 장소, 계좌, 문구를 수정합니다.
2. 원본 사진은 `assets/photos` 폴더에 넣습니다.
3. 청첩장에서 실제로 불러올 웹용 사진은 `assets/photos/web` 폴더에 넣습니다.
4. 대표 사진은 `assets/photos/web/cover.jpg` 이름으로 저장합니다.
5. 갤러리 사진은 `config.js`의 `photos` 목록에 파일 경로를 추가합니다.

## 카카오톡 공유

GitHub Pages 주소는 보통 아래 형태입니다.

```text
https://heesooedu.github.io/card/
```

카카오톡 미리보기 이미지는 `index.html`의 `og:image`와 `assets/photos/cover.jpg`를 사용합니다. 사진을 바꾼 뒤 카카오톡에서 이전 이미지가 보이면 카카오톡 링크 캐시가 남아 있는 상태일 수 있습니다.

## 카카오맵 설정

`config.js`의 `kakaoAppKey`에 Kakao Developers에서 발급받은 JavaScript 키를 입력합니다.

```js
kakaoAppKey: "발급받은_JavaScript_키"
```

Kakao Developers의 앱 설정에서 Web 플랫폼 도메인도 등록해야 합니다.

```text
https://heesooedu.github.io
```

로컬에서 테스트할 때는 필요에 따라 아래 주소도 추가합니다.

```text
http://localhost:포트번호
```

## GitHub Pages 설정

1. GitHub 저장소 `heesooedu/card`로 파일을 올립니다.
2. 저장소의 `Settings > Pages`로 이동합니다.
3. `Deploy from a branch`를 선택합니다.
4. Branch는 `main`, 폴더는 `/root`를 선택합니다.
