import type { ReactNode } from 'react';
import type { Product } from '../lib/desk';
import { Group, Solid, Face } from './ModelParts';

type Palette = [string, string, string];
const dark: Palette = ['#35373a', '#292b2d', '#484b4c'];
const white: Palette = ['#eceae3', '#cecac0', '#faf8f1'];
const silver: Palette = ['#a2a5a6', '#858989', '#c6c8c8'];
const heights: Record<string, number> = {
  'edifier-mr3':220, 'edifier-mr4':228, 'edifier-mr5':264, 'edifier-mr4-mkii':244, 'edifier-m60':168, 'edifier-m90':212,
  'benq-screenbar-pro':92, 'benq-screenbar-halo':97, 'benq-screenbar-halo-2':109, 'elesense-e1132':85, 'benq-screenbar-max':755,
  'caldigit-ts4':141, 'caldigit-ts5-plus':155, 'divoom-ditoo-pro':121.2, 'divoom-minitoo':75, 'divoom-times-gate':97,
  'novium-hoverpen-interstellar-black':158,
};
const familyHeights: Record<string, number> = { stand:110, 'power-strip':110, keyboard:35, mouse:42, mat:3, 'cable-organizer':11 };
export const modelHeight = (p: Product) => heights[p.id] ?? familyHeights[p.type] ?? 10;

export const isClipLight = (p: Product) => p.type === 'monitor-light' && p.id !== 'benq-screenbar-max';
const screenTop = 420;
const clipOverhang = 26;
export const previewHeight = (p: Product) => isClipLight(p) ? screenTop + clipOverhang : modelHeight(p);

type PartProps = { w:number; h:number; d:number; x?:number; z?:number; base?:number; colors?:Palette; top?:ReactNode; front?:ReactNode };
function Part({ x=0, z=0, base=0, colors=dark, h, ...faces }: PartProps) {
  return <Group x={x} y={-base-h/2} z={z}><Solid h={h} colors={colors} {...faces}/></Group>;
}

export function DeskModel({ width:w, depth:d, product }: { width:number; depth:number; product?:Product }) {
  const oak: Palette = ['#b9926b','#a9805b','#e3c8a4'];
  const fixed = product?.id.startsWith('desker-computer');
  return <>
    <Part w={w} d={d} h={24} base={-24} colors={product ? white : oak}/>
    {product && [-1,1].map(sign => <Group key={sign} x={sign*w*.42}>
      {fixed ? [-1,1].map(end => <Part key={end} w={35} d={35} h={706} base={-730} z={end*d*.41} colors={white}/>) :
        <><Part w={80} d={78} h={410} base={-706} colors={white}/><Part w={65} d={62} h={280} base={-300} colors={white}/><Part w={88} d={d*.83} h={24} base={-730} colors={white}/></>}
    </Group>)}
    {product?.id.startsWith('fiture-m1') && <Part w={28} d={135} h={18} base={-48} x={w*.45} z={d*.36}/>}
    {fixed && <Part w={w*.72} d={95} h={56} base={-88} z={-d*.35} colors={white}/>}
  </>;
}

function Keyboard({ p, w, d }: { p:Product; w:number; d:number }) {
  const compact = p.id === 'aula-f87-pro', blue = p.id === 'preflow-ak68', pink = p.id === 'aula-f99';
  const colors = compact ? dark : white;
  const keys = Array.from({ length:6 }, (_,row) => <div key={row} className="dp-keyrow">
    {Array.from({length:row === 5 ? 9 : 15}, (_,col) => <i key={col} style={{
      flex: row === 5 && col === 3 ? 5 : 1,
      background: row === 0 || col === 0 || col >= 13 ? (compact ? '#516177' : blue ? '#c1d3e7' : pink ? '#cbabab' : '#b6dbd9') : '#e9e9e4'
    }}/>)}
  </div>);
  return <Part w={w} d={d} h={modelHeight(p)} colors={colors} top={<div className="dp-keys">{keys}<div className="dp-extra-keys" style={{width:compact?'15%':'22%'}}>
    {p.id.startsWith('preflow') && <b>{blue ? '●　●' : '▣　●'}</b>}
    {Array.from({length:compact ? 9 : 20}, (_,i) => <i key={i}/>)}</div></div>}/>;
}

function Mouse({ p,w,d }: { p:Product;w:number;d:number }) {
  const mx = p.id.includes('master'), layers = 12, h = modelHeight(p);
  // Elliptical cross sections taper toward the crown; the MX thumb shelf flares at its base.
  return <>{Array.from({length:layers}, (_,i) => {
    const t = i / layers, radius = Math.sqrt(1-t*t);
    const width = w*radius*(mx ? 1-.23*t : 1);
    return <Group key={i} x={mx ? w*.095*t : 0} y={-(i+.5)*h/layers} z={d*.07*t}>
      <Face w={width} h={d*radius} color="transparent" pose="rotateX(90deg)"><div className="dp-mouse-slice" style={{background:`hsl(200 4% ${20+12*t}%)`}}/></Face>
    </Group>;
  })}<Group y={-h*.88} z={-d*.23}><Part w={w*.1} d={d*.17} h={5} colors={silver}/></Group></>;
}

function Light({ p,w,d,h }: {p:Product;w:number;d:number;h:number}) {
  const tall = p.id === 'benq-screenbar-max';
  const r = tall ? 15 : 12;
  const front = d/2-r;
  const lift = tall ? 0 : screenTop + clipOverhang - h;
  return <>
    {!tall && <Group y={-screenTop + 155}><Face w={552} h={310} color="transparent" pose="rotateY(0deg)"><div className="dp-screen-guide"/></Face>
      <Face w={552} h={310} color="transparent" pose="rotateY(180deg)"><div className="dp-screen-guide"/></Face></Group>}
    <Group y={-lift}>
    <Part w={tall ? 35 : 48} d={tall ? 42 : 34} h={h-r*2} z={-d/2+(tall ? 21 : 17)}/>
    <Part w={tall ? 22 : 46} d={d-r} h={17} base={h-26} z={-r/2}/>
    <Group y={-h+r} z={front}>
      {Array.from({length:16}, (_,i) => <Face key={i} w={w} h={r*.405} color={i===14 ? '#ffe9ac' : `hsl(250 4% ${22+9*Math.sin(i*Math.PI/8)}%)`} pose={`rotateX(${i*22.5}deg) translateZ(${r*.98}px)`}/>)}
      {[-1,1].map(sign => <div key={sign} className="dp-cap" style={{width:r*2,height:r*2,left:-r,top:-r,transform:`translateX(${sign*w/2}px) rotateY(${sign*90}deg)`}}/>)}
    </Group>
    </Group>
  </>;
}

function PixelScreen({clock=false}: {clock?:boolean}) {
  return <div className={'dp-pixels'+(clock?' dp-clock':'')}>{clock ? ['1','0',':','2','4'].map((c,i)=><b key={i}>{c}</b>) : <b>♥</b>}</div>;
}

export function ProductModel({product:p,w,d,passive}: {product:Product;w:number;d:number;passive:boolean}) {
  const h = modelHeight(p);
  switch (p.type) {
    case 'speaker': {
      const light = ['edifier-mr3','edifier-mr4'].includes(p.id);
      const copper = ['edifier-mr3','edifier-mr5','edifier-mr4-mkii'].includes(p.id);
      return <Part w={w} h={h} d={d} colors={light ? white : dark} front={<div className="dp-baffle" style={{background:light ? undefined : '#303235'}}>
        <i className="dp-tweeter" style={{background:light ? undefined : 'radial-gradient(circle,#090909 18%,#424548 24%,#303235 64%)'}}/>
        <i className="dp-woofer" style={{background:copper ? 'radial-gradient(circle at 45% 43%,#583421,#cf9374 35%,#493527 56%,#17191b 64%)' : undefined}}/>
        <small>EDIFIER</small>{!passive && p.id.startsWith('edifier-mr') && <><i className="dp-ports"/><i className="dp-dial"/></>}</div>}/>;
    }
    case 'monitor-light': return <Light p={p} w={w} d={d} h={h}/>;
    case 'keyboard': return <Keyboard p={p} w={w} d={d}/>;
    case 'mouse': return <Mouse p={p} w={w} d={d}/>;
    case 'stand': {
      const colors = p.id.includes('white') ? white : dark;
      return <><Part w={w} h={12} d={d} base={h-12} colors={colors}/>{[-1,1].map(sign=><Part key={sign} x={sign*w*.4} w={12} d={d*.85} h={h-12} colors={colors}/>)}</>;
    }
    case 'mat': return <Part w={w} d={d} h={h} colors={p.id.includes('ivory') ? ['#d7c3a5','#c8b699','#e8dcc9'] : dark} top={<div className="dp-weave"/>}/>;
    case 'power-strip': {
      const ports = p.id.endsWith('100') ? 8 : p.id.endsWith('65') ? 4 : 0;
      const outlet = <div className="dp-outlet">•　•</div>;
      return <><Part w={w} d={d} h={27} colors={white} front={<div className="dp-usb">{Array.from({length:ports},(_,i)=><i key={i}/>)}</div>}/>
        <Part w={w*.88} d={d*.88} h={h-27} base={27} colors={white} top={outlet} front={outlet}/></>;
    }
    case 'hub': return <Part w={w} d={d} h={h} colors={p.id.endsWith('ts4') ? silver : dark} top={<div className="dp-fins"/>} front={<div className="dp-hub"><b>CalDigit</b><i/><i/><i/><i/></div>}/>;
    case 'cable-organizer': return <>{Array.from({length:6},(_,i)=><Part key={i} x={(i-2.5)*w/6} w={w/6-.5} d={d} h={h} colors={white} top={<div className="dp-slot"/>}/>)}</>;
    case 'clock': return <Part w={w} d={d} h={h} colors={silver} front={<PixelScreen clock/>}/>;
    case 'decoration':
      if (p.id.startsWith('novium')) return <><Part w={w} d={d} h={7}/><Group y={-24}><div className="dp-ring"/></Group><Group y={-83}><div className="dp-pen"/></Group></>;
      return <><Part w={w} d={d} h={h*.26} colors={white} top={<div className="dp-mini-keys"/>}/>
        <Part w={w*.65} d={d*.55} h={h*.17} base={h*.26} z={-d*.12} colors={dark}/>
        <Part w={w} d={d*.72} h={h*.57} base={h*.43} z={-d*.14} colors={['#d7afb2','#bd9898','#e7ced0']} front={<PixelScreen/>}/></>;
    default: return <Part w={w} d={d} h={h} colors={silver} top={<span className="dp-marker">{p.name}</span>}/>;
  }
}
