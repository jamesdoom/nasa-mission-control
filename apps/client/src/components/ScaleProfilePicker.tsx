import { scaleProfiles } from "../data/scaleProfiles";
import { maxScaleProfiles } from "../utils/scaleLab";

export function ScaleProfilePicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="scale-picker">
      <legend>Reference profiles · choose up to four</legend>
      <div>
        {scaleProfiles.map((profile) => {
          const checked = selected.includes(profile.id);
          return (
            <label key={profile.id}>
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && selected.length >= maxScaleProfiles}
                onChange={() => onToggle(profile.id)}
              />
              <span>
                <strong>{profile.shortName}</strong>
                <small>{profile.referenceFrame}</small>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
