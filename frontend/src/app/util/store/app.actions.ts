import { createAction, props } from "@ngrx/store";

export const updateChildData = createAction(
    '[Child Component] Update Child Data',
    props<{ childId: string; data: any }>()
);
