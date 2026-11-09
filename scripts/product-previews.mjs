import { mkdir, readFile, writeFile } from 'node:fs/promises';

const template = await readFile('dist/index.html', 'utf8');
const products = JSON.parse(await readFile('src/data/products.json', 'utf8'));
const origin = 'https://deskpick.pages.dev';

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

await mkdir('dist/products', { recursive: true });
for (const product of products) {
  const values = {
    title: product.name + ' · DeskPick',
    description: product.desc,
    image: new URL(product.image_url || '/images/deskpick-hero.jpg', origin).href,
  };
  const html = template.replace(
    /(<meta property="og:(title|description|image)" content=")[^"]*/g,
    (_, prefix, key) => prefix + escapeHtml(values[key]),
  );
  await writeFile('dist/products/' + product.id + '.html', html);
}
