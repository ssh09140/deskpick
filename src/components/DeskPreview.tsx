import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { placementCenter, productById, unitSize, type DeskSetup } from '../lib/desk';
import './desk-preview.css';
import { Group } from './ModelParts';
import { DeskModel, ProductModel, isClipLight, previewHeight } from './ProductModel';

export function DeskPreview({ setup }: { setup: DeskSetup }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  const [angle, setAngle] = useState(0);
  const [elevation, setElevation] = useState(27);
  useEffect(() => {
    const el = viewport.current!;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const w = setup.desk_width_mm, d = setup.desk_depth_mm;
  const span = Math.hypot(w, d);
  const desk = setup.desk_product_id ? productById.get(setup.desk_product_id) : undefined;
  const above = setup.items.reduce((height, item) => Math.max(height, previewHeight(productById.get(item.product_id)!)), 0);
  const below = desk ? 730 : 24;
  const tilt = elevation * Math.PI / 180;
  const projectedHeight = span * Math.sin(tilt) + (above + below) * Math.cos(tilt);
  const scale = Math.min((width - 24) / span, 315 / projectedHeight);
  const centerOffset = (above - below) * Math.cos(tilt) * scale / 2;
  return <><h2>책상 3D 미리보기</h2>
    <div className="dp-stage" ref={viewport} role="img" aria-label={`내 책상 입체 배치, 제품 ${setup.items.length}개`}>
      <div className="dp-world" style={{transform: `translateY(${centerOffset}px) scale(${scale}) rotateX(${-elevation}deg) rotateY(${angle}deg)`} as CSSProperties}>
        <DeskModel width={w} depth={d} product={desk}/>
        {setup.items.map(item => {
          const center = placementCenter(item), size = unitSize(item), product = productById.get(item.product_id)!;
          return <Group key={item.instance_id} x={center.x - w / 2} z={center.y - d / 2} turn={-(item.rotation ?? 0)}>
            <ProductModel product={product} w={size.w} d={size.d} passive={!!item.passive_of}/>
          </Group>;
        })}
      </div>
    </div>
    <label className="dp-angle">좌우 각도 <input type="range" min="-180" max="180" value={angle} onChange={e => setAngle(Number(e.target.value))}/><output>{angle}°</output></label>
    <label className="dp-angle">상하 각도 <input type="range" min="0" max="90" value={elevation} onChange={e => setElevation(Number(e.target.value))}/><output>{elevation}°</output></label>
    <p className="auth-copy">{desk && <>{desk.name} · </>}{setup.items.length === 0 && '편집 화면에서 책상에 놓을 제품을 추가해 주세요. '}제품의 가로·깊이는 등록 치수를 따르며, 외형과 일부 높이는 근사치예요.{setup.items.some(item => isClipLight(productById.get(item.product_id)!)) && ' 반투명 모니터 윤곽은 조명 장착 예시예요. 화면 상단을 책상에서 42cm 높이로 가정했어요.'}</p>
  </>;
}
