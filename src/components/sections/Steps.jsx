export function Steps({ title, items }) {
  return (
    <section className="how-it-works" id="como-funciona">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="steps-grid">
          {items.map((step, i) => (
            <div className="step" key={i}>
              <div className="step-icon" dangerouslySetInnerHTML={{ __html: step.icon }} />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
