import { showActionSheet } from "../home/showActionSheet.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";
import { UserRow } from "./UserRow.tsx";
import "./userList.css";

type UserListProps = {
  emails: string[];
  currentEmail: string;
  ownerEmail?: string;
  onRemove: (email: string) => void;
  imagesByEmail: Record<string, string>;
  isOwner: boolean;
};

export const UserList = ({ emails, currentEmail, ownerEmail, onRemove, imagesByEmail, isOwner }: UserListProps) => {
  const lowerOwner = ownerEmail?.toLowerCase();
  const otherEmails = lowerOwner ? emails.filter((e) => e.toLowerCase() !== lowerOwner) : emails;

  return (
    <div className="space-user-list" style={{ gap: homeSpacing.sm }}>
      {ownerEmail && (
        <UserSection title={SPACE_MGMT_COPY.owner}>
          <UserRow
            email={ownerEmail}
            isSelf={lowerOwner === currentEmail.toLowerCase()}
            imageUrl={imagesByEmail[lowerOwner ?? ""]}
            canRemove={false}
          />
        </UserSection>
      )}
      <UserSection title={SPACE_MGMT_COPY.otherUsers}>
        {otherEmails.length > 0 ? (
          otherEmails.map((email) => (
            <UserRow
              key={email}
              email={email}
              isSelf={email.toLowerCase() === currentEmail.toLowerCase()}
              imageUrl={imagesByEmail[email.toLowerCase()]}
              onRemove={() => confirmRemove(email, onRemove)}
              canRemove={isOwner}
            />
          ))
        ) : (
          <span className="space-user-empty" style={{ color: homeColors.muted, paddingBlock: homeSpacing.xs }}>
            {SPACE_MGMT_COPY.noOtherUsers}
          </span>
        )}
      </UserSection>
    </div>
  );
};

const UserSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <>
    <h3 className="space-user-section-title" style={{ color: homeColors.text }}>
      {title}
    </h3>
    {children}
  </>
);

const confirmRemove = (email: string, onRemove: (email: string) => void) => {
  showActionSheet(SPACE_MGMT_COPY.confirmRemove, [
    {
      text: SPACE_MGMT_COPY.confirm,
      style: "destructive",
      onPress: () => onRemove(email),
    },
    { text: SPACE_MGMT_COPY.cancel, style: "cancel" },
  ]);
};
