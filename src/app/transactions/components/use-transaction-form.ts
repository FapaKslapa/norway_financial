import { useReducer } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type FormState = {
  txDesc: string;
  txType: "expense" | "income";
  txAmount: string;
  txCurrency: string;
  txDate: string;
  txCategoryId: string;
  isInlineCatOpen: boolean;
  newCatName: string;
  newCatIcon: string;
  newCatColor: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; payload: Partial<FormState> }
  | { type: "RESET"; payload: { displayCurrency: string } };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function todayISO() {
  return new Date().toISOString().substring(0, 10);
}

function makeInitialState(displayCurrency: string): FormState {
  return {
    txDesc: "",
    txType: "expense",
    txAmount: "",
    txCurrency: displayCurrency,
    txDate: todayISO(),
    txCategoryId: "",
    isInlineCatOpen: false,
    newCatName: "",
    newCatIcon: "Home",
    newCatColor: "#007AFF",
    isSubmitting: false,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, ...action.payload };
    case "RESET":
      return makeInitialState(action.payload.displayCurrency);
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTransactionForm(displayCurrency: string) {
  const [form, dispatch] = useReducer(
    formReducer,
    displayCurrency,
    makeInitialState,
  );

  const set = (payload: Partial<FormState>) =>
    dispatch({ type: "SET_FIELD", payload });

  const reset = () => dispatch({ type: "RESET", payload: { displayCurrency } });

  return { form, set, reset };
}
