import React from "react";
import { NotebookPen } from "lucide-react";

// /front-end/src/pages/LandingPage.jsx
// Purpose: Placeholder Landing Page component with implementation plan and TODOs.
// This file will eventually be replaced with the full landing page implementation.
// Keep the component minimal so the app compiles while the design is developed.


/*
Landing Page — Implementation Plan (high-level)

Goal
- Provide a performant, accessible, and responsive landing page that converts visitors:
    hero → product/value → features → social proof → CTA (signup/demo) → footer.

Core Sections
1. Top Navigation
     - Brand/logo (clickable to root)
     - Primary actions: Sign up, Log in, Product (anchor), Docs
     - Mobile: hamburger menu / slide-over or disclosure

2. Hero
     - Prominent headline + short subheadline
     - Primary CTA (Sign up) and secondary CTA (Demo / Learn more)
     - Visual: illustration or screenshot (optimized WebP/AVIF)
     - Consider an optional short animated element (CSS-only where possible)

3. Value / Features
     - 3–5 feature tiles with icons, short text, micro-animations on hover
     - Each tile links to deeper docs or modal details

4. Social Proof / Testimonials
     - Rotating quotes or static logos of customers
     - Lazy-load heavy media

5. How It Works / Steps
     - Short three-step flow with icons

6. Footer
     - Links: Docs, Contact, Privacy, Terms, Socials, Language selector

Data & Interactivity
- Minimal client-side data. For dynamic content (testimonials, stats) fetch from an API endpoint or static JSON.
- Use React state for UI only (menu open, modal). No global state needed initially.
- Signup flows handled by route-linking to /signup or an embedded modal.

Routing & SEO
- Page is publicly routable at "/".
- Server-side/meta: ensure page title, description, OpenGraph meta. Use React Helmet or equivalent.

Accessibility
- Semantic HTML5 landmarks (<header>, <main>, <footer>).
- Keyboard-accessible navigation, focus management for modals/drawers, alt text for images.
- Color contrast checks and ARIA attributes as needed.

Styling & Assets
- Preferred approach: CSS Modules or Tailwind for fast iteration. Keep CSS scoped to components.
- Images: responsive srcset and modern formats; lazy-load non-critical assets.
- Animation: prefer prefers-reduced-motion support.

Performance
- Defer non-critical scripts and third-party embeds.
- Code-split large visual components.
- Optimize images and fonts; use system stack font fallback.

Testing & CI
- Visual regression tests for hero and CTA using Chromatic or Percy.
- Unit tests for interactive pieces (menu, modal) with React Testing Library.
- E2E smoke flow (open page, click CTA) in Playwright.

Analytics & Experiments
- Hook up analytics events for CTA clicks, scroll depth, and signups.
- Consider A/B testing (headline, CTA color) via feature flagging.

File / Component Structure (example)
/src/pages/LandingPage.jsx        <= top-level page (this file)
 /components/Hero.jsx
 /components/FeatureList.jsx
 /components/TestimonialCarousel.jsx
 /components/SiteHeader.jsx
 /components/SiteFooter.jsx
 /styles/landing.module.css

Milestones
- MVP: static hero + features + CTA, responsive and accessible.
- Phase 2: dynamic testimonials, analytics, animations.
- Phase 3: personalization, A/B tests, localization.

Monorepo / Deployment Notes
- Prefetch minimal data for SSR if server-rendered.
- Cache assets on CDN and set proper cache-control for images.

TODO (short)
- [ ] Create SiteHeader and SiteFooter components
- [ ] Implement Hero with primary CTA and image
- [ ] Build FeatureList and wire simple JSON content
- [ ] Add accessibility checks and unit tests
- [ ] Integrate analytics + CI visual tests

*/

export default function LandingPage({ onNavigate }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border">
                <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                    <button
                        className="flex items-center gap-2"
                        onClick={() => onNavigate?.('landing')}
                        aria-label="fieldnotes home"
                    >
                        <div className="flex items-center gap-2">
                            <NotebookPen className="w-[24px] h-[24px] md:w-[30px] md:h-[30px] text-foreground" />
                            <p className="font-['New_Spirit:SemiBold',sans-serif] leading-[normal] text-[22px] md:text-[26px] text-foreground">
                            fieldnotes.
                            </p>
                        </div>
                    </button>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <button className="text-muted-foreground hover:text-foreground" onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop || 0, behavior: 'smooth' })}>Features</button>
                        <button className="text-muted-foreground hover:text-foreground" onClick={() => onNavigate?.('home')}>Demo</button>
                        <button className="text-muted-foreground hover:text-foreground" onClick={() => onNavigate?.('auth')}>Sign in</button>
                        <button className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onNavigate?.('auth')}>Get started</button>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <main>
                <section className="mx-auto max-w-7xl px-6 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                                Save now. Read, watch, & listen later.
                            </h1>
                            <p className="text-muted-foreground text-lg mb-8">
                                Fieldnotes is your focused inbox for articles, videos, and podcasts. Capture links in one place, organize with tags, and come back when you’re ready.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    className="px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={() => onNavigate?.('auth')}
                                >
                                    Create free account
                                </button>
                                <button
                                    className="px-5 py-3 rounded-lg border border-border hover:bg-accent"
                                    onClick={() => onNavigate?.('home')}
                                >
                                    Log In
                                </button>
                            </div>
                            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                                <span>• No credit card required</span>
                                <span>• Private by default</span>
                                <span>• Works on any device</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[16/10] w-full rounded-xl border border-border bg-card shadow-sm" />
                            <p className="mt-3 text-xs text-muted-foreground">Product preview — organize with tags, filter fast, and keep focus.</p>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto max-w-7xl px-6 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-2">Capture everywhere</h3>
                            <p className="text-sm text-muted-foreground">Add links from desktop or mobile. Save articles, videos, and podcasts with one click.</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-2">Organize with tags</h3>
                            <p className="text-sm text-muted-foreground">Create, rename, and manage tags. Find what matters wiht fast filters.</p>
                        </div>
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-2">Focus-friendly reading</h3>
                            <p className="text-sm text-muted-foreground">A calm reader and simple queues help you actually finish your saved content.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} FieldNotes.</span>
                    <div className="flex items-center gap-4">
                        <button className="hover:text-foreground" onClick={() => onNavigate?.('home')}>Demo</button>
                        <button className="hover:text-foreground" onClick={() => onNavigate?.('auth')}>Sign in</button>
                        <a className="hover:text-foreground" href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
                        <a className="hover:text-foreground" href="#" onClick={(e) => e.preventDefault()}>Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}