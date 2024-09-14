
const recipes = [
    {
        label: "Spaghetti Carbonara",
        image: "Spaghetti Carbonara.jpeg",
        type: "veg", // Vegetarian recipe
        ingredients: [
            "200g spaghetti",
            "100g pancetta",
            "2 large eggs",
            "50g pecorino cheese",
            "50g parmesan cheese",
            "Freshly ground black pepper",
            "Salt"
        ],
        instructions: `
            1. Cook the spaghetti in a large pot of salted boiling water until al dente.
            2. Meanwhile, fry the pancetta in a pan until crispy.
            3. Beat the eggs in a bowl and stir in the cheeses.
            4. Drain the spaghetti and mix with pancetta.
            5. Remove from heat and quickly stir in the egg mixture. Toss until the spaghetti is coated.
            6. Serve with extra cheese and black pepper.
        `
    },
    {
        label: "Chicken Alfredo",
        image: "Chicken Alfredo Recipe.jpeg",
        type: "nonveg", // Non-vegetarian recipe
        ingredients: [
            "200g fettuccine",
            "2 chicken breasts",
            "2 tbsp butter",
            "200ml heavy cream",
            "50g parmesan cheese",
            "Salt and pepper"
        ],
        instructions: `
            1. Cook the fettuccine in a large pot of salted boiling water until al dente.
            2. Cook the chicken breasts in a pan until browned and fully cooked. Slice them thinly.
            3. In a pan, melt butter and stir in the heavy cream. Add parmesan and stir until melted.
            4. Combine the fettuccine with the sauce and top with chicken slices.
            5. Serve with extra parmesan and pepper.
        `
    }
];

// Get references to DOM elements
const searchInput = document.querySelector('#searchInput');
const resultsList = document.querySelector('#results');
const favoriteResultsList = document.querySelector('#favoriteResults');
const selectedRecipeContainer = document.querySelector('#selectedRecipe');
const searchButton = document.querySelector("#searchButton");
const filterDropdown = document.querySelector('#filterOption');

// Load favorite recipes and reviews from local storage
const favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
const recipeReviews = JSON.parse(localStorage.getItem('recipeReviews')) || {};

// Event listener for search button
searchButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default form submission
    searchRecipes();    // Call the search function
});

// Event listener for the filter dropdown
filterDropdown.addEventListener('change', () => {
    searchRecipes(); // Re-run the search when the filter changes
});

// Function to search and filter recipes
function searchRecipes() {
    const searchValue = searchInput.value.trim().toLowerCase(); // Get input and convert to lowercase
    const filterValue = filterDropdown.value; // Get the filter value
    
    // Filter recipes based on the search input and the filter option
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.label.toLowerCase().includes(searchValue);
        const matchesFilter = filterValue === 'all' || recipe.type === filterValue;
        return matchesSearch && matchesFilter;
    });

    displayRecipes(filteredRecipes); // Display the filtered recipes
}

// Function to toggle favorite status
function toggleFavorite(recipeLabel) {
    const index = favoriteRecipes.indexOf(recipeLabel);
    if (index === -1) {
        // Add to favorites
        favoriteRecipes.push(recipeLabel);
    } else {
        // Remove from favorites
        favoriteRecipes.splice(index, 1);
    }
    localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));
    displayFavoriteRecipes(); // Refresh the favorite recipes list
}

// Function to display the filtered recipes
function displayRecipes(filteredRecipes) {
    let html = ''; // Initialize HTML variable
    
    if (filteredRecipes.length > 0) {
        // If recipes are found, generate HTML for each recipe
        filteredRecipes.forEach((recipe) => {
            const isFavorite = favoriteRecipes.includes(recipe.label);
            html += `
            <li class="recipe-item">
                <div class="recipe-image">
                    <img src="${recipe.image}" alt="${recipe.label}" onclick="displayRecipeDetails('${recipe.label}')">
                    <h3>${recipe.label}</h3>
                </div>
                <div class="recipe-actions">
                    <button onclick="toggleFavorite('${recipe.label}')">
                        ${isFavorite ? 'Unfavorite' : 'Favorite'}
                    </button>
                </div>
            </li>
            `;
        });
    } else {
        // Show a message if no recipes are found
        html = '<li class="recipe-item"><h3>No recipes found. Try searching for something else!</h3></li>';
    }
    
    resultsList.innerHTML = html; // Update the results list with the generated HTML
    displayFavoriteRecipes(); // Update the favorite recipes list
}

// Function to display the recipe details when clicking the image
function displayRecipeDetails(recipeLabel) {
    const recipe = recipes.find(r => r.label === recipeLabel);
    
    if (recipe) {
        const recipeReview = recipeReviews[recipeLabel] || { rating: 0, comments: [] };
        
        selectedRecipeContainer.innerHTML = `
            <h3>${recipe.label}</h3>
            <div class="recipe-ingredients">
                <h4>Ingredients:</h4>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            <div class="recipe-instructions">
                <h4>Instructions:</h4>
                ${recipe.instructions.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>

            <div class="recipe-rating">
                <h4>Rate this recipe:</h4>
                ${generateStarRating(recipeLabel)}
            </div>

            <div class="recipe-comments">
                <h4>Comments:</h4>
                <textarea id="commentInput" placeholder="Add your comment"></textarea>
                <button onclick="addComment('${recipeLabel}')">Submit Comment</button>
                <div id="commentsList">
                    ${displayComments(recipeLabel)}
                </div>
            </div>
        `;
    }
}

// Function to generate star rating for each recipe
function generateStarRating(recipeLabel) {
    const currentRating = recipeReviews[recipeLabel]?.rating || 0;
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        starsHtml += `
            <span class="star" onclick="rateRecipe('${recipeLabel}', ${i})">
                ${i <= currentRating ? '★' : '☆'}
            </span>
        `;
    }
    
    return starsHtml;
}

// Function to rate a recipe
function rateRecipe(recipeLabel, rating) {
    if (!recipeReviews[recipeLabel]) {
        recipeReviews[recipeLabel] = { comments: [], rating: 0 };
    }
    
    recipeReviews[recipeLabel].rating = rating;
    localStorage.setItem('recipeReviews', JSON.stringify(recipeReviews));
    displayRecipeDetails(recipeLabel); // Update the recipe details to show the new rating
}

// Function to add a comment for a recipe
function addComment(recipeLabel) {
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();
    
    if (comment !== "") {
        if (!recipeReviews[recipeLabel]) {
            recipeReviews[recipeLabel] = { comments: [], rating: 0 };
        }
        
        recipeReviews[recipeLabel].comments.push(comment);
        localStorage.setItem('recipeReviews', JSON.stringify(recipeReviews));
        commentInput.value = ''; // Clear the input field
        displayRecipeDetails(recipeLabel); // Update the recipe details to show the new comment
    }
}

// Function to display comments for a recipe
function displayComments(recipeLabel) {
    const comments = recipeReviews[recipeLabel]?.comments || [];
    
    if (comments.length === 0) {
        return "<p>No comments yet. Be the first to comment!</p>";
    }
    
    return comments.map(comment => `<p>${comment}</p>`).join('');
}

// Function to display favorite recipes
function displayFavoriteRecipes() {
    let html = '';
    
    if (favoriteRecipes.length > 0) {
        favoriteRecipes.forEach((recipeLabel) => {
            const recipe = recipes.find(r => r.label === recipeLabel);
            html += `
            <li class="favorite-recipe-item">
                <div class="recipe-image">
                    <img src="${recipe.image}" alt="${recipe.label}" onclick="displayRecipeDetails('${recipe.label}')">
                    <h3>${recipe.label}</h3>
                </div>
                <div class="recipe-actions">
                    <button onclick="toggleFavorite('${recipe.label}')">Remove Favorite</button>
                </div>
            </li>
            `;
        });
    } else {
        html = '<li><h3>No favorite recipes yet!</h3></li>';
    }
    
    favoriteResultsList.innerHTML = html; // Update the favorite recipes list with the generated HTML
}
