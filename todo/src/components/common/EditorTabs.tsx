import { AdminSessionButton } from "@/features/auth/components/AdminSessionButton";
import { getAdminSession } from "@/features/auth/api/session";
import { EditorTabsNav } from "./EditorTabsNav";

export async function EditorTabs() {
  const { isAdmin } = await getAdminSession();

  return (
    <div className="sticky top-0 z-40 flex items-center border-b border-border bg-card">
      <EditorTabsNav />
      {isAdmin ? (
        <div className="ml-auto flex items-center pr-3">
          <AdminSessionButton />
        </div>
      ) : null}
    </div>
  );
}
