import { Link } from 'react-router-dom';
import { ArrowRight, Ruler, LayoutGrid, Bookmark } from 'lucide-react';
import { ProductArt } from '../components/ProductArt';

export function Guide() {
  return <div className="wrap guide-page"><div className="page-intro"><p className="eyebrow">A SMALL GUIDE TO YOUR SPACE</p><h1>내 책상 꾸미기,<br />이렇게 시작하세요.</h1><p>책상 크기를 입력하고, 좋아하는 제품을 배치해 보세요.<br />간단한 세 단계로 내 공간에 맞는 구성을 찾을 수 있어요.</p></div>
    <div className="guide-steps">
      <section className="guide-step"><div><span className="step-number">01</span><Ruler size={28} /><h2>책상 크기 입력하기</h2><p>상판의 가로와 깊이를 측정해 입력하세요. 입력 단위는 mm이며, 120cm는 1200mm예요.</p><p>제품은 실제 설치 면적에 맞는 비율로 표시됩니다.</p></div><div className="guide-diagram"><span>가로 1200 mm</span><div className="guide-desk"><span>깊이 600 mm</span></div></div></section>
      <section className="guide-step"><div><span className="step-number">02</span><LayoutGrid size={28} /><h2>좋아하는 제품 추가하기</h2><p>제품 상세에서 ‘내 책상에 배치해보기’를 누르거나, 꾸미기 화면의 ‘제품 추가’에서 골라보세요.</p><p>같은 제품도 여러 개 배치할 수 있어요.</p></div><div className="guide-products">{['stand', 'lamp'].map(type => <div key={type}><ProductArt type={type} /></div>)}</div></section>
      <section className="guide-step"><div><span className="step-number">03</span><Bookmark size={28} /><h2>배치하고 저장하기</h2><p>제품을 드래그하거나 위치 값을 입력해 옮겨보세요. 마음에 드는 배치는 로그인 후 저장할 수 있어요.</p><p>계정당 하나의 구성을 저장하고, 다음에도 불러와 이어서 꾸밀 수 있어요.</p></div><div className="guide-preview"><div className="guide-desk"><ProductArt type="stand" top /></div><span>나만의 책상, 다음에도 그대로</span></div></section>
    </div>
    <section className="guide-faq"><h2>자주 묻는 질문</h2>{[
      ['로그인 없이도 사용할 수 있나요?', '제품 탐색과 책상 배치는 로그인 없이 이용할 수 있어요. 계정에 저장하거나 저장한 구성을 불러올 때만 로그인이 필요해요.'],
      ['배치한 모습이 실제와 똑같나요?', '위에서 본 설치 면적을 비교하는 참고용 도구예요. 제품 높이, 물체 간 겹침, 케이블 공간, 실제 디자인은 별도로 확인해 주세요.'],
      ['저장한 책상은 어디서 볼 수 있나요?', '마이페이지나 책상 꾸미기의 ‘저장한 구성’에서 확인할 수 있어요. 불러오면 현재 편집 중인 배치가 바뀌므로 먼저 저장 여부를 확인해 주세요.'],
      ['제품을 여기서 구매할 수 있나요?', '제품 상세의 판매처 링크에서 구매할 수 있어요. 최종 가격·재고·배송 정보는 판매처에서 확인해 주세요.']
    ].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
    <section className="promo"><div><h2>이제, 내 책상을 만들어볼까요?</h2><p>좋아하는 것들을 하나씩 놓아보세요.</p></div><Link className="btn" to="/studio">책상 꾸미기 시작 <ArrowRight size={18} /></Link></section>
  </div>;
}
