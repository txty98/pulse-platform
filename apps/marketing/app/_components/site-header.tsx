import Link from "next/link";

const productLinks = [
  { href: "/products/pulse-rms", label: "Pulse RMS" },
  { href: "/products/pulse-tasks", label: "Pulse Tasks" },
  { href: "/products/pulse-missions", label: "Pulse Missions" }
];

const chmsAppUrl = process.env.NEXT_PUBLIC_CHMS_APP_URL ?? "http://localhost:3001";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="Pulse RMS home">
        <img
          className="header-logo"
          src="/brand/logo-primary.svg"
          alt="Pulse RMS"
          width="190"
          height="31"
        />
      </Link>

      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/#about">About</Link>

        <div className="nav-dropdown">
          <span className="nav-dropdown-trigger">Products</span>
          <div className="dropdown-menu">
            {productLinks.map((productLink) => (
              <Link href={productLink.href} key={productLink.href}>
                {productLink.label}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/security">Security</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/contact">Contact</Link>
        <a className="login-button" href={`${chmsAppUrl}/login`}>
          Login
        </a>
      </nav>
    </header>
  );
}
