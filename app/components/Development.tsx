interface DevelopmentProps {
  sectionTitle: string
  intro: string
  outro: string
}

export default function Development({ sectionTitle, intro, outro }: DevelopmentProps) {
  return (
    <section id="development" className="content-section">
      <div className="container">
        <div className="development-header">
          <h2 className="section-title">
            <span className="dev-icon">*</span>
            {sectionTitle}
          </h2>
        </div>
        <p className="development-intro">
          {intro}
        </p>
        <p className="development-outro">
          {outro}
        </p>
      </div>
    </section>
  )
}

