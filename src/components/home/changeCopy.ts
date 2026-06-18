import { translatedCopy } from "~/i18n/translatedCopy.ts";
import type { ChangeAction } from "~/services/changeLog.ts";

type ChangeCopy = {
  title: string;
  back: string;
  empty: string;
  uncategorized: string;
  added: string;
  ticked: string;
  unticked: string;
  deleted: string;
  renamed: string;
  moved: string;
  image: string;
  from: string;
  to: string;
  assigned: string;
  unassigned: string;
};

export const changeCopy = translatedCopy<ChangeCopy>("changes");

export const changeActionVerb = (action: ChangeAction): string => changeCopy[action];
