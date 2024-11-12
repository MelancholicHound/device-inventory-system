import { createReducer, on } from "@ngrx/store";
import { updateChildData } from "./app.actions";

export interface AppState {
    childData: { [key: string]: any };
}

export const initialState: AppState = {
    childData: {}
}

export const appReducer = createReducer(
    initialState,
    on(updateChildData, (state, { data }) => ({
        ...state,
        childData: { ...state.childData, data }
    }))
);
