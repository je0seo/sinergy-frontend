# 🏷️SINERGY 

[**시립대를 누비는 너를 위한 지도 : 시너지**](https://uos-urbanscience.org/archives/uos_portfolio/%ec%8b%9c%eb%84%88%ec%a7%80-%ec%8b%9c%eb%a6%bd%eb%8c%80%eb%a5%bc-%eb%88%84%eb%b9%84%eb%8a%94-%eb%84%88%eb%a5%bc-%ec%9c%84%ed%95%9c-%ec%a7%80%eb%8f%84
)

*백엔드* ➡️ https://github.com/je0seo/sinergy-backend

---
![KakaoTalk_20240530_231804579_01.png](..%2FKakaoTalk_20240530_231804579_01.png)


```
📍링크 및 노드 데이터를 전달 받은 분들은 DB를 새로 생성해야 합니다.

📍배포했던 모든 서버(웹 페이지, 웹 서버, GeoServer)는 현재 비용 문제로 폐지되었습니다.
(따라서 로컬 환경에서만 접속이 가능합니다.)

📍지오서버에서 기존과 같은 환경으로 DB연결 및 저장공간, 레이어그룹, 스타일 등의 설정을 
따르지 않으면 사이트가 제 기능을 다하지 못할 수 있습니다.
```

## 👩‍💻 Developers 🙌

---
서울시립대학교 공간정보공학과

- 😊 **이주희** (*2021930021*)

- 😊 **제영서** (*2021930026*)

- 😊 **최수아** (*2021930028*)

## 💻 Getting Started

---
### Installation
1. Git Clone 하여 모든 파일을 다운로드
2. IntelliJ든 vsCode든 sinergy-frontend 폴더 열기 
3. 터미널에서 경로가 sinergy-frontend 폴더로 설정 되었는지 확인
5. 터미널에 다음과 같이 입력 (`package.json` 파일에 명시된 모든 의존성 자동설치)
```
npm install
```
### To Run Server
```agsl
npm start
```
- frontend 뿐만 아니라 backend도 설치 후 frontend와 함께 run해야 브라우저에서 원하는 동작이 제대로 기능할 수 있을 것.
- 로컬 환경이라면 http://localhost:3000에서 바로 접속이 가능하다.
## 🛠️ Stack

---
- Language: `JavaScript`, `CSS`
- Library & Framework: `React`,`Express`, `OpenLayers`
- Runtime: `Node.js`
- Database: `Azure Database for PostgreSQL`
- GIS Software: `GeoServer`, `QGIS`
- Deploy: `AWS EC2`, `Asure App Service`
## 📂  Project Structure 

- 현 리포지토리인 프론트엔드에 해당하는 부분만 기술

---
```agsl
src
├─ App.css
├─ App.js
├─ components
│  ├─ constants
│  │  └─ urls.js
│  ├─ HandleCategoryClick.js
│  ├─ images
│  │  └─ icons
│  │     └─ Icon  
│  ├─ MapC.css
│  ├─ MapC.js
│  ├─ MarkerStyle.js
│  ├─ PopupC.js
│  ├─ Search.js
│  ├─ ShowObsOnPath.js
│  └─ utils
│     ├─ crs-filter.js
│     └─ filter-for-node.js
├─ index.css
├─ index.js
├─ reportWebVitals.js
└─ setupTests.js
```

### 📁 public 

---
- 웹 페이지에 쓸 이미지 파일 모아둠
  - *bg_images*(건물)
  - *conv_images*(편의시설)
  - *obs_images*(장애물)
- 웹 페이지가 무겁고 컨텐츠가 느리게 호출되기 때문에 AWS S3에 저장해서 호출하는 것을 권장

### 📁 src

---
- 주요 코드 파일 모아져 있음
- _**App.js**_ : 전체 애플리케이션의 구조를 정의하고, 다른 컴포넌트들을 포함하여 렌더링
- _**App.css**_ : 웹 페이지 화면 전반적인 요소 관련된 css
### 📁 components

---
- **_MapC.js_** : 웹 페이지 오른쪽 화면(지도 부분)과 관련된 모든 기능 처리(의 시작)
- _**MapC.css**_ : App.css에서 안 정의한 나머지 css 요소 (주로 Sarch.js랑 PopupC.js에서 호출)
- _**MarkerStyle.js**_ : 저장된 아이콘 이미지들 변수화 후 마커 스타일 지정하는 함수 정의 모음
- _**PopupC.js**_ : 편의시설이나 장애물 아이콘 클릭 시 뜨는 팝업 및 이에 필요한 정보 처리
- _**HandleCategoryClick.js**_ : 웹 페이지 상에서 *main-left-side*(App.js 참고)에서 장애물 또는 편의시설 중 특정 카테고리 버튼 클릭 시 지도 위에 일괄 표시
- _**Search.js**_ : 입력된 검색어 결과 처리 (경우에 따른 정보 표출 및 검색어 후보 표시)
- _**ShowObsOnPath.js**_ : 검색 결과 경로에 장애물/편의시설 노드 및 링크 아이콘과 함께 범례에 따라 시각화 
- **📁 _constants_**
  - _**urls.js**_ : 백엔드에 해당하는 웹서버와 지오서버 주소 정의
- **📁 _images_**
  - 로고 / 범례 / 이루마커 / 드론지도&일반지도(자체제작 지도) 스위치 버튼 등의 이미지
  - **📁 _icons_**
    - 편의시설 버튼 이루마커 이미지들
    - **📁 _icon_** : 검색 결과로 지도 위에 표시되는 아이콘 이미지들

