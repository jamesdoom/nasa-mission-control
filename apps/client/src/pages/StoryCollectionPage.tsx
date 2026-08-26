import { Link, useParams } from "react-router-dom";
import { ProvenancePanel } from "../components/ProvenancePanel";
import {
  storyCollectionById,
  type StoryEvidenceKind,
} from "../data/storyCollections";
import { storyEnrichment } from "../data/educationalEnrichment";

const evidenceLabels: Record<StoryEvidenceKind, string> = {
  live: "Live retrieval",
  latest: "Latest available",
  curated: "Curated record",
  calculated: "Calculated here",
};

export function StoryCollectionPage() {
  const { storyId } = useParams();
  const story = storyCollectionById(storyId);

  if (!story) {
    return (
      <section className="section empty-state">
        <span aria-hidden="true">404</span>
        <h1>Science story not found</h1>
        <p>Return to Guided Discovery to choose a source-checked collection.</p>
        <Link className="button" to="/discover">
          Browse science stories
        </Link>
      </section>
    );
  }
  const enrichment = storyEnrichment[story.id];

  return (
    <>
      <article className="story-hero">
        <figure className="story-hero__visual">
          <img
            src={story.image.src}
            alt={story.image.alt}
            fetchPriority="high"
          />
          <figcaption>
            Image: {story.image.credit} //{" "}
            <a href={story.image.sourceUrl} target="_blank" rel="noreferrer">
              NASA source ↗
            </a>
          </figcaption>
        </figure>
        <div className="section story-hero__content">
          <Link className="text-link" to="/discover#science-stories">
            ← All science stories
          </Link>
          <p className="kicker">
            <span />
            {story.code} · {story.duration}
          </p>
          <h1>{story.title}</h1>
          <p className="story-hero__question">{story.question}</p>
          <p>{story.summary}</p>
          <aside>
            <small>Why this matters</small>
            <p>{story.whyItMatters}</p>
          </aside>
        </div>
      </article>

      <section className="section provenance-section">
        <ProvenancePanel
          kind="curated"
          title="Source-checked narrative collection"
          summary={`Reviewed ${story.verifiedAt} · ${String(story.sources.length)} official NASA sources`}
          details={[
            "Curated here, not a live NASA status feed. Chapter labels identify the evidence class; official context follows below.",
          ]}
        />
      </section>

      <nav
        className="section source-note reading-path"
        aria-label="Story evidence path"
      >
        <a href="#story-chapters">Chapters</a>
        <a href="#story-synthesis">Synthesis</a>
        <a href="#story-timeline">Chronology</a>
        <a href="#story-sources">Sources</a>
      </nav>

      <section
        className="section story-chapters"
        id="story-chapters"
        aria-labelledby="chapters-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Evidence sequence
            </p>
            <h2 id="chapters-title">Follow the story in four chapters</h2>
          </div>
          <p>
            Read in sequence, then carry one bounded claim into the next step.
          </p>
        </div>
        <ol>
          {story.chapters.map((chapter, index) => (
            <li key={chapter.to}>
              <div className="story-chapter__number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <article>
                <header>
                  <span
                    className={`evidence-badge evidence-badge--${chapter.kind}`}
                  >
                    {evidenceLabels[chapter.kind]}
                  </span>
                  <small>{chapter.label}</small>
                </header>
                <h3>{chapter.title}</h3>
                <p>{chapter.description}</p>
                {enrichment?.captions[index] ? (
                  <aside className="story-chapter__caption">
                    <strong>Evidence caption</strong>
                    <p>{enrichment.captions[index]}</p>
                  </aside>
                ) : null}
                <div className="story-chapter__takeaway">
                  <strong>Carry forward</strong>
                  <p>{chapter.takeaway}</p>
                </div>
                <Link className="button button--secondary" to={chapter.to}>
                  Open chapter {index + 1} →
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </section>

      {enrichment ? (
        <section
          className="section story-timeline"
          id="story-synthesis"
          aria-labelledby="story-conclusion-title"
        >
          <div>
            <p className="kicker">
              <span />
              Synthesis
            </p>
            <h2 id="story-conclusion-title">What the sequence supports</h2>
            <p>{enrichment.conclusion}</p>
          </div>
          <dl>
            {enrichment.terms.map((item) => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section
        className="section story-timeline"
        id="story-timeline"
        aria-labelledby="story-timeline-title"
      >
        <div>
          <p className="kicker">
            <span />
            Scientific chronology
          </p>
          <h2 id="story-timeline-title">How the evidence developed</h2>
          <p>A compact orientation, not a complete history.</p>
        </div>
        <ol>
          {story.milestones.map((milestone) => (
            <li key={`${milestone.date}-${milestone.title}`}>
              <time>{milestone.date}</time>
              <div>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="section story-sources"
        id="story-sources"
        aria-labelledby="story-sources-title"
      >
        <div>
          <p className="kicker">
            <span />
            Primary context
          </p>
          <h2 id="story-sources-title">Verify with NASA</h2>
          <p>Official sources reviewed {story.verifiedAt}.</p>
        </div>
        <ul>
          {story.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
          <li>
            <Link to={`/learn?track=${story.learningTrackId}`}>
              Continue in guided learning <span aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
