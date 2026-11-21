import { Link, Navigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Nav from '../components/Nav';
import { CATALOG } from '../components/AppFacts';
import profileData from '../data/hireProfile.json';
import {
  HIRE_META, HIRE_PATH, servicePath, getService, casesFor, fill, hireFaq, hireJsonLd,
  serviceFaq, serviceTitle, serviceDescription, serviceJsonLd
} from '../lib/hirePages.js';

// /hire and /services/:service. scripts/prerender-hire.mjs writes the same content into static
// HTML for crawlers that do not run JavaScript. Facts: src/data/hireProfile.json.

type Case = { name: string; kind: string; what: string; page: string; links: { label: string; url: string }[] };
type Service = (typeof profileData.services)[number];
const profile = profileData;

const shell = 'min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20';
const mainCls = 'relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pt-32 pb-20 space-y-6 text-white/70 leading-relaxed';
const h2 = 'text-2xl font-bold tracking-tight text-white pt-6';
const link = 'text-primary underline';
const isExt = (u: string) => /^https?:/.test(u) && !u.startsWith('https://shaaddev.studio');
const toInternal = (u: string) => u.replace('https://shaaddev.studio', '');

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return isExt(href)
    ? <a className={link} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    : <Link className={link} to={toInternal(href) || '/'}>{children}</Link>;
}

function CaseList({ cases }: { cases: Case[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2">
      {cases.map((c) => (
        <li key={c.name}>
          <strong className="text-white"><A href={c.page}>{c.name}</A></strong> ({c.kind}): {c.what}
          {c.links.length > 0 && c.links[0].url !== c.page && (
            <> {c.links.map((l, i) => <span key={l.url}>{i > 0 && ' · '}<A href={l.url}>{l.label}</A></span>)}</>
          )}
        </li>
      ))}
    </ul>
  );
}

function Contact() {
  const c = profile.contact;
  return (
    <section>
      <h2 className={h2}>How to contact</h2>
      <p className="mt-3">{c.note} Replies {c.replyTime}.</p>
      <ul className="list-disc pl-5 space-y-1 mt-3">
        <li><Link className={link} to="/contact">Contact page (form)</Link></li>
        <li>Email: <a className={link} href={`mailto:${c.email}`}>{c.email}</a></li>
        <li>WhatsApp: <a className={link} href={c.whatsapp} target="_blank" rel="noopener noreferrer">chat on WhatsApp</a></li>
      </ul>
    </section>
  );
}

function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section>
      <h2 className={h2}>Common questions</h2>
      {items.map((f) => (
        <div key={f.q} className="mt-4">
          <h3 className="text-lg font-semibold text-white">{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </section>
  );
}

function HowIWork() {
  return (
    <section>
      <h2 className={h2}>How he works</h2>
      <ul className="list-disc pl-5 space-y-1 mt-3">{profile.howIWork.map((x) => <li key={x}>{x}</li>)}</ul>
    </section>
  );
}

export default function Hire() {
  const p = profile.person;
  const allCases = [...new Map(profile.services.flatMap((s) => casesFor(s, profile, CATALOG) as Case[]).map((c) => [c.name, c])).values()];
  return (
    <div className={shell}>
      <SEO title={HIRE_META.title} description={HIRE_META.description} url={`https://shaaddev.studio${HIRE_PATH}`} type="profile" schema={hireJsonLd(profile, CATALOG)} />
      <Nav />
      <main className={mainCls}>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">{HIRE_META.h1}</h1>
        <p><strong className="text-white">{p.headline}.</strong> {p.summary} {p.status}.</p>
        <dl className="grid sm:grid-cols-[9rem_1fr] gap-x-4 gap-y-2">
          <dt className="font-semibold text-white">Who</dt><dd>{p.name}, {p.jobTitle} at ShaadDev Studio. {p.experienceYears} years of production mobile and web work.</dd>
          <dt className="font-semibold text-white">Where</dt><dd>{p.location}.</dd>
          <dt className="font-semibold text-white">Proof</dt><dd><Link className={link} to="/apps">{CATALOG.apps.length} live Android and iPhone apps</Link>, live client web apps and <Link className={link} to="/tools">free browser tools</Link> built by him (links below).</dd>
          <dt className="font-semibold text-white">Profiles</dt><dd>{p.sameAs.map((u, i) => <span key={u}>{i > 0 && ' · '}<A href={u}>{u.includes('github') ? 'GitHub' : 'LinkedIn'}</A></span>)}</dd>
          <dt className="font-semibold text-white">Pricing</dt><dd>No published prices: you get a quote for your project after a short scope review.</dd>
        </dl>
        <section>
          <h2 className={h2}>Services</h2>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            {profile.services.map((s) => <li key={s.slug}><Link className={link} to={servicePath(s.slug)}>{s.name}</Link>: {fill(s.answer, CATALOG)}</li>)}
          </ul>
        </section>
        <section>
          <h2 className={h2}>Selected work you can check</h2>
          <div className="mt-3"><CaseList cases={allCases} /></div>
          <p className="mt-3">All studio apps: <Link className={link} to="/apps">shaaddev.studio/apps</Link>.</p>
        </section>
        <HowIWork />
        <section>
          <h2 className={h2}>Experience</h2>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            {p.experience.map((e) => <li key={e.org}><strong className="text-white">{e.role}</strong>, {e.org} ({e.period}): {e.what}</li>)}
          </ul>
          <p className="mt-3">Education: {p.education.degree}, {p.education.school} ({p.education.period}).</p>
          <p className="mt-3">Skills: {p.knowsAbout.join(', ')}.</p>
        </section>
        <Contact />
        <Faq items={hireFaq(profile, CATALOG)} />
        <p className="text-xs">Facts on this page are taken from this site's portfolio and the live store listings, checked {profile.checked}.</p>
      </main>
      <Footer />
    </div>
  );
}

export function ServicePage() {
  const { service } = useParams<{ service: string }>();
  const s = getService(profile, service) as Service | undefined;
  if (!s) return <Navigate to={HIRE_PATH} replace />;
  const others = profile.services.filter((o) => o.slug !== s.slug);
  return (
    <div className={shell}>
      <SEO title={serviceTitle(s)} description={serviceDescription(s, CATALOG)} url={`https://shaaddev.studio${servicePath(s.slug)}`} schema={serviceJsonLd(s, profile, CATALOG)} />
      <Nav />
      <main className={mainCls}>
        <p className="text-xs"><Link className="underline" to={HIRE_PATH}>Hire Rizwan Rasheed</Link></p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">{s.name}</h1>
        <p><strong className="text-white">{s.question}</strong> {fill(s.answer, CATALOG)}</p>
        <section>
          <h2 className={h2}>What is included</h2>
          <ul className="list-disc pl-5 space-y-1 mt-3">{s.includes.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="mt-3">Stack: {s.stack.join(', ')}.</p>
        </section>
        <section>
          <h2 className={h2}>Case studies: live work</h2>
          <div className="mt-3"><CaseList cases={casesFor(s, profile, CATALOG) as Case[]} /></div>
        </section>
        <HowIWork />
        <Contact />
        <Faq items={serviceFaq(s, CATALOG)} />
        <section>
          <h2 className={h2}>Other services</h2>
          <ul className="list-disc pl-5 space-y-1 mt-3">{others.map((o) => <li key={o.slug}><Link className={link} to={servicePath(o.slug)}>{o.name}</Link></li>)}</ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
