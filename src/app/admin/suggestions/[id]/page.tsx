import { Card } from "@/components/layout/Card";
import { PageShell } from "@/components/layout/PageShell";
import { buttonClassName } from "@/components/primitives/Button";
import { Pill } from "@/components/primitives/Pill";
import { formatPostedDate } from "@/lib/dateFormat";
import { isNewSuggestion } from "@/lib/suggestions";
import { getSuggestionById } from "@/services/suggestionService";
import { getCurrentUser, getUser } from "@/services/userService";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function SuggestionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const suggestion = await getSuggestionById(id);
  if (!suggestion) notFound();
  const suggestionUser = suggestion.userId
    ? await getUser(suggestion.userId)
    : null;

  const user = await getCurrentUser();
  const isNew = isNewSuggestion(suggestion, user?.lastTimeReviewsViewed);

  return (
    <PageShell
      backlink={true}
      title={
        <div className="flex flex-row items-center gap-1">
          {suggestion.title} {isNew && <Pill tone="warn">New</Pill>}
        </div>
      }
      subtitle={
        <span className="text-meta text-ink-muted">
          Left {formatPostedDate(suggestion.postedDate)}
          {suggestionUser ? " by " + suggestionUser.name : ""}
        </span>
      }
      actions={
        <>
          {
            // TODO: Add actual actions
          }
          <Link
            href={`/admin/suggestions/${suggestion.id}/approve`}
            className={buttonClassName()}
          >
            Approve
          </Link>
          <Link
            href={`/admin/suggestions/${suggestion.id}/deny`}
            className={buttonClassName()}
          >
            Deny
          </Link>
        </>
      }
    >
      <div className="grid-rows-[1fr 2em] mb-4 grid gap-4">
        <Card>
          <div className="text-ink-soft text-eyebrow-lg uppercase">
            Description
          </div>
          <p className="text-body mt-1">{suggestion.description}</p>
        </Card>
      </div>
    </PageShell>
  );
}
