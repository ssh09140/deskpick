export function snapRotation(angle: number) {
  const cardinal = Math.round(angle / 90) * 90;
  return Math.abs(angle - cardinal) <= 4 ? cardinal : angle;
}

export function snapAxis(position: number, length: number, guides: number[], tolerance: number) {
  let closest = Infinity;
  let guide: number | undefined;
  for (const target of guides) {
    for (const offset of [0, length / 2, length]) {
      const distance = target - (position + offset);
      if (Math.abs(distance) <= tolerance && Math.abs(distance) < Math.abs(closest)) {
        closest = distance;
        guide = target;
      }
    }
  }
  return { position: guide === undefined ? position : position + closest, guide };
}
