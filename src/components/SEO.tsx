import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  type?: string;
  name?: string;
  url?: string;
  image?: string;
}

export default function SEO({ title, description, type = 'website', name = 'ShaadDev Studio', url = 'https://shaaddev.studio', image = 'https://shaaddev.studio/og-image.jpg' }: SEOProps) {
  const isTool = url.includes('/tools/');

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
    "url": url,
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
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content="@ShaadDev" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO settings */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={url} />

      {/* JSON-LD Structured Data Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaObj)}
      </script>
    </Helmet>
  );
}