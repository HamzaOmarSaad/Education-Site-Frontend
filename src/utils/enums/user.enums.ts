export const GradeEnum = {
  FIRST_SECONDARY: "First Secondary",
  SECOND_SECONDARY: "Second Secondary",
  THIRD_SECONDARY: "Third Secondary",
} as const;

export type GradeEnum = (typeof GradeEnum)[keyof typeof GradeEnum];

export const TrackYear = {
  GENERAL: "General",
  SCIENTIFIC: "Scientific",
  SCIENTIFIC_MATH: "Scientific Mathematics",
  SCIENTIFIC_SCIENCE: "Scientific Science",
  LITERARY: "Literary",
} as const;

export type TrackYear = (typeof TrackYear)[keyof typeof TrackYear];
export const GenderEnum = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type GenderEnum = (typeof GenderEnum)[keyof typeof GenderEnum];
