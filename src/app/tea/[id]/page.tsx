import { DeleteTeaButton } from "@/components/actions/DeleteTeaButton";
import { RatingForm } from "@/components/forms/rating/RatingForm";
import { CupRating } from "@/components/inputs/CupRating";
import { Card } from "@/components/layout/Card";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHead } from "@/components/layout/SectionHead";
import { CommentList } from "@/components/lists/CommentList";
import { buttonClassName } from "@/components/primitives/Button";
import { Pill } from "@/components/primitives/Pill";
import { RatingHistogram } from "@/components/statistics/charts/RatingHistogram";
import { TagBars } from "@/components/statistics/charts/TagBars";
import { TeaTrendCard } from "@/components/statistics/TeaTrendCard";
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
    <div className="relative">
      <main>
        <PageShell
          backlink={true}
          title={tea.name}
          subtitle={
            tea.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {tea.tags.map(t => (
                  <Pill key={t} tone="neutral">
                    {t}
                  </Pill>
                ))}
              </div>
            )
          }
          actions={
            admin && (
              <>
                <DeleteTeaButton tea={tea} />
                <Link
                  href={`/tea/${tea.id}/edit`}
                  className={buttonClassName()}
                >
                  Edit
                </Link>
              </>
            )
          }
        >
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr]">
            <Card padding={18}>
              <div className="text-ink-soft text-eyebrow-lg uppercase">
                Average
              </div>
              <div className="mt-2 flex items-baseline gap-4">
                <div className="text-ink text-kpi font-serif leading-none">
                  {avgLabel}
                </div>
                {total > 0 && (
                  <CupRating value={Math.round(avg)} size={14} disabled />
                )}
              </div>
              <div className="text-ink-muted text-meta mt-2">
                {total} ratings · {comments.length} comments
              </div>
            </Card>

            <Card padding={18}>
              <RatingForm tea={tea} />
            </Card>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr]">
            <Card>
              <SectionHead
                title="Rating distribution"
                sub="How students actually scored it"
              />
              {tea.reviews.length ? (
                <>
                  <RatingHistogram dist={tea.distribution} />
                  <div className="text-ink-muted text-meta border-ink/6 mt-4 border-t pt-4">
                    Distribution is{" "}
                    {interpretRatingDistribution(tea.distribution)}
                  </div>
                </>
              ) : (
                <div className="text-ink-soft text-meta flex items-center justify-center p-4">
                  No reviews yet.
                </div>
              )}
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
      </main>
    </div>
  );
}
