import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Star, ThumbsUp, Edit2, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ReviewForm } from "./ReviewForm";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  photos: string[];
  visit_date: string;
  helpful_count: number;
  created_at: string;
  user_profiles: {
    username: string;
    display_name: string;
    profile_photo: string;
  };
}

interface ReviewsListProps {
  destinationSlug: string;
  destinationName: string;
}

export function ReviewsList({ destinationSlug, destinationName }: ReviewsListProps) {
  const supabase = getSupabaseClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [destinationSlug]);

  useEffect(() => {
    if (currentUser) {
      fetchHelpfulVotes();
    }
  }, [currentUser, reviews]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user_profiles (
            username,
            display_name,
            profile_photo
          )
        `)
        .eq('destination_slug', destinationSlug)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHelpfulVotes = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('review_helpful')
        .select('review_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setHelpfulVotes(new Set(data?.map(v => v.review_id) || []));
    } catch (error) {
      console.error("Error fetching helpful votes:", error);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (!currentUser) {
      toast.error("Please sign in to vote");
      return;
    }

    const isHelpful = helpfulVotes.has(reviewId);

    try {
      if (isHelpful) {
        // Remove vote
        const { error } = await supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setHelpfulVotes(prev => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      } else {
        // Add vote
        const { error } = await supabase
          .from('review_helpful')
          .insert({
            review_id: reviewId,
            user_id: currentUser.id
          });

        if (error) throw error;

        setHelpfulVotes(prev => new Set(prev).add(reviewId));
      }

      // Refresh reviews to get updated helpful count
      fetchReviews();
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error("Failed to record vote");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success("Review deleted");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse text-gray-400">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold">{averageRating}</span>
              </div>
              <span className="text-gray-500">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {currentUser && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm
            destinationSlug={destinationSlug}
            destinationName={destinationName}
            existingReview={editingReview ? {
              id: editingReview.id,
              rating: editingReview.rating,
              title: editingReview.title,
              content: editingReview.content,
              photos: editingReview.photos,
              visit_date: editingReview.visit_date
            } : undefined}
            onSuccess={handleReviewSuccess}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No reviews yet</p>
          {currentUser && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Be the First to Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {review.user_profiles?.profile_photo ? (
                      <img
                        src={review.user_profiles.profile_photo}
                        alt={review.user_profiles.display_name || review.user_profiles.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">
                        {(review.user_profiles?.display_name || review.user_profiles?.username || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="font-semibold">
                      {review.user_profiles?.display_name || review.user_profiles?.username || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatDate(review.created_at)}</span>
                      {review.visit_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Visited {formatDate(review.visit_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit/Delete Buttons */}
                {currentUser?.id === review.user_id && !showReviewForm && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(review.rating)}
              </div>

              {/* Title */}
              {review.title && (
                <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
              )}

              {/* Content */}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.content}</p>

              {/* Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {review.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleHelpfulVote(review.id)}
                  disabled={!currentUser}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    helpfulVotes.has(review.id)
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsUp className={`h-4 w-4 ${helpfulVotes.has(review.id) ? 'fill-current' : ''}`} />
                  <span className="text-sm">
                    Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

