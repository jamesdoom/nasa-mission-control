import type { Mission } from "../data/missions";
import { maxComparedMissions } from "../utils/missionComparison";

type MissionComparisonPickerProps = {
  options: Mission[];
  selected: string[];
  onToggle: (slug: string) => void;
};

export function MissionComparisonPicker({
  options,
  selected,
  onToggle,
}: MissionComparisonPickerProps) {
  return (
    <fieldset className="mission-compare-picker">
      <legend>Select two or three missions</legend>
      <div>
        {options.map((mission) => {
          const checked = selected.includes(mission.slug);
          return (
            <label key={mission.slug}>
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && selected.length >= maxComparedMissions}
                onChange={() => onToggle(mission.slug)}
              />
              <span>
                <strong>{mission.name}</strong>
                <small>
                  {mission.launchDate.slice(0, 4)} // {mission.destination}
                </small>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
