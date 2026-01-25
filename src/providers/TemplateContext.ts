import { createContext, useContext } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";

type TemplateContextValue = {
  templateList: NamedEntity | null;
  isTemplateList: (listId: string) => boolean;
};

export const TemplateContext = createContext<TemplateContextValue>({
  templateList: null,
  isTemplateList: () => false,
});

export const useTemplate = () => useContext(TemplateContext);
