import { GetServerSideProps } from "next";

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://3dconnect4.berzkalns.com/</loc>
      <lastmod>2024-01-21</lastmod>
    </url>
  </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = (ctx) => {
  const res = ctx.res;
  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap();

  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return Promise.resolve({
    props: {},
  });
};

export default SiteMap;
