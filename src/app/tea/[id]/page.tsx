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
        <>
          <BackLink href="/">← Teas</BackLink>
          <span>{tea.name}</span>
        </>
      }
      subtitle={
        <div className="flex flex-wrap items-center" style={{ gap: 4 }}>
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
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1.5fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Card padding={18}>
          <div className="text-ink-soft text-eyebrow-lg uppercase">Average</div>
          <div className="flex items-baseline" style={{ gap: 8, marginTop: 4 }}>
            <div
              className="text-ink text-kpi font-serif"
              style={{ lineHeight: 1 }}
            >
              {avgLabel}
            </div>
            {total > 0 && <CupRating value={Math.round(avg)} size={14} />}
          </div>
          <div className="text-ink-muted text-meta" style={{ marginTop: 8 }}>
            {total} ratings · {comments.length} comments
          </div>
        </Card>

        <Card padding={18}>
          <RatingBlock tea={tea} />
        </Card>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1.5fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <SectionHead
            title="Rating distribution"
            sub="How students actually scored it"
          />
          <RatingHistogram dist={tea.distribution} />
          <div
            className="text-ink-muted text-meta border-ink/[0.06] border-t"
            style={{ marginTop: 14, paddingTop: 14, lineHeight: 1.5 }}
          >
            Distribution is {interpretRatingDistribution(tea.distribution)}
          </div>
        </Card>
        <TeaTrendCard teaId={tea.id} initialTrend={tea.trend} />
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1.5fr", gap: 16 }}
      >
        <div className="flex flex-col" style={{ gap: 16 }}>
          <Card>
            <SectionHead
              title="What students said"
              sub="Quick-tag frequencies"
            />
            {tea.tagBars.length > 0 ? (
              <TagBars items={tea.tagBars} />
            ) : (
              <div
                className="text-ink-soft text-meta text-center"
                style={{ padding: "24px 0" }}
              >
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
