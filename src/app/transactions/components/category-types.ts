export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId?: string | null;
};

export type FormState = {
  editingId: string | null;
  newCatName: string;
  newCatIcon: string;
  newCatColor: string;
  mobilePanel: "list" | "form";
};

export type FormAction =
  | { type: "START_EDIT"; cat: Category }
  | { type: "CANCEL_EDIT" }
  | { type: "SET_NAME"; val: string }
  | { type: "SET_ICON"; val: string }
  | { type: "SET_COLOR"; val: string }
  | { type: "SET_MOBILE_PANEL"; val: "list" | "form" }
  | { type: "RESET_FORM" };

export const initialFormState: FormState = {
  editingId: null,
  newCatName: "",
  newCatIcon: "Home",
  newCatColor: "#007AFF",
  mobilePanel: "list",
};

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "START_EDIT":
      return {
        editingId: action.cat.id,
        newCatName: action.cat.name,
        newCatIcon: action.cat.icon,
        newCatColor: action.cat.color,
        mobilePanel: "form",
      };
    case "CANCEL_EDIT":
    case "RESET_FORM":
      return {
        editingId: null,
        newCatName: "",
        newCatIcon: "Home",
        newCatColor: "#007AFF",
        mobilePanel: "list",
      };
    case "SET_NAME":
      return { ...state, newCatName: action.val };
    case "SET_ICON":
      return { ...state, newCatIcon: action.val };
    case "SET_COLOR":
      return { ...state, newCatColor: action.val };
    case "SET_MOBILE_PANEL":
      return { ...state, mobilePanel: action.val };
    default:
      return state;
  }
}
