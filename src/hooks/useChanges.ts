import { useEffect, useState } from "react";
import { type ChangeLogEntry, subscribeToChanges } from "~/services/changeLog.ts";

type HookState = { changes: ChangeLogEntry[]; loading: boolean };

export const useChanges = (spaceId: string, packingListId: string): HookState => {
  const [state, setState] = useState<HookState>({ changes: [], loading: true });

  useEffect(() => {
    if (!spaceId || !packingListId) {
      setState({ changes: [], loading: false });
      return;
    }
    setState({ changes: [], loading: true });
    return subscribeToChanges(spaceId, packingListId, (changes) => setState({ changes, loading: false }));
  }, [spaceId, packingListId]);

  return state;
};
