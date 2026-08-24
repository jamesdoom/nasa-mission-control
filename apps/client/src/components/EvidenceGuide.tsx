export function EvidenceGuide() {
  return (
    <section className="evidence-guide" aria-labelledby="evidence-guide-title">
      <div>
        <p className="eyebrow">Before you explore</p>
        <h2 id="evidence-guide-title">Know what the data labels mean</h2>
        <p>
          Mission Control separates current retrievals, published observations,
          reviewed history, and derived comparisons.
        </p>
      </div>
      <dl>
        <div>
          <dt>Live</dt>
          <dd>Retrieved from a NASA service during this visit.</dd>
        </div>
        <div>
          <dt>Latest available</dt>
          <dd>NASA’s newest published record, which may not be today.</dd>
        </div>
        <div>
          <dt>Curated</dt>
          <dd>Source-checked editorial content reviewed on a stated date.</dd>
        </div>
        <div>
          <dt>Calculated</dt>
          <dd>A value derived here from displayed, sourced measurements.</dd>
        </div>
      </dl>
    </section>
  );
}
