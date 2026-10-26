import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categories, money, type Product } from '../lib/desk';
import { ProductArt } from './ProductArt';
export function ProductCard({ product: p, recommended = false }: { product: Product; recommended?: boolean }) {
  return <Link className="product" to={`/products/${p.id}`}>
    <div className="product-art">{recommended && <span className="badge">입문자 추천</span>}<ProductArt product={p} /><span className="card-arrow"><ArrowUpRight size={19} /></span></div>
    <p className="art-caption">배치용 도형 · 실물 사진은 판매처에서</p><p className="product-cat">{categories[p.cat]}</p><h3>{p.name}</h3><div className="price">{money(p.price)}</div><div className="reason">{p.tag}</div>
  </Link>;
}
