import LogoServer from './LogoServer'
import FooterNav from './FooterNav'

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
          <FooterNav navigation={navigation} />
        </div>
        <div className="footer-copyright">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}

