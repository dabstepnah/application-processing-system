export const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? "text-appAccent" : "text-zinc-600"}>★</span>
    ))}
  </div>
);
