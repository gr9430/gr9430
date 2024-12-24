let currentIndex = 0;

function initializeCarousel() {
    const images = document.querySelectorAll('.carousel-image');
    const prevButton = document.querySelector('.carousel-btn.left');
    const nextButton = document.querySelector('.carousel-btn.right');
    const carouselWrapper = document.querySelector('.carousel-wrapper');

    const totalImages = images.length;

    // Function to show image based on currentIndex
    function showImage(index) {
        if (index >= totalImages) {
            currentIndex = 0; // Loop back to start
        } else if (index < 0) {
            currentIndex = totalImages - 1; // Loop to end
        }

        // Calculate offset to slide images horizontally
        const offset = -currentIndex * 100; // Move wrapper to show the current image
        carouselWrapper.style.transform = `translateX(${offset}%)`;
    }

    // Show the initial image
    showImage(currentIndex);

    // Event listeners for buttons
    prevButton.addEventListener('click', () => {
        currentIndex--;
        showImage(currentIndex);
    });

    nextButton.addEventListener('click', () => {
        currentIndex++;
        showImage(currentIndex);
    });
}

// Initialize the carousel when DOM content is fully loaded
document.addEventListener("DOMContentLoaded", initializeCarousel);