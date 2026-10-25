export type ShareRole = "VIEW" | "EDIT";
export type AccessLevel = "none" | "view" | "edit";

export type AccessDocument = {
  ownerId: string;
  shares: Array<{ userId: string; role: string }>;
};

export function canAccess(document: AccessDocument, userId: string): AccessLevel {
  if (document.ownerId === userId) return "edit";
  const share = document.shares.find((entry) => entry.userId === userId);
  if (!share) return "none";
  return share.role === "EDIT" ? "edit" : "view";
}

export function canEdit(access: AccessLevel): boolean {
  return access === "edit";
}

export function canShare(document: AccessDocument, userId: string): boolean {
  return document.ownerId === userId;
}

export function canDelete(document: AccessDocument, userId: string): boolean {
  return document.ownerId === userId;
}

export function isShareRole(value: string): value is ShareRole {
  return value === "VIEW" || value === "EDIT";
}
