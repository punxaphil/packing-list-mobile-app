import { useEffect, useMemo, useState } from "react";
import { fetchMemberData, type MemberData } from "~/services/spaceDatabase.ts";
import type { Space } from "~/types/Space.ts";
import type { MemberInfo } from "./memberInfo.ts";

export const useSpaceMemberInfo = (spaces: Space[]) => {
  const [memberData, setMemberData] = useState<MemberData>({ imagesByEmail: {}, emailById: {} });

  useEffect(() => {
    const allIds = [...new Set(spaces.flatMap((space) => space.members))];
    if (!allIds.length) return;
    let active = true;
    void fetchMemberData(allIds).then((data) => {
      if (active) setMemberData(data);
    });
    return () => {
      active = false;
    };
  }, [spaces]);

  const memberInfoBySpaceId = useMemo(() => {
    const result: Record<string, MemberInfo[]> = {};
    for (const space of spaces) {
      const ownerEmail = memberData.emailById[space.ownerId]?.toLowerCase();
      const sorted = [...space.memberEmails].sort((first, second) => {
        if (first.toLowerCase() === ownerEmail) return -1;
        if (second.toLowerCase() === ownerEmail) return 1;
        return 0;
      });
      result[space.id] = sorted.map((email) => ({ email, imageUrl: memberData.imagesByEmail[email] }));
    }
    return result;
  }, [spaces, memberData]);

  return { memberData, memberInfoBySpaceId };
};
