import { categoryName, subcategoryName, metadata } from '../lib/catalog';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, Check, Plus, ChevronRight } from 'lucide-react';
import { money, newItem, productById, products } from '../lib/desk';
import { ProductArt } from '../components/ProductArt';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context';

export function ProductDetail() {
  const { id } = useParams();
  const product = productById.get(id ?? '');
  const [top, setTop] = useState(false);
  const { setup, setSetup, setSelectedId, notify } = useApp();
  const navigate = useNavigate();
  if (!product) return <div className="empty-state"><h1>찾을 수 없는 제품이에요.</h1><Link className="btn" to="/products">제품 탐색으로 돌아가기</Link></div>;
  const p = product;
  function add() {
    const item = newItem(p, setup);
    setSetup(s => ({ ...s, items: [...s.items, item] })); setSelectedId(item.instance_id); navigate('/studio'); notify('책상에 제품을 추가했어요. 드래그해 위치를 바꿔 보세요.');
  }
  return <div className="wrap detail-wrap">
    <div className="breadcrumbs"><Link to="/">홈</Link><ChevronRight size={12} /><Link to="/products">제품 탐색</Link><ChevronRight size={12} /><Link to={`/products?category=${metadata(p).category}`}>{categoryName(p)}</Link></div>
    <section className="detail"><div><div className="gallery-main">{top ? <div className="top-gallery" style={{ aspectRatio: `${p.w}/${p.d}` }}><ProductArt product={p} top /></div> : <ProductArt product={p} />}<span className="badge">{p.sample ? '기존 예시 제품' : !top && p.image_url ? '제품 사진' : '배치용 도형'}</span></div><div className="thumbnails"><button className={`thumb ${!top ? 'active' : ''}`} aria-label={p.image_url ? "제품 사진 보기" : "제품 일러스트 보기"} aria-pressed={!top} onClick={() => setTop(false)}><ProductArt product={p} /></button><button className={`thumb ${top ? 'active' : ''}`} aria-label="위에서 본 설치 면적 보기" aria-pressed={top} onClick={() => setTop(true)}><ProductArt product={p} top /></button></div><p className="view-note">{top ? `위에서 본 설치 면적 · ${p.w} × ${p.d} mm` : p.sample ? '기존에 저장한 예시 상품입니다.' : p.image_url ? `사진 출처: ${p.image_source}` : '크기 비교용 도형입니다. 실물 디자인·사진은 판매처에서 확인하세요.'}</p></div>
      <div className="detail-info"><p className="eyebrow">{categoryName(p)}</p><h1>{p.name}</h1><div className="price">{money(p.price)}</div><p className="sample">{p.sample ? '예시 가격 · 구매할 수 없는 예시 상품입니다.' : `${p.price_checked_at} 확인 가격 · 배송비·할인 제외`}</p><p className="description">{p.desc}</p><div className="feature-list"><div><Check size={15} />{p.tag}</div><div><Check size={15} />설치 면적 · 가로 {p.w} × 깊이 {p.d} mm</div><div><Check size={15} />{p.sample ? '기존 예시 상품' : '공식 판매처의 상품 정보 기준'}</div></div><div className="recommend-box"><strong>이런 분께 추천해요</strong><p>{p.why}</p></div><div className="actions"><button className="btn primary" onClick={add}>내 책상에 배치해보기 <Plus size={18} /></button>{p.seller_url ? <a className="btn" href={p.seller_url} target="_blank" rel="noopener noreferrer">판매처에서 상품 확인하기 <ArrowUpRight size={17} /></a> : <button className="btn" disabled>판매처 연결 준비 중 <ArrowUpRight size={17} /></button>}</div><div className="seller-info"><strong>{p.sample ? '기존 예시 상품을 유지하고 있어요.' : `${p.seller_name}에서 확인한 제품이에요.`}</strong><p>{p.sample ? '저장한 배치 보존을 위한 상품입니다. 제품 탐색에서 실제 상품을 새로 추가할 수 있어요.' : '최종 가격·재고·배송비와 실제 디자인은 판매처에서 확인해 주세요. 구매는 판매처에서 진행하며, DeskPick은 판매자가 아닙니다.'}</p></div></div>
    </section>
    <section className="specs"><div><h2>제품 정보</h2>{[['제품명', p.name], ['카테고리', `${categoryName(p)} / ${subcategoryName(p)}`], ['설치 면적 (가로 × 깊이)', `${p.w} × ${p.d} mm`], ['제품 코드', p.manufacturer_code ?? p.id], ['정보 기준', p.sample ? '목업 예시 데이터' : `${p.seller_name} · ${p.price_checked_at}`]].map(([key, value]) => <div className="spec-row" key={key}><span>{key}</span><span>{value}</span></div>)}</div><div><h2>처음 구매한다면, 확인해 주세요</h2>{p.dimension_note && <p>{p.dimension_note}</p>}<p>설치할 공간을 먼저 측정해 보세요. 제품 크기 외에도 손을 움직일 공간과 케이블이 지나갈 여유가 필요해요.</p><p>색상, 소재, 호환성, 전원 방식은 판매처의 실제 상품 설명을 확인해 주세요. 데스크 배치는 평면 크기를 비교하는 참고용 도구입니다.</p></div></section>
    <section className="section related-products"><div className="section-head"><div><h2>함께 둘러보면 좋은 제품</h2><p>나만의 책상을 조금씩 완성해 보세요.</p></div><Link className="small-link" to="/products">제품 더 보기 <ArrowUpRight size={15} /></Link></div><div className="grid">{products.filter(x => x.id !== p.id).slice(0, 4).map(x => <ProductCard key={x.id} product={x} />)}</div></section>
  </div>;
}
