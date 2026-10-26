import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { availableCategories, categories, products } from '../lib/desk';
import { ProductCard } from '../components/ProductCard';
import { ProductArt } from '../components/ProductArt';

export function Home({ catalogOnly = false }: { catalogOnly?: boolean }) {
  const [params, setParams] = useSearchParams();
  const cat = Number(params.get('category') ?? 0);
  const limit = Number(params.get('price') ?? Infinity);
  const query = params.get('q') ?? '';
  const sort = params.get('sort') ?? 'recommended';
  const [search, setSearch] = useState(query);
  useEffect(() => setSearch(query), [query]);
  function change(key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next, { replace: true }); }
  const list = products.filter(p => (!cat || p.cat === cat) && p.price <= limit && `${p.name} ${p.tag} ${categories[p.cat]}`.includes(query.trim()));
  if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
  return <div className="wrap home-wrap">
    {!catalogOnly && <>
      <section className="hero">
        <img className="hero-photo" src="/images/workspace.jpg" alt="자연광과 초록 식물이 어우러진 밝고 차분한 작업 공간" fetchPriority="high" />
        <div className="hero-copy"><p className="eyebrow">나다운 책상을 발견하는 곳</p><h1>나의 첫 데스크테리어,<br />좋아하는 것부터<br />하나씩.</h1><p>무엇부터 골라야 할지 고민이라면,<br />데스크픽에서 나에게 맞는 제품을 만나보세요.</p><Link className="btn primary" to="/products">제품 둘러보기 <ArrowUpRight size={18} /></Link></div>
        <span className="hero-caption">작은 변화가 만드는, 더 좋은 일상</span>
      </section>
      <section className="section"><div className="section-head"><div><h2>어떤 변화가 필요하세요?</h2><p>내 책상에 필요한 것부터 가볍게 둘러보세요.</p></div><span className="section-index">01 / DISCOVER</span></div><div className="categories">{availableCategories.filter(c => c.id !== 0).map(({ name: category, id: i }) => <Link className="category" key={category} to={`/products?category=${i}`}><div className="category-art"><ProductArt type={['stand', 'keyboard', 'lamp', 'mat', 'organizer', 'clock'][i - 1]} /></div><span>{category}</span></Link>)}</div></section>
      <section className="section recommend"><div className="section-head"><div><p className="eyebrow">처음이라 더 쉽게</p><h2>시작하기 좋은 네 가지</h2><p>작은 변화부터, 나다운 책상을 만들어 보세요.</p></div><Link className="small-link" to="/products">전체 보기 <ArrowUpRight size={15} /></Link></div><div className="grid">{products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} recommended />)}</div></section>
    </>}
    <section className={`section catalog-section ${catalogOnly ? 'catalog-page' : ''}`}>
      <div className="section-head"><div>{catalogOnly && <p className="eyebrow">FIND YOUR DESK ESSENTIALS</p>}{catalogOnly ? <h1>내 취향에 맞는 제품 찾기</h1> : <h2>내 취향에 맞는 제품 찾아보기</h2>}<p>매일 쓰는 물건부터, 오래 좋아할 작은 소품까지.</p></div>{!catalogOnly && <span className="section-index">02 / COLLECTION</span>}</div>
      <div className="catalog-search"><form onSubmit={e => { e.preventDefault(); change('q', search); }}><Search size={18} /><input aria-label="제품 검색" placeholder="찾고 있는 제품이 있나요?" value={search} onChange={e => setSearch(e.target.value)} /><button type="submit">검색</button></form><span><SlidersHorizontal size={15} /> 나에게 맞게 골라보기</span></div>
      <div className="catalog-controls"><div className="chips">{availableCategories.map(({ name: category, id: i }) => <button key={category} className={`chip ${cat === i ? 'on' : ''}`} aria-pressed={cat === i} onClick={() => change('category', i ? String(i) : '')}>{category}</button>)}</div><select aria-label="가격 범위" value={String(limit)} onChange={e => change('price', e.target.value === 'Infinity' ? '' : e.target.value)}><option value="Infinity">모든 가격</option><option value="20000">2만원 이하</option><option value="40000">4만원 이하</option><option value="60000">6만원 이하</option></select></div>
      <div className="results-toolbar"><p className="result-count">총 <strong>{list.length}</strong>개의 제품 <span>· 공식 판매처 확인 가격 · 2026.10.26</span></p><select aria-label="정렬 방식" value={sort} onChange={e => change('sort', e.target.value)}><option value="recommended">추천순</option><option value="price-low">낮은 가격순</option><option value="price-high">높은 가격순</option></select></div>
      <div className="grid">{list.map(p => <ProductCard key={p.id} product={p} />)}{!list.length && <div className="empty-state"><Search size={30} /><h3>조건에 맞는 제품이 없어요.</h3><p>검색어나 가격 범위를 바꿔 보세요.</p><button className="btn" onClick={() => { setParams({}); setSearch(''); }}>필터 초기화 <ArrowRight size={16} /></button></div>}</div>
    </section>
    <section className="promo"><div className="promo-icon"><ProductArt type="stand" /></div><div><p className="eyebrow">A LITTLE PREVIEW, A BETTER CHOICE</p><h2>구매 전, 내 책상에 먼저 놓아보세요.</h2><p>실제 책상 크기에 맞춰 배치하고, 공간의 여유와 총가격을 확인하세요.</p></div><Link className="btn" to="/studio">내 책상 꾸며보기 <ArrowUpRight size={18} /></Link></section>
  </div>;
}
