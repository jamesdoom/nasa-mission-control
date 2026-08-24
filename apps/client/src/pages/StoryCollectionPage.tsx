import { Link, useParams } from "react-router-dom";
import { ProvenancePanel } from "../components/ProvenancePanel";
import {
  storyCollectionById,
  type StoryEvidenceKind,
} from "../data/storyCollections";

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

  return (
    <>
      <article className="section story-hero">
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
      </article>

      <section className="section provenance-section">
        <ProvenancePanel
          kind="curated"
          title="Source-checked narrative collection"
          summary={`Reviewed ${story.verifiedAt} · ${String(story.sources.length)} official NASA sources`}
          details={[
            "The explanatory sequence is maintained by this project; it is not a NASA-authored lesson or a live mission-status feed.",
            "Each chapter labels whether its destination is live, latest available, curated, or calculated.",
            "Claims are deliberately bounded; follow the official sources below for the full scientific context.",
          ]}
        />
      </section>

      <section
        className="section story-chapters"
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
            Open each chapter in order or return later using your browser
            history.
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

      <section
        className="section story-timeline"
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
        </ul>
      </section>
    </>
  );
}
