import { createReducer, on } from "@ngrx/store";
import { updateChildData } from "./app.actions";
import { state } from "@angular/animations";

export interface AppState {
    childData: { [key: string]: any };
}

export const initialState: AppState = {
    childData: {}
}

export const appReducer = createReducer(
    initialState,
    on(updateChildData, (state, { childId, data }) => ({
        ...state,
        childData: { ...state.childData, [childId]: data }
    }))
);
