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
