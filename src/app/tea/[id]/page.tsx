import { BackLink } from "@/components/admin/BackLink";
import { RatingHistogram } from "@/components/admin/charts/RatingHistogram";
import { TagBars } from "@/components/admin/charts/TagBars";
import { PageShell } from "@/components/admin/PageShell";
import { Pill } from "@/components/admin/Pill";
import { SectionHead } from "@/components/admin/SectionHead";
import { CommentList } from "@/components/admin/sections/CommentList";
import { TeaTrendCard } from "@/components/admin/sections/TeaTrendCard";
import { CupRating } from "@/components/brand/CupRating";
import { RatingBlock } from "@/components/TeaSheet/RatingBlock";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  interpretRatingDistribution,
  ratingAverage,
  ratingTotal,
} from "@/lib/admin/ratings";
import { isAdmin } from "@/lib/session";
import { getTeaDetail } from "@/services/statisticsService";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function TeaDetailPage({ params }: PageProps) {
  const { id } = await params;

  const admin = await isAdmin();

  const tea = await getTeaDetail(id);
  if (!tea) notFound();

  const comments = tea.reviews.map(review => review.comment);
  const total = ratingTotal(tea.distribution);
  const avg = ratingAverage(tea.distribution);
  const avgLabel = total > 0 ? avg.toFixed(1) : "—";

  return (
    <PageShell
      title={
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <BackLink href="/">← Teas</BackLink>
            <span className="truncate">{tea.name}</span>
          </div>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="tea">Tea</Pill>
          {tea.tags.map(t => (
            <Pill key={t} tone="neutral">
              {t}
            </Pill>
          ))}
        </div>
      }
      actions={
        admin && (
          <Link href={`/tea/${tea.id}/edit`} className={buttonClassName()}>
            Edit
          </Link>
        )
      }
    >
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr]">
        <Card padding={18}>
          <div className="text-ink-soft text-eyebrow-lg uppercase">Average</div>
          <div className="mt-2 flex items-baseline gap-4">
            <div className="text-ink text-kpi font-serif leading-none">
              {avgLabel}
            </div>
            {total > 0 && <CupRating value={Math.round(avg)} size={14} />}
          </div>
          <div className="text-ink-muted text-meta mt-2">
            {total} ratings · {comments.length} comments
          </div>
        </Card>

        <Card padding={18}>
          <RatingBlock tea={tea} />
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr]">
        <Card>
          <SectionHead
            title="Rating distribution"
            sub="How students actually scored it"
          />
          <RatingHistogram dist={tea.distribution} />
          <div className="text-ink-muted text-meta border-ink/6 mt-4 border-t pt-4">
            Distribution is {interpretRatingDistribution(tea.distribution)}
          </div>
        </Card>
        <TeaTrendCard teaId={tea.id} initialTrend={tea.trend} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <SectionHead
              title="What students said"
              sub="Quick-tag frequencies"
            />
            {tea.tagBars.length > 0 ? (
              <TagBars items={tea.tagBars} />
            ) : (
              <div className="text-ink-soft text-meta p-4 text-center">
                No tags yet.
              </div>
            )}
          </Card>
        </div>
        <Card>
          <CommentList reviews={tea.reviews} />
        </Card>
      </div>
    </PageShell>
  );
}
