import { normalizeToHttps } from '@/lib/url-utils'

interface Explore {
  title: string
  description: string
  icon: string
}

interface ExploreProps {
  data: Explore[]
}

export default function Explore({ data }: ExploreProps) {
  if (!data || data.length === 0) {
    console.warn('Explore: No data provided')
    return null
  }

  return (
    <section id="explore" className="content-section">
      <div className="container">
        <h2 className="section-title">What We Explore</h2>
        <div className="cards-grid">
          {data.map((item, index) => (
            <div key={index} className={`card service-card ${!item.icon ? 'no-icon' : ''}`}>
              {item.icon && (
                <div className="card-icon">
                  <img
                    src={normalizeToHttps(item.icon)}
                    alt={item.title}
                    className="card-icon-image"
                  />
                </div>
              )}
              <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

