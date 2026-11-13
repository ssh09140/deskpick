import type { ReactNode } from 'react';

// Coordinates use millimetres, with positive Z pointing toward the front of the desk.
export function Group({ x = 0, y = 0, z = 0, turn = 0, children }: { x?: number; y?: number; z?: number; turn?: number; children: ReactNode }) {
  return <div className="dp-group" style={{ transform: `translate3d(${x}px,${y}px,${z}px) rotateY(${turn}deg)` }}>{children}</div>;
}

export function Face({ w, h, pose, color, children }: { w: number; h: number; pose: string; color: string; children?: ReactNode }) {
  return <div className="dp-face" style={{ width: w, height: h, left: -w / 2, top: -h / 2, background: color, transform: pose }}>{children}</div>;
}

export function Solid({ w, h, d, colors, front, top }: { w: number; h: number; d: number; colors: [string, string, string]; front?: ReactNode; top?: ReactNode }) {
  return <>
    <Face w={w} h={h} color={colors[0]} pose={`translateZ(${d / 2}px)`}>{front}</Face>
    <Face w={w} h={h} color={colors[1]} pose={`rotateY(180deg) translateZ(${d / 2}px)`}/>
    {[-90, 90].map(a => <Face key={a} w={d} h={h} color={colors[1]} pose={`rotateY(${a}deg) translateZ(${w / 2}px)`}/>)}
    <Face w={w} h={d} color={colors[2]} pose={`rotateX(90deg) translateZ(${h / 2}px)`}>{top}</Face>
    <Face w={w} h={d} color={colors[1]} pose={`rotateX(-90deg) translateZ(${h / 2}px)`}/>
  </>;
}

