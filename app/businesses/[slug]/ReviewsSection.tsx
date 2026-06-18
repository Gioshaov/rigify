import { formatTbilisi } from "@/lib/utils/datetime";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type ReviewsSectionProps = {
  businessName: string;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
};

function StarRating({ rating, size = "default" }: { rating: number; size?: "default" | "large" }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const sizeClass = size === "large" ? "text-[24px]" : "text-[18px]";

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined ${sizeClass} ${
            star <= rating ? "text-primary" : "text-white/10"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export function ReviewsSection({ businessName, averageRating, reviewCount, reviews }: ReviewsSectionProps) {
  if (reviewCount === 0) {
    return (
      <section data-testid="reviews-section">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-6 bg-primary"></div>
          <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
            Reviews
          </h2>
        </div>
        <div className="bg-surface-container border border-white/5 p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-[32px]">star_rate</span>
          </div>
          <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
            No reviews yet. Be the first to review {businessName}!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="reviews-section">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-1 h-6 bg-primary"></div>
          <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold uppercase tracking-tight">
            Reviews
          </h2>
        </div>
        <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant">
          {reviewCount} {reviewCount === 1 ? 'REVIEW' : 'REVIEWS'}
        </span>
      </div>

      {/* Average Rating Card */}
      <div className="bg-surface-container border border-white/5 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="font-hanken text-[48px] leading-[1] font-bold text-primary mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size="large" />
            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-2">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            data-testid={`review-${review.id}`}
            className="bg-surface-container-low border border-white/10 p-6 hover:border-primary/30 transition-colors"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-hanken text-[18px] leading-[1.4] font-semibold text-white mb-1">
                  {review.customer_name}
                </p>
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                  {formatTbilisi(review.created_at, "MMM d, yyyy")}
                </p>
              </div>
              <StarRating rating={review.rating} />
            </div>

            {/* Review Comment */}
            {review.comment && (
              <p className="font-hanken text-[16px] leading-[1.6] font-normal text-on-surface-variant">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
