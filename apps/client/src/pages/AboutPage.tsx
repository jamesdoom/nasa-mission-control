export function AboutPage() {
  return (
    <section className="section page-section">
      <div className="page-intro">
        <p className="kicker">
          <span />
          Mission profile
        </p>
        <h1>
          Space data,
          <br />
          made human.
        </h1>
        <p>
          NASA Mission Control is an independent educational project that
          transforms public NASA data into an accessible, cinematic
          command-center experience.
        </p>
      </div>
      <div className="about-grid">
        <article>
          <span>01</span>
          <h2>Reliable by design</h2>
          <p>
            NASA responses are validated and translated by our server before
            reaching the interface. API credentials remain server-side.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Science with context</h2>
          <p>
            Future data modules will explain scientific values plainly and
            distinguish live data from curated editorial content.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Built for everyone</h2>
          <p>
            Keyboard navigation, readable contrast, semantic structure, and
            reduced-motion preferences are first-class requirements.
          </p>
        </article>
      </div>
      <aside className="source-note">
        <strong>Data attribution</strong>
        <p>
          Astronomy Picture of the Day content is provided by NASA Open APIs.
          Copyright and credit are displayed when supplied by the API. This
          project is not affiliated with or endorsed by NASA.
        </p>
      </aside>
    </section>
  );
}
