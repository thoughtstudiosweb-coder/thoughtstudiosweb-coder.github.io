import Link from 'next/link'
import LogoServer from './LogoServer'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <LogoServer className="footer-logo" showLink={true} />
            <p className="footer-tagline">A place to think clearly</p>
          </div>
          <nav className="footer-nav">
            <Link href="/believe" className="footer-link">What We Believe</Link>
            <Link href="/explore" className="footer-link">What We Explore</Link>
            <Link href="/studio-notes" className="footer-link">Studio Notes</Link>
            <Link href="/development" className="footer-link">In Development</Link>
          </nav>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2025 RB & A Consulting LLC. Thought Studios™ is a brand of RB & A Consulting LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

