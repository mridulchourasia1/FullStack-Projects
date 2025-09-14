// Delete review button event delegation
document.getElementById('existingReviewsContainer').addEventListener('click', async (e) => {
  if (e.target && e.target.classList.contains('delete-review-btn')) {
    const reviewId = e.target.getAttribute('data-review-id');
    if (!reviewId) return;

    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Remove review from UI
        const reviewDiv = document.getElementById(`review-${reviewId}`);
        if (reviewDiv) {
          reviewDiv.remove();
        }
      } else {
        alert('Failed to delete review.');
      }
    } catch (error) {
      alert('Error deleting review.');
    }
  }
});

document.getElementById('submitReviewBtn').addEventListener('click', async () => {
  // Get rating from starability radio inputs
  const ratingInputs = document.getElementsByName('rating');
  let rating = '';
  for (const input of ratingInputs) {
    if (input.checked) {
      rating = input.value;
      break;
    }
  }
  const comment = document.getElementById('review').value;
  const reviewMessage = document.getElementById('reviewMessage');
  const newReviewsContainer = document.getElementById('newReviewsContainer');
  reviewMessage.textContent = '';
  reviewMessage.style.display = 'none';

if (!rating && !comment.trim()) {
    reviewMessage.textContent = 'Please fill the rating and review.';
    reviewMessage.style.color = 'red';
    reviewMessage.style.display = 'block';
    return;
  }
  if (!rating) {
    reviewMessage.textContent = 'Please select a rating.';
    reviewMessage.style.color = 'red';
    reviewMessage.style.display = 'block';
    return;
  }
  if (!comment.trim()) {
    reviewMessage.textContent = 'Please fill the review.';
    reviewMessage.style.color = 'red';
    reviewMessage.style.display = 'block';
    return;
  }

  try {
    console.log('Submitting review:', { rating, comment });
    // Fix URL to remove duplicate 'listing' segment if present
    let url = window.location.pathname;
    if (url.includes('/listing/')) {
      url = url.replace('/listing/', '/');
    }
    url += '/reviews';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating, comment }),
      credentials: 'include' // Include cookies for session
    });

    console.log('Response status:', response.status);

    if (response.ok) {
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        reviewMessage.textContent = 'Error parsing server response.';
        reviewMessage.style.color = 'red';
        return;
      }

reviewMessage.textContent = 'Review submitted successfully!';
      reviewMessage.style.color = 'blue';

      // Clear form fields
      // Clear star rating inputs
      const ratingInputs = document.getElementsByName('rating');
      for (const input of ratingInputs) {
        input.checked = false;
      }
      document.getElementById('review').value = '';

      // Create new review element with rating and comment in Bootstrap card format
      const newReviewCol = document.createElement('div');
      newReviewCol.classList.add('col-md-6', 'mb-3');

      const newReviewDiv = document.createElement('div');
      newReviewDiv.classList.add('card', 'new-review');
      newReviewDiv.style.maxWidth = '100%';

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const ratingP = document.createElement('h5');
      ratingP.classList.add('card-title');
      ratingP.textContent = `Rating: ${data.review.rating} / 5`;
      cardBody.appendChild(ratingP);

      const commentP = document.createElement('p');
      commentP.classList.add('card-text');
      commentP.textContent = data.review.comment;
      cardBody.appendChild(commentP);

      newReviewDiv.appendChild(cardBody);
      newReviewCol.appendChild(newReviewDiv);

      // Prepend the new review column before the review section
      newReviewsContainer.prepend(newReviewCol);

    } else {
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        reviewMessage.textContent = 'Failed to submit review.';
        reviewMessage.style.color = 'red';
        return;
      }
      reviewMessage.textContent = data.error || 'Failed to submit review.';
      reviewMessage.style.color = 'red';
      console.error('Server error message:', data.error);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    reviewMessage.textContent = 'Error submitting review.';
    reviewMessage.style.color = 'red';
  }
});
