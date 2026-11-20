import { Helmet } from 'react-helmet-async';
import { TOOL_DOCS } from './ToolFacts';

interface SEOProps {
  title: string;
  description: string;
  type?: string;
  name?: string;
  url?: string;
  image?: string;
  keywords?: string;
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  type = 'website',
  name = 'ShaadDev Studio',
  url,
  image = 'https://shaaddev.studio/og-image.jpg?v=1',
  keywords = 'developer tools, web apps, productivity',
  noindex = false
}: SEOProps) {
  // Fall back to the page's actual current URL rather than the homepage,
  // so a page that forgets to pass `url` never emits a wrong canonical.
  const resolvedUrl = url || (typeof window !== 'undefined'
    ? `https://shaaddev.studio${window.location.pathname}`
    : 'https://shaaddev.studio');
  const isTool = resolvedUrl.includes('/tools/');

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ShaadDev Studio",
    "url": "https://shaaddev.studio",
    "description": "Premium developer tools and web applications."
  };

  // Tool pages: WebApplication + Organization (+ FAQPage when the page has no FAQ microdata
  // of its own). Built from src/data/toolDocs.json, the same data scripts/prerender-tools.mjs
  // writes into the static HTML, so both always agree with the visible "Quick facts" section.
  const toolPath = resolvedUrl.replace('https://shaaddev.studio', '').replace(/\/$/, '');
  const doc = TOOL_DOCS[toolPath];
  const orgNode = {
    "@type": "Organization",
    "@id": "https://shaaddev.studio/#organization",
    "name": "ShaadDev Studio",
    "url": "https://shaaddev.studio",
    "logo": "https://shaaddev.studio/og-image.jpg"
  };
  const toolSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${resolvedUrl}#app`,
        "name": title.split(' | ')[0],
        "url": resolvedUrl,
        "description": description,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (modern web browser)",
        "browserRequirements": "Requires JavaScript",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "publisher": { "@id": "https://shaaddev.studio/#organization" }
      },
      orgNode,
      ...(doc && !doc.pageHasFaqMicrodata ? [{
        "@type": "FAQPage",
        "@id": `${resolvedUrl}#faq`,
        "mainEntity": doc.faq.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      }] : [])
    ]
  };

  const schemaObj = isTool ? toolSchema : defaultSchema;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:image" content={image} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content="@ShaadDev" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO settings */}
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={resolvedUrl} />

      {/* JSON-LD Structured Data Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaObj)}
      </script>
    </Helmet>
  );
}