import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Search, SlidersHorizontal, Ruler, LayoutGrid, Bookmark } from 'lucide-react';
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
  const list = products.filter(p => (!cat || p.cat === cat) && p.price <= limit && `${p.name} ${p.tag} ${categories[p.cat]}`.toLowerCase().includes(query.trim().toLowerCase()));
  if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
  return <>
    {!catalogOnly && <section className="landing-hero">
      <img className="landing-photo" src="/images/deskpick-hero.jpg" alt="원목 책상과 조명, 초록 식물로 꾸민 따뜻한 작업 공간" fetchPriority="high" />
      <div className="wrap landing-inner"><div className="landing-copy"><p className="eyebrow">작은 변화로 시작하는 나다운 공간</p><h1>내 책상에 맞는<br />공간을 만들어보세요<span>.</span></h1><p className="landing-description">좋아하는 제품을 발견하고, 내 책상에 먼저 놓아보세요.<br />나에게 꼭 맞는 데스크테리어의 시작, DeskPick.</p><div className="hero-actions"><Link className="btn primary" to="/studio">내 책상 꾸미기 <ArrowRight size={18} /></Link><Link className="btn" to="/products">제품 둘러보기 <ArrowUpRight size={18} /></Link></div><span className="hero-note">제품 탐색과 배치는 로그인 없이 자유롭게</span></div></div>
    </section>}
    <div className="wrap home-wrap">
      {!catalogOnly && <>
        <section className="section steps-section"><div className="section-head"><div><p className="eyebrow">HOW IT WORKS</p><h2>나만의 책상, 세 단계면 충분해요</h2><p>막연했던 공간을 눈앞에 그려보세요.</p></div><Link className="small-link" to="/guide">사용 가이드 <ArrowRight size={16} /></Link></div>
          <div className="steps-grid">{[{ Icon: Ruler, title: '내 책상 크기를 입력해요', copy: '가로와 깊이를 입력하면 실제 비율의 책상이 준비돼요.' }, { Icon: LayoutGrid, title: '좋아하는 제품을 놓아봐요', copy: '제품의 설치 면적을 비교하고, 원하는 위치로 옮겨보세요.' }, { Icon: Bookmark, title: '마음에 드는 배치를 저장해요', copy: '로그인해 구성을 저장하고, 다음에도 이어서 꾸며보세요.' }].map(({ Icon, title, copy }, i) => <article className="step-card" key={title}><div className="step-top"><span>0{i + 1}</span><Icon size={25} strokeWidth={1.5} /></div><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>
        <section className="section"><div className="section-head"><div><h2>카테고리로 둘러보기</h2><p>내 책상에 필요한 것부터 찾아보세요.</p></div><Link className="small-link" to="/products">전체 보기 <ArrowRight size={16} /></Link></div><div className="categories">{availableCategories.filter(c => c.id !== 0).map(({ name, id }) => <Link className="category" key={id} to={`/products?category=${id}`}><div className="category-art"><ProductArt type={['stand', 'keyboard', 'lamp', 'mat', 'organizer', 'clock'][id - 1]} /></div><span>{name}</span><ArrowUpRight size={15} /></Link>)}</div></section>
        <section className="section recommend"><div className="section-head"><div><h2>지금, 이런 제품은 어떠세요?</h2><p>작은 변화로 더 편안한 책상을 만들어보세요.</p></div><Link className="small-link" to="/products">모든 제품 <ArrowRight size={16} /></Link></div><div className="grid">{products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} recommended />)}</div></section>
      </>}
      {catalogOnly && <section className="section catalog-page">
        <div className="section-head"><div><p className="eyebrow">FIND YOUR DESK ESSENTIALS</p><h1>제품 둘러보기</h1><p>매일 쓰는 물건부터, 오래 좋아할 작은 소품까지.</p></div></div>
        <div className="catalog-search"><form onSubmit={e => { e.preventDefault(); change('q', search); }}><Search size={20} /><input aria-label="제품 검색" placeholder="제품명, 카테고리로 검색해 보세요" value={search} onChange={e => setSearch(e.target.value)} /><button type="submit">검색</button></form></div>
        <div className="catalog-controls"><div className="chips">{availableCategories.map(({ name, id }) => <button key={id} className={`chip ${cat === id ? 'on' : ''}`} aria-pressed={cat === id} onClick={() => change('category', id ? String(id) : '')}>{name}</button>)}</div></div>
        <div className="catalog-layout"><aside className="catalog-sidebar"><h2><SlidersHorizontal size={17} /> 필터</h2><label htmlFor="price-filter">가격대</label><select id="price-filter" value={String(limit)} onChange={e => change('price', e.target.value === 'Infinity' ? '' : e.target.value)}><option value="Infinity">모든 가격</option><option value="20000">2만원 이하</option><option value="40000">4만원 이하</option><option value="60000">6만원 이하</option></select><p>공식 판매처에서 확인한 가격이에요. 최종 가격은 판매처에서 확인해 주세요.</p><button className="text-btn" onClick={() => { setParams({}); setSearch(''); }}>필터 초기화</button></aside>
          <div className="catalog-results"><div className="results-toolbar"><p className="result-count">전체 제품 <strong>{list.length}</strong></p><select aria-label="정렬 방식" value={sort} onChange={e => change('sort', e.target.value)}><option value="recommended">추천순</option><option value="price-low">낮은 가격순</option><option value="price-high">높은 가격순</option></select></div><div className="grid">{list.map(p => <ProductCard key={p.id} product={p} />)}{!list.length && <div className="empty-state"><Search size={40} /><h2>검색 결과가 없어요</h2><p>다른 검색어를 입력하거나 필터를 초기화해 보세요.</p><button className="btn primary" onClick={() => { setParams({}); setSearch(''); }}>필터 초기화</button></div>}</div></div>
        </div>
      </section>}
      <section className="promo"><div><p className="eyebrow">YOUR SPACE, YOUR WAY</p><h2>어울릴까 고민될 땐, 먼저 놓아보세요.</h2><p>내 책상 크기에 맞춰 배치하고, 구성을 하나씩 완성해 보세요.</p></div><Link className="btn" to="/studio">내 책상 꾸미기 <ArrowRight size={18} /></Link></section>
    </div>
  </>;
}
