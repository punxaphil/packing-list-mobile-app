import { translatedCopy } from "~/i18n/translatedCopy.ts";

type SpaceCopy = {
  spacesTitle: string;
  switchSpace: string;
  createSpace: string;
  createSpacePrompt: string;
  createSpaceConfirm: string;
  createSpacePlaceholder: string;
  inviteUser: string;
  pendingInvites: string;
  inviteFrom: string;
  personalSpace: string;
  chevron: string;
  leaveSpace: string;
  deleteSpace: string;
  renamePrompt: string;
  renameConfirm: string;
  invitePrompt: string;
  inviteConfirm: string;
  inviteSent: string;
};

export const spaceCopy = translatedCopy<SpaceCopy>("space");
