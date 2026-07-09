export type SplitMode = "half" | "percentage" | "exact" | "thirds" | "custom_n";

export type Friend = { user: { id: string; name: string } };

export type Group = {
  id: string;
  name: string;
  creatorId: string;
  members: Array<{ id: string; name: string; email: string }>;
};

export type SharedExpensePayload = {
  description: string;
  amount: number;
  currency: string;
  date: string;
  sharedWithUserId: string;
  splitMode: SplitMode;
  splitValue?: number;
};

// ─── Reducer ────────────────────────────────────────────────────────────────

export type FormState = {
  step: "form" | "split";
  shareType: "friend" | "group";
  desc: string;
  amount: string;
  currency: string;
  date: string;
  friendId: string;
  splitMode: SplitMode;
  percentage: string;
  exactNok: string;
  n: string;
  groupId: string;
  checkedMemberIds: string[];
  groupSplitMode: "equal" | "custom";
  customSplitsVal: Record<string, string>;
};

export type FormAction =
  | { type: "SET"; payload: Partial<FormState> }
  | { type: "RESET"; payload: Partial<FormState> };
