import { ReactNode, useCallback, useMemo } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { TemplateContext } from "./TemplateContext.ts";

type Props = { lists: NamedEntity[]; children: ReactNode };

export const TemplateProvider = ({ lists, children }: Props) => {
  const templateList = useMemo(() => lists.find((l) => l.isTemplate) ?? null, [lists]);
  const isTemplateList = useCallback((id: string) => templateList?.id === id, [templateList]);
  const value = useMemo(() => ({ templateList, isTemplateList }), [templateList, isTemplateList]);
  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
};
