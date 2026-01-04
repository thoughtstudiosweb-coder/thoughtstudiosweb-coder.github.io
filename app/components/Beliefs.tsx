interface Belief {
  title: string
  description: string
  icon: string
}

interface BeliefsProps {
  data: Belief[]
  sectionTitle: string
}

export default function Beliefs({ data, sectionTitle }: BeliefsProps) {
  if (!data || data.length === 0) {
    console.warn('Beliefs: No data provided')
    return null
  }

  return (
    <section id="believe" className="content-section">
      <div className="container">
        <h2 className="section-title">{sectionTitle}</h2>
        <div className="cards-grid">
          {data.map((belief, index) => (
            <div key={index} className="card">
              <div className="card-content">
                <h3 className="card-title">{belief.title}</h3>
                <p className="card-description">{belief.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

