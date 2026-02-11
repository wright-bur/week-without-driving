import type { AreaType, AlmostBrokeTag, ParentStatus, Surprise, TripMode, TripType } from "@/types";

export const parentStatusOptions: ParentStatus[] = [
  "Parent",
  "Not a parent",
  "Prefer not to say"
];

export const areaTypeOptions: AreaType[] = [
  "Urban",
  "Suburban",
  "Rural",
  "Prefer not to say"
];

export const tripTypeOptions: TripType[] = [
  "Work commute",
  "School drop-off",
  "Errands",
  "Social/joy trip",
  "I didn't replace one"
];

export const tripModeOptions: TripMode[] = [
  "Bike",
  "Transit",
  "Walk",
  "Ride from someone else",
  "Didn't go"
];

export const almostBrokeOptions: AlmostBrokeTag[] = [
  "Time pressure",
  "Kids logistics",
  "Weather",
  "Safety fear",
  "Social embarrassment",
  "Infrastructure gap",
  "Physical fatigue",
  "Emotional fatigue",
  "Nothing today"
];

export const surpriseOptions: Surprise[] = [
  "Easier than expected",
  "Harder than expected",
  "I noticed something new",
  "Someone helped me",
  "Someone made it harder",
  "I felt calmer",
  "I felt exposed",
  "I felt proud",
  "I felt annoyed"
];

export const filterCardTypes = [
  "victory",
  "break",
  "ambivalence",
  "systems",
  "surprise"
];

export const filterTags = [
  "Kids logistics",
  "Safety fear",
  "Time pressure",
  "Infrastructure gap",
  "Weather",
  "Physical fatigue",
  "Emotional fatigue"
];

export const moderationTags = [
  "Time pressure",
  "Kids logistics",
  "Weather",
  "Safety fear",
  "Social embarrassment",
  "Infrastructure gap",
  "Physical fatigue",
  "Emotional fatigue"
];
