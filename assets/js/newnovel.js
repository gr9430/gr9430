let jsonData;
let ratedBooksCount = 0;
let totalBooksRated = 0;
let genreRatings = {
    "Proto-New Novel": 0,
    "New Novel Core Works": 0,
    "Post-New Novel": 0
};
let topAuthors = [];
let topGenres = [];
let displayedBooks = [];
let allRatedBooks = new Set();

// Function to fetch JSON data from an external file
function fetchJsonData() {
    fetch('new_novel.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            jsonData = data;
            displayedBooks = getRandomBooks(jsonData, 10);
            displayBooks(displayedBooks);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
}

// Function to get random books excluding already rated books
function getRandomBooks(jsonData, count) {
    const books = [
        ...jsonData.Proto_New_Novel_Precursors_to_the_Movement_Before_1948.map(book => ({ ...book, genre: "Proto-New Novel" })),
        ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Key_Authors.map(book => ({ ...book, genre: "New Novel Core Works" })),
        ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Other_Authors_Aligning_with_the_Movement.map(book => ({ ...book, genre: "New Novel Core Works" })),
        ...jsonData.Post_New_Novel_Influenced_by_the_Movement_1966_Present.map(book => ({ ...book, genre: "Post-New Novel" }))
    ].filter(book => !allRatedBooks.has(book.title));
    return books.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Function to display books with rating options
function displayBooks(books) {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";
    books.forEach((book, index) => {
        const bookContainer = document.createElement("div");
        bookContainer.className = "book-container";

        const bookTitle = document.createElement("div");
        bookTitle.className = "book-title";
        bookTitle.textContent = `${book.title} by ${book.author} (${book.year}, ${book.country})`;

        const bookDescription = document.createElement("div");
        bookDescription.textContent = book.description;

        const ratingOptions = document.createElement("div");
        ratingOptions.className = "rating-options";
        [1, 2, 3, 4, 5].forEach(rating => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `rating-${index}`;
            input.value = rating;
            label.appendChild(input);
            label.appendChild(document.createTextNode(rating));
            ratingOptions.appendChild(label);
        });
        const notReadLabel = document.createElement("label");
        const notReadInput = document.createElement("input");
        notReadInput.type = "radio";
        notReadInput.name = `rating-${index}`;
        notReadInput.value = "not-read";
        notReadLabel.appendChild(notReadInput);
        notReadLabel.appendChild(document.createTextNode("Haven't read it"));
        ratingOptions.appendChild(notReadLabel);

        bookContainer.appendChild(bookTitle);
        bookContainer.appendChild(bookDescription);
        bookContainer.appendChild(ratingOptions);
        bookList.appendChild(bookContainer);
    });
}

// Function to handle ratings submission
function handleRatingsSubmission() {
    const ratings = document.querySelectorAll("input[type='radio']:checked");
    ratedBooksCount = 0;
    const authorRatings = {};

    ratings.forEach(rating => {
        if (rating.value !== "not-read") {
            ratedBooksCount++;
            const bookIndex = parseInt(rating.name.split("-")[1]);
            const book = displayedBooks[bookIndex];
            const genre = book.genre;
            const author = book.author;

            allRatedBooks.add(book.title);

            if (parseInt(rating.value) >= 3) {
                genreRatings[genre]++;
                authorRatings[author] = (authorRatings[author] || 0) + 1;
            }
        }
    });

    totalBooksRated += ratedBooksCount;

    // Determine top authors and top genres
    topAuthors = Object.entries(authorRatings).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([author]) => author);
    topGenres = Object.entries(genreRatings).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([genre]) => genre);

    updateProgressBar();
    displayRatingSummary();
    displayTopGenres();
    toggleButtons();
}

// Function to update progress bar
function updateProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    const progressPercentage = (totalBooksRated / 20) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${Math.min(progressPercentage, 100)}%`;
}

// Function to display rating summary
function displayRatingSummary() {
    const ratingSummary = document.getElementById("rating-summary");
    ratingSummary.textContent = `You have rated ${totalBooksRated} books.`;
}

// Function to display top three genres
function displayTopGenres() {
    const sortedGenres = Object.entries(genreRatings).sort((a, b) => b[1] - a[1]);
    const topGenresText = sortedGenres.slice(0, 3).map(([genre, count]) => `${genre}: ${count} likes`).join(", ");
    const topGenresDiv = document.getElementById("top-genres");
    topGenresDiv.textContent = `Top genres based on your ratings: ${topGenresText}`;
}

// Function to display book recommendations based on top authors and genres
function displayRecommendations() {
    const recommendationsDiv = document.getElementById("recommendation");
    recommendationsDiv.innerHTML = "";

    let recommendedBooks = [];

    // Recommend books from top authors and top genres that haven't been rated yet
    if (topAuthors.length > 0 && topGenres.length > 0) {
        topAuthors.forEach(author => {
            const allBooks = [
                ...jsonData.Proto_New_Novel_Precursors_to_the_Movement_Before_1948,
                ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Key_Authors,
                ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Other_Authors_Aligning_with_the_Movement,
                ...jsonData.Post_New_Novel_Influenced_by_the_Movement_1966_Present
            ];
            const authorBooks = allBooks.filter(book => 
                book.author === author && !allRatedBooks.has(book.title) && topGenres.includes(book.genre)
            );
            recommendedBooks.push(...authorBooks);
        });
    }

    // Fallback: If no books found matching both authors and genres, try matching either top authors or genres
    if (recommendedBooks.length === 0) {
        topAuthors.forEach(author => {
            const allBooks = [
                ...jsonData.Proto_New_Novel_Precursors_to_the_Movement_Before_1948,
                ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Key_Authors,
                ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Other_Authors_Aligning_with_the_Movement,
                ...jsonData.Post_New_Novel_Influenced_by_the_Movement_1966_Present
            ];
            const authorBooks = allBooks.filter(book => book.author === author && !allRatedBooks.has(book.title));
            recommendedBooks.push(...authorBooks);
        });

        // If still no books, match by top genres alone
        if (recommendedBooks.length === 0) {
            topGenres.forEach(genre => {
                const allBooks = [
                    ...jsonData.Proto_New_Novel_Precursors_to_the_Movement_Before_1948,
                    ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Key_Authors,
                    ...jsonData.New_Novel_Core_Works_of_the_Movement_1948_1965.Other_Authors_Aligning_with_the_Movement,
                    ...jsonData.Post_New_Novel_Influenced_by_the_Movement_1966_Present
                ];
                const genreBooks = allBooks.filter(book => book.genre === genre && !allRatedBooks.has(book.title));
                recommendedBooks.push(...genreBooks);
            });
        }
    }

    // Remove duplicates from the recommended books
    recommendedBooks = [...new Set(recommendedBooks)];

    if (recommendedBooks.length > 0) {
        recommendationsDiv.textContent = "Recommended books based on your top-rated authors and genres:";
        recommendedBooks.slice(0, 3).forEach(book => {  // Limit to 3 recommendations
            const bookContainer = document.createElement("div");
            bookContainer.className = "book-container";
            bookContainer.textContent = `${book.title} by ${book.author} (${book.year}, ${book.country})`;
            recommendationsDiv.appendChild(bookContainer);
        });
    } else {
        recommendationsDiv.textContent = "No recommendations available. Please rate more books.";
    }
}

// Function to toggle buttons after rating submission
function toggleButtons() {
    document.getElementById("submit-button").style.display = "none";
    document.getElementById("more-books-button").style.display = "inline-block";
    document.getElementById("proceed-button").style.display = "inline-block";
}

// Function to handle rating more books
function handleMoreBooks() {
    displayedBooks = getRandomBooks(jsonData, 10);
    displayBooks(displayedBooks);
    document.getElementById("submit-button").style.display = "inline-block";
    document.getElementById("more-books-button").style.display = "none";
    document.getElementById("proceed-button").style.display = "none";
}

// Fetch JSON data and initialize page
fetchJsonData();

// Add event listeners to buttons
document.getElementById("submit-button").addEventListener("click", handleRatingsSubmission);
document.getElementById("more-books-button").addEventListener("click", handleMoreBooks);
document.getElementById("proceed-button").addEventListener("click", displayRecommendations);