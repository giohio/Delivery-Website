// Mock types - replace with actual @wix/members when available
export type Member = {
  loginEmail?: string; // type is string
  loginEmailVerified?: boolean; // type is boolean
  status?: "UNKNOWN" | "PENDING" | "APPROVED" | "BLOCKED" | "OFFLINE"; // type is enum of "UNKNOWN" | "PENDING" | "APPROVED" | "BLOCKED" | "OFFLINE"
  contact?: {
    firstName?: string; // type is string
    lastName?: string; // type is string
    phones?: string[]; // type is string[]
  },
  profile?: {
    nickname?: string; // type is string
    photo?: {
      url?: string; // type is string
      height?: number; // type is number
      width?: number; // type is number
      offsetX?: number; // type is number
      offsetY?: number; // type is number
    },
    title?: string; // type is string
  },
  _createdDate?: Date; // type is Date
  _updatedDate?: Date; // type is Date
  lastLoginDate?: Date; // type is Date
}