import { BackLink } from "@/components/admin/BackLink";
import { PageShell } from "@/components/admin/PageShell";
import { Pill } from "@/components/admin/Pill";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isNewSuggestion } from "@/lib/admin/suggestions";
import { formatPostedDate } from "@/lib/dateFormat";
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
      title={
        <>
          <BackLink href="/admin/suggestions">← Suggestions</BackLink>
          <div className="flex flex-row items-center gap-1">
            {suggestion.title} {isNew && <Pill tone="warn">New</Pill>}
          </div>
        </>
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
