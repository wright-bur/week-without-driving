export type ParentStatus = "Parent" | "Not a parent" | "Prefer not to say";
export type AreaType = "Urban" | "Suburban" | "Rural" | "Prefer not to say";

export type TripType =
  | "Work commute"
  | "School drop-off"
  | "Errands"
  | "Social/joy trip"
  | "I didn't replace one";

export type TripMode =
  | "Bike"
  | "Transit"
  | "Walk"
  | "Ride from someone else"
  | "Didn't go";

export type AlmostBrokeTag =
  | "Time pressure"
  | "Kids logistics"
  | "Weather"
  | "Safety fear"
  | "Social embarrassment"
  | "Infrastructure gap"
  | "Physical fatigue"
  | "Emotional fatigue"
  | "Nothing today";

export type Surprise =
  | "Easier than expected"
  | "Harder than expected"
  | "I noticed something new"
  | "Someone helped me"
  | "Someone made it harder"
  | "I felt calmer"
  | "I felt exposed"
  | "I felt proud"
  | "I felt annoyed";

export type CardType =
  | "victory"
  | "break"
  | "ambivalence"
  | "systems"
  | "surprise";

export type DailyEntryInput = {
  day: number;
  trip_type: TripType | null;
  trip_mode: TripMode[];
  almost_broke_tags: AlmostBrokeTag[];
  almost_broke_text: string | null;
  surprise: Surprise | null;
  publish_ok: boolean;
  skipped: boolean;
};

export type CardCandidate = {
  text: string;
  card_type: CardType;
  tags: string[];
  flagged: boolean;
  flag_reason: string | null;
};
