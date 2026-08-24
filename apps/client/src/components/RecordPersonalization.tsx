import { useState, type SyntheticEvent } from "react";
import type { RecordAnnotation } from "../hooks/useFlightLogPersonalization";

export function RecordPersonalization({
  title,
  annotation,
  onSave,
}: {
  title: string;
  annotation?: RecordAnnotation | undefined;
  onSave: (
    values: Pick<RecordAnnotation, "note" | "tags" | "collection">,
  ) => void;
}) {
  const [note, setNote] = useState(annotation?.note ?? "");
  const [collection, setCollection] = useState(annotation?.collection ?? "");
  const [tags, setTags] = useState(annotation?.tags.join(", ") ?? "");
  const [status, setStatus] = useState("");

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ note, collection, tags: tags.split(",") });
    setStatus("Personal details saved on this device.");
  }

  return (
    <details
      className="record-personalization"
      aria-label={`Personal details for ${title}`}
    >
      <summary>
        {annotation ? "Edit personal details" : "Add note or tags"}
      </summary>
      <form onSubmit={submit}>
        <label>
          Personal note
          <textarea
            value={note}
            maxLength={500}
            rows={3}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div>
          <label>
            Custom collection
            <input
              value={collection}
              maxLength={40}
              placeholder="e.g. Mars research"
              onChange={(event) => setCollection(event.target.value)}
            />
          </label>
          <label>
            Tags
            <input
              value={tags}
              maxLength={140}
              placeholder="water, rover, revisit"
              onChange={(event) => setTags(event.target.value)}
            />
          </label>
        </div>
        <button className="button button--secondary" type="submit">
          Save details
        </button>
        <p role="status">{status}</p>
      </form>
      {annotation ? (
        <div className="record-personalization__summary">
          {annotation.collection ? (
            <strong>{annotation.collection}</strong>
          ) : null}
          {annotation.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          {annotation.note ? <p>{annotation.note}</p> : null}
        </div>
      ) : null}
    </details>
  );
}
