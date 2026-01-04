import Link from 'next/link'
import LogoServer from './LogoServer'

interface FooterProps {
  tagline: string
  copyright: string
  navigation: {
    believe: string
    explore: string
    studioNotes: string
    development: string
  }
}

export default function Footer({ tagline, copyright, navigation }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <LogoServer className="footer-logo" showLink={true} />
            <p className="footer-tagline">{tagline}</p>
          </div>
          <nav className="footer-nav">
            <Link href="/believe" className="footer-link">{navigation.believe}</Link>
            <Link href="/explore" className="footer-link">{navigation.explore}</Link>
            <Link href="/studio-notes" className="footer-link">{navigation.studioNotes}</Link>
            <Link href="/development" className="footer-link">{navigation.development}</Link>
          </nav>
        </div>
        <div className="footer-copyright">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}

