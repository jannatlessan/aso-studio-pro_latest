import { Helmet } from 'react-helmet-async';

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
  image = 'https://shaaddev.studio/og-image.jpg',
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

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "url": resolvedUrl,
    "description": description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
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