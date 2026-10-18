import { useEffect, useState, type ReactNode } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router"
import { ArrowRight, ArrowUpRight, Globe2, Mail, MapPin, Menu, Phone, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import logo from "../assets/lyca-logo.png"
import { categories, offices } from "./data"
import { ScrollExperience, ScrollProgress, ScrollReveals } from "./motion"

export function Logo({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`brand ${light ? "brand--light" : ""}`} aria-label="LYCA Food Ingredients Supplies — home">
    <span className="brand__mark"><img src={logo} alt="" /></span>
    <span className="brand__type"><strong>LYCA<span className="brand__dot">.</span></strong><small>FOOD INGREDIENTS SUPPLIES</small></span>
  </Link>
}
export function ButtonLink({ to, children, variant = "primary", className = "" }: {
  to: string; children: ReactNode; variant?: "primary" | "secondary" | "light" | "text"; className?: string
}) {
  return <Link to={to} className={`button button--${variant} ${className}`}>{children}<ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" /></Link>
}
export function SectionHeading({ eyebrow, title, copy, center = false }: {
  eyebrow?: string; title: string; copy?: string; center?: boolean
}) {
  return <div className={`section-heading ${center ? "section-heading--center" : ""} reveal`}>
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{copy && <p className="section-copy">{copy}</p>}
  </div>
}
const links = [
  ["Home", "/"], ["Ingredients", "/products"], ["Applications", "/applications"],
  ["Our Company", "/about"], ["Global Network", "/network"],
] as const
export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>(".menu-button")?.focus() }
    }
    const outside = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest(".site-header")) setOpen(false) }
    const media = matchMedia("(min-width: 1021px)")
    const resize = () => { if (media.matches) setOpen(false) }
    document.addEventListener("keydown", close)
    document.addEventListener("pointerdown", outside)
    media.addEventListener("change", resize)
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); media.removeEventListener("change", resize) }
  }, [open])
  useEffect(() => setOpen(false), [location])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
    <div className="top-strip"><div className="top-strip__inner"><span><span className="live-dot" /> INTERNATIONAL INGREDIENT SUPPLY PARTNER</span><a href="mailto:sales@lycafoods.com">sales@lycafoods.com <ArrowUpRight size={12} /></a></div></div>
    <div className="nav-wrap"><Logo />
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([name, path]) => <NavLink key={path} end={path === "/"} to={path}>{name}</NavLink>)}</nav>
      <div className="header-actions"><ButtonLink to="/enquiry" className="header-cta">Get in touch</ButtonLink>
      <button type="button" className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-controls="mobile-site-nav" aria-expanded={open}>{open ? <X /> : <Menu />}</button></div>
    </div>
    <AnimatePresence>{open && <motion.nav id="mobile-site-nav" className="mobile-nav mobile-nav--open" aria-label="Mobile navigation" initial={{ opacity: 0, y: reduce ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -8 }} transition={{ duration: reduce ? 0 : .2 }}>
      {links.map(([name, path]) => <NavLink end={path === "/"} key={path} to={path}>{name}<ArrowUpRight size={17} /></NavLink>)}
      <NavLink to="/enquiry">Contact / Enquiry <ArrowUpRight size={17} /></NavLink>
    </motion.nav>}</AnimatePresence>
  </header>
}
export function Footer() {
  return <footer className="footer"><div className="footer-content wrap">
    <div className="footer-head"><div><p className="eyebrow">THE NEXT INGREDIENT IN YOUR SUCCESS</p><h2>Better ingredients.<br/><em>Better possibilities.</em></h2></div><ButtonLink to="/enquiry" variant="light">Start an enquiry</ButtonLink></div>
    <div className="footer-grid"><div className="footer-brand"><Logo light /><p>Thoughtfully sourced food and beverage ingredients, connecting makers to markets across the globe.</p></div>
      <div><h3>Explore</h3>{[...links, ["Enquiries", "/enquiry"] as const].map(([name, path]) => <Link key={path} to={path}>{name}</Link>)}</div>
      <div><h3>Ingredient Portfolio</h3>{categories.slice(0, 5).map(cat => <Link key={cat.id} to={`/products#${cat.id}`}>{cat.shortTitle}</Link>)}<Link to="/products">View all ingredients <ArrowRight size={13} /></Link></div>
      <div><h3>Let's talk</h3><a href="mailto:sales@lycafoods.com">sales@lycafoods.com</a><a href="mailto:customerservice@lycafoods.com">customerservice@lycafoods.com</a><p>Sharjah · Kuwait City · Erode<br/>Cairo · Dar es Salaam · Nittambuwa</p></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} LYCA Food Ingredients Supplies. All rights reserved.</span><div><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Use</Link><span>Made for global trade</span></div></div>
  </div></footer>
}
export function Layout() {
  const loc = useLocation()
  const reduce = useReducedMotion()
  useEffect(() => {
    const names: Record<string, string> = { "/": "Global Food Ingredient Supply", "/products": "Ingredient Portfolio", "/applications": "Industries & Applications", "/about": "Our Company", "/network": "Global Network", "/enquiry": "Business Enquiry", "/privacy": "Privacy Policy", "/terms": "Terms of Use" }
    document.title = `${names[loc.pathname] || "Page Not Found"} | LYCA Food Ingredients Supplies`
  }, [loc.pathname])
  return <>
    <ScrollExperience />
    <ScrollReveals />
    <ScrollProgress />
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <Header />
    <motion.main id="main-content" className="route-surface" key={loc.pathname} tabIndex={-1}
      initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : .28, ease: "easeOut" }}><Outlet /></motion.main>
    <Footer />
  </>
}
export function PageHero({ eyebrow, title, copy, image, imageAlt = "" }: {
  eyebrow: string; title: string; copy: string; image: string; imageAlt?: string
}) {
  return <section className="page-hero"><div className="wrap page-hero__inner"><div className="page-hero__copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p><span className="page-hero__rule" /></div><div className="page-hero__visual"><img src={image} alt={imageAlt} /><span className="page-hero__visual-dot" /></div></div></section>
}
export function OfficeCard({ office }: { office: typeof offices[number] }) {
  const firstPhone = office.phone.split(" / ")[0].replace(/\s/g, "")
  return <article className="office-card reveal"><span className="office-card__icon"><MapPin size={21} /></span><p className="eyebrow">{office.country}</p><h3>{office.city}</h3><div className="office-card__details"><a href={`tel:${firstPhone}`}><Phone size={15}/>{office.phone}</a><a href={`mailto:${office.email}`}><Mail size={15}/>{office.email}</a></div><a className="office-card__map" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.city)}`}>Find on map <ArrowUpRight size={17}/></a></article>
}
export function FinalCta({ title = "Let's make something remarkable.", copy = "Tell us what you're developing. We'll help direct your ingredient enquiry to the right team." }: { title?: string; copy?: string }) {
  return <section className="cta-section wrap reveal"><div className="cta-section__glow"/><div><p className="eyebrow">YOUR NEXT STEP</p><h2>{title}</h2><p>{copy}</p></div><ButtonLink to="/enquiry" variant="light">Contact our team</ButtonLink></section>
}
export function Stat({ number, label }: { number: string; label: string }) { return <div className="stat"><strong>{number}</strong><span>{label}</span></div> }
