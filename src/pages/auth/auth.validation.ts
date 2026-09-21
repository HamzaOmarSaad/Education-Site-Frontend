import z from "zod";
import { generalValidationFields } from "../../utils/validation";
import { GenderEnum, GradeEnum, TrackYear } from "../../utils/enums/user.enums";

export const loginSchema = z.strictObject({
  email: generalValidationFields.email,
  password: generalValidationFields.password,
  FCM: z.string().optional(),
});

export const signupSchema = loginSchema
  .safeExtend({
    name: z.string().min(3, "Name must be at least 3 characters").max(16),
    rePassword: z.string().min(8, "Re-enter your password"),
    phone: generalValidationFields.phone,
    parentPhone: generalValidationFields.phone,
    school: z.string().min(3).max(16),
    gender: z.enum([GenderEnum.MALE, GenderEnum.FEMALE], {
      error: "Select your gender",
    }),
    grade: z.enum([
      GradeEnum.FIRST_SECONDARY,
      GradeEnum.SECOND_SECONDARY,
      GradeEnum.THIRD_SECONDARY,
    ]),
    track: z.enum([
      TrackYear.GENERAL,
      TrackYear.SCIENTIFIC,
      TrackYear.SCIENTIFIC_MATH,
      TrackYear.SCIENTIFIC_SCIENCE,
      TrackYear.LITERARY,
    ]),
  })
  .refine((val) => val.password === val.rePassword, {
    error: "Passwords don't match",
    path: ["rePassword"],
  });

export type SignUpFormData = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
  otp: z
    .array(z.string().regex(/^\d?$/, "Only numbers are allowed"))
    .length(6)
    .refine(
      (digits) => digits.every((digit) => digit !== ""),
      "Please enter the complete 6-digit verification code",
    ),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
