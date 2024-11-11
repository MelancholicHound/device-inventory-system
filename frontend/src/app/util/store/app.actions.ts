import { createAction, props } from "@ngrx/store";

export const updateChildData = createAction(
    '[Child Component] Update Child Data',
    props<{ data: any }>()
);
