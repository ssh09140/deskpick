# 실제 상품 정보 확인 기록

확인일: 2026-10-26 (한국 시간). 공식 IKEA 코리아 상품 페이지의 공개 가격과 **제품 치수**를 사용했습니다. 포장 치수를 사용하지 않습니다. 재고/배송 가능 여부와 할인은 보장하지 않습니다. 판매처 링크에는 제휴 추적을 추가하지 않았습니다.

|상품|상품 코드|가격 (원)|배치 가로 × 깊이 (mm)|근거|
|---|---|---:|---|---|
|ELLOVEN 엘로벤 모니터스탠드 · 화이트|80474783|24,900|470 × 260|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/elloven-monitor-stand-with-drawer-white-80474783/)|
|SUSIG 수시그 코르크 책상패드|30457663|9,900|650 × 450|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/susig-desk-pad-cork-30457663/)|
|DRÖNJÖNS 드뢰니엔스 연필꽂이 · 화이트|80494880|1,700|100 × 100|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/droenjoens-pen-cup-white-80494880/)|
|KLOCKIS 클로키스 탁상시계 · 다크옐로|30559713|4,900|70 × 30|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/klockis-clock-thermometer-alarm-timer-dark-yellow-30559713/)|
|LÅNESPELARE 로네스펠라레 모니터스탠드 · 블랙|80588874|24,900|970 × 190|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/lanespelare-monitor-stand-black-80588874/)|
|RISSLA 리슬라 책상패드 · 블랙|20246157|34,900|860 × 580|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/rissla-desk-pad-black-20246157/)|
|PLÖJA 플뢰야 책상패드 · 화이트/투명|90520893|7,900|650 × 450|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/ploeja-desk-pad-white-transparent-90520893/)|
|DRÖNJÖNS 드뢰니엔스 사무용품 정리대|80428828|19,900|250 × 200|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/droenjoens-desk-organiser-white-80428828/)|
|RISATORP 리사토르프 사무용품 정리대|80542089|19,900|500 × 160|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/risatorp-desk-organiser-white-80542089/)|
|NOJIG 노이그 정리함 · 15 × 20cm|00468106|1,200|150 × 200|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/nojig-organiser-plastic-beige-00468106/)|
|NOJIG 노이그 정리함 · 10 × 20cm|70468080|1,000|100 × 200|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/nojig-organiser-plastic-beige-70468080/)|
|NOJIG 노이그 정리함 · 10 × 10cm|00477040|500|100 × 100|[공식 상품 페이지](https://www.ikea.com/kr/ko/p/nojig-organiser-plastic-beige-00477040/)|

## 치수 해석

- SUSIG/PLÖJA와 LÅNESPELARE는 긴 변을 책상의 가로 방향으로 배치합니다. NOJIG는 표시된 폭 × 깊이 방향을 사용합니다.
- 면적은 제품 외곽을 둘러싼 직사각형입니다. 높이, 하중, 서랍을 여는 여유, 케이블과 손의 움직임은 계산하지 않습니다.
- 기존 예시 상품 12개는 `legacy-products.json`에 그대로 남겨 기존 저장 구성의 ID, 가격과 크기를 보존합니다. 신규 탐색/추가 목록에는 노출하지 않습니다. 기존 구성의 예시 가격은 실제 구매가가 아닙니다.

## 이미지

2026-10-29 사용자 요청으로 공식 상품 페이지의 대표 사진 15개를 로컬에 등록했습니다. 제품 목록과 상세에서는 사진을 표시하고, 시뮬레이터 평면 배치는 DeskPick의 치수 도형을 유지합니다. 사진 출처는 `product-image-sources.json`에 기록했습니다. 공식 출처를 확인한 것이며 재사용 허가를 확인한 것은 아닙니다. 이번 변경은 로컬 적용이며 공개 배포하지 않았습니다.

## 2026-10-29 추가 상품

공식 한국 판매 페이지의 표시 가격과 제품 치수를 확인했습니다. 인기 순위가 아닌 카테고리 보강용 선정이며, 사진은 복제하지 않았습니다.

|상품|가격 (원)|배치 가로 × 깊이 (mm)|출처|
|---|---:|---|---|
|Apple Magic Keyboard (USB-C) · 한국어|139000|278.9 × 114.9|[공식 판매처](https://www.apple.com/kr/shop/product/mxcl3kh/a)|
|Apple Magic Mouse (USB-C) · 화이트|99000|57.1 × 113.5|[공식 판매처](https://www.apple.com/kr/shop/product/mxk53kh/a)|
|NÄVLINGE 네블링에 LED작업등 · 블랙|19900|120 × 120|[공식 판매처](https://www.ikea.com/kr/ko/p/naevlinge-led-work-lamp-black-90404916/)|

Apple 한국 페이지의 ‘세로’는 높이, ‘두께’는 앞뒤 길이로 해석했습니다. cm를 mm로 환산하고 소수점을 보존했습니다. 조명은 받침 외접 사각형만 반영하며 팔·갓·코드 공간은 포함하지 않습니다. 이 한계는 상세 및 시뮬레이터에서 안내합니다.

로지텍 Pebble Keys 2는 공식 한국 페이지에서 가격을 확인하지 못해 이번 등록에서 제외했습니다.

## 2026-11-04 핏쳐 모션데스크

우선 화이트 상판 1400 × 750mm, 화이트 다리 구성 4종을 등록했습니다. 공식몰에서 상판 색상 → 1400mm 옵션을 선택해 다리별 추가금과 재고 표시를 확인했습니다. 표시 판매가에 옵션 추가금을 합산했으며 쿠폰·설치비·추가 상품은 포함하지 않습니다.

|모델|기본 표시가 + 옵션 추가금|등록 가격|공식 상품 페이지|
|---|---:|---:|---|
|M1 PLUS (수동)|199,000 + 20,000|219,000원|[M1 PLUS](https://www.camelmountmall.com/goods/goods_view.php?goodsNo=1000000316)|
|E1 PLUS (전동)|269,000 + 20,000|289,000원|[E1 PLUS](https://www.camelmountmall.com/goods/goods_view.php?goodsNo=1000000290)|
|E2 (전동)|329,000 + 20,000|349,000원|[E2](https://www.camelmountmall.com/goods/goods_view.php?goodsNo=1000000327)|
|B1 3STEP (전동)|409,000 + 100,000|509,000원|[B1](https://www.camelmountmall.com/goods/goods_view.php?goodsNo=1000000356)|

B1은 해당 구성에서 2STEP 다리가 품절로 표시되어 화이트 3STEP을 선택했습니다. E2의 화이트 1200mm도 품절 표시였습니다. 재고는 변동될 수 있습니다. 다른 사이즈·색상·시리즈 전체를 등록한 것은 아닙니다.

상판 치수 근거는 각 공식 상품 상세에 연결된 크기표입니다: [M1 PLUS](https://gi.esmplus.com/camelmount/motion/M1PLUS/SPEC_01.gif), [E1 PLUS](https://gi.esmplus.com/camelmount/motion/E1+/SPEC_01.gif), [E2](https://gi.esmplus.com/camelmount/motion/E2/SPEC_01.gif), [B1 상판](https://gi.esmplus.com/camelmount/motion/B1_2S_3S/SPEC_01.gif). B1의 해당 표에서 상판 치수만 사용했고 2STEP 프레임 높이를 3STEP 사양으로 사용하지 않았습니다.

상품 사진은 복제하지 않았으며 기존 크기 비교 도형으로 표시합니다. 추천 태그는 지정하지 않았습니다. 책상 상세의 버튼은 시뮬레이터 상판 크기만 적용합니다. 기존 배치 제품을 유지하고, 책상을 상판 위의 제품으로 추가하거나 배치 제품 합계에 포함하지 않습니다. 현재 저장 구조는 책상 모델명·가격을 저장하지 않습니다.

### 2026-11-04 사진 추가

사용자 요청에 따라 위 4종에 공식몰 갤러리의 화이트 상판·화이트 다리 사진을 추가했습니다. M1 PLUS, E1 PLUS, E2는 단독 제품 사진, B1은 화이트 구성 연출 사진입니다. 같은 모델의 참고 사진으로 실제 상판 크기와 소품이 등록 옵션과 다를 수 있음을 상세에 안내합니다. 원본 URL과 확인일은 `product-image-sources.json`에 기록했습니다. 공식 출처 확인이며 재사용 허가 확인은 아닙니다.

## 일리안 모니터 받침대 — 2026-11-05 확인

공식몰의 베이직 Medium 싱글·Large 듀얼 기본 상품을 등록했습니다. 추가 모듈·배송비는 표시 가격에 포함하지 않습니다. 사진은 공식 연출 이미지이며 모니터·소품·추가 모듈은 기본 구성과 다를 수 있습니다. 이미지 사용 허락 여부는 별도 확인되지 않았습니다.

- [일리안 베이직 모듈러 모니터 받침대 Medium 싱글 · 블랙](https://ilian.cafe24.com/product/%EC%9D%BC%EB%A6%AC%EC%95%88-%EB%B2%A0%EC%9D%B4%EC%A7%81-%EB%AA%A8%EB%93%88%EB%9F%AC-%EB%AA%A8%EB%8B%88%ED%84%B0-%EB%B0%9B%EC%B9%A8%EB%8C%80-medium-%EC%8B%B1%EA%B8%80/33/category/1/display/2/): 68,000원, 800 × 230mm, 모델 IDM-50(B/W). [공식 치수 안내](https://ilian.cafe24.com/web/upload/NNEditor/20240229/E18482E185A6E1848BE185B5E18487E185A5_MDF_M_15.jpg)

- [일리안 베이직 모듈러 모니터 받침대 Large 듀얼 · 화이트](https://ilian.cafe24.com/product/%EC%9D%BC%EB%A6%AC%EC%95%88-%EB%B2%A0%EC%9D%B4%EC%A7%81-%EB%AA%A8%EB%93%88%EB%9F%AC-%EB%AA%A8%EB%8B%88%ED%84%B0-%EB%B0%9B%EC%B9%A8%EB%8C%80-large-%EB%93%80%EC%96%BC/32/category/1/display/2/): 98,000원, 1180 × 230mm, 모델 IDM-100(B/W). [공식 치수 안내](https://ilian.cafe24.com/web/upload/NNEditor/20240229/E18482E185A6E1848BE185B5E18487E185A5_MDF_L_15.jpg)

## 에디파이어 스피커 — 2026-11-05 확인

가격은 국내 판매처의 쿠폰 적용 전 2개 한 세트 판매가입니다. 사진은 제조사 공식 모델 페이지 대표 이미지이며, 사진 색상으로 등록했습니다. 이미지 사용 허락은 별도로 확인되지 않았습니다.

배치 도구는 한 세트를 하나의 항목으로 취급합니다. 가로는 한 통 폭의 2배, 깊이는 더 깊은 액티브 스피커 기준입니다. 좌우 간격·케이블·후면 여유·별도 스탠드는 포함하지 않습니다.

- **MR3 화이트**: 109,000원 / [판매처](https://www.11st.co.kr/products/7917778656) / [공식 사양·사진](https://www.edifier.com/int/global/p/studio-monitors/mr3). 한 통 125.5(W) × 220(H) × 185(D)mm, 패시브 깊이 176mm.

- **MR4 화이트**: 129,000원 / [판매처](https://www.11st.co.kr/products/7917798836) / [공식 사양·사진](https://www.edifier.com/int/global/p/studio-monitors/mr4). 한 통 140(W) × 228(H) × 197.5(D)mm, 패시브 깊이 184mm.

- **MR5 블랙**: 209,000원 / [판매처](https://item.gmarket.co.kr/Item?goodscode=4726416899) / [공식 사양·사진](https://www.edifier.com/int/global/p/studio-monitors/mr5). 한 통 159(W) × 264(H) × 280(D)mm, 패시브 깊이 257mm.

- **MR4 MKII 블랙**: 199,000원 / [판매처](https://item.gmarket.co.kr/Item?goodsCode=4804302108) / [공식 사양·사진](https://www.edifier.com/int/global/p/studio-monitors/mr4-mkii). 한 통 140(W) × 244(H) × 229(D)mm, 패시브 깊이 208mm.

- **M60 블랙**: 155,000원 / [판매처](https://itempage3.auction.co.kr/DetailView.aspx?itemno=F533755048) / [공식 사양·사진](https://www.edifier.com/int/global/p/computer-speakers/m60). 한 통 100(W) × 168(H) × 147(D)mm, 패시브 깊이 147mm.

- **M90 블랙**: 309,000원 / [판매처](https://itempage3.auction.co.kr/DetailView.aspx?itemno=F533756590) / [공식 사양·사진](https://www.edifier.com/int/global/p/computer-speakers/m90). 한 통 133(W) × 212(H) × 225(D)mm, 패시브 깊이 210mm.

MR4 치수 추가 출처: https://www.edifier.com/s/studio-monitors/mr4

## 버티탭 버티컬 멀티탭 — 2026-11-05 확인

공식몰 상품별 판매가·제원 기준, 2m 단품입니다. 사진은 공식 대표 이미지로 네 가지 색상을 함께 보여 주며, 4개 세트가 아닙니다. 이미지 사용 허락은 별도로 확인되지 않았습니다.

- [Vertical Basic](https://vertitap.com/product/vertical-basic/26/): 27,000원 / 107 × 107 × 110mm / 2m / AC 5구 · USB 없음. 화이트·블랙·핑크·블루 옵션.

- [Vertical Ultra65](https://vertitap.com/product/vertical-ultra65/35/): 49,000원 / 107 × 107 × 110mm / 2m / AC 5구 · USB-A 2개 · USB-C 2개. 화이트·블랙·핑크·블루 옵션.

- [Vertical Ultra100](https://vertitap.com/product/vertical-ultra100/36/): 59,000원 / 107 × 107 × 110mm / 2m / AC 5구 · USB-A 4개 · USB-C 4개. 화이트·블랙·핑크·블루 옵션.

## 모니터 조명 — 2026-11-05 확인

- **벤큐 ScreenBar Pro 모니터 조명 · 블랙**: 219,000원 / [판매처](https://futureterior.com/product/detail.html?cate_no=43&display_group=1&product_no=4979) / [사진 출처](https://www.benq.com/ko-kr/lighting/monitor-light/screenbar-pro.html). 공식 크기 가로 500 × 깊이 135 × 높이 92mm 기준입니다.

- **엘레센스 E1132 2in1 모니터 조명**: 71,900원 / [판매처](https://choetech.kr/?idx=265) / [사진 출처](https://choetech.kr/?idx=265). 판매처 제원은 500 × 85 × 160mm이며 세 축의 방향이 명시되지 않아, 배치 깊이는 두 짧은 변 중 큰 값인 160mm로 보수적으로 표시했습니다. 정확한 설치 깊이는 판매처 확인이 필요합니다.

- 벤큐 공식 치수: https://www.benq.com/ko-kr/lighting/monitor-light/screenbar-pro/spec.html

- 엘레센스 공식몰 제원 이미지: https://cdn.imweb.me/upload/S2020062393cfb7c905bf2/e46f8ecbafd97.jpg

사진 사용 허락은 별도로 확인되지 않았습니다. 모니터 조명은 책상 위 설치 면적이 아닌 평면 크기 비교용으로 표시합니다. 엘레센스 색상명은 판매처에서 명시적으로 확인하지 못해 색상 필터에 임의로 지정하지 않았습니다.
