// DOM Elements
const recipesContainer = document.getElementById('recipes-container');
const addRecipeBtn = document.getElementById('add-recipe-btn');
const recipeModal = document.getElementById('recipe-modal');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancel-btn');
const recipeForm = document.getElementById('recipe-form');
const modalTitle = document.getElementById('modal-title');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// State
let recipes = [];
let isEditing = false;
let currentRecipeId = null;
let currentCategory = 'all';
let currentSearch = '';

// Sample Data (in a real app, you would fetch this from an API)
const sampleRecipes = [
    {
        id: 1,
        title: 'Avocado Toast',
        category: 'breakfast',
        image: 'https://images.unsplash.com/photo-1628556820645-63ba5f90e6a2?q=80&w=1664&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        description: 'Simple yet delicious avocado toast with a sprinkle of chili flakes.',
        ingredients: '2 slices bread\n1 ripe avocado\n1 tbsp olive oil\nSalt and pepper\nChili flakes',
        instructions: 'Cut the avocado in half and carefully remove its stone, then scoop out the flesh into a bowl. Squeeze in the lemon juice then mash with a fork to your desired texture. Season to taste with sea salt, black pepper and chilli flakes. Toast your bread, drizzle over the oil then pile the avocado on top.',
        prepTime: 15,
        difficulty: 'Easy'
    },
    {
        id: 2,
        title: 'Greek Salad',
        category: 'lunch',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        description: 'Fresh and healthy Greek salad with feta cheese and olives.',
        ingredients: '1 cucumber\n2 tomatoes\n1 red onion\n200g feta cheese\nKalamata olives\nOlive oil\nOregano',
        instructions: '1. Chop all vegetables\n2. Add olives and feta\n3. Dress with olive oil and oregano',
        prepTime: 15,
        difficulty: 'Easy'
    },
    {
        id: 3,
        title: 'Beef Bourguignon',
        category: 'dinner',
        image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143',
        description: 'Classic French beef stew cooked in red wine.',
        ingredients: '1kg beef chuck\n200g bacon\n500g mushrooms\n3 carrots\n2 onions\n750ml red wine\nBeef stock\nGarlic\nThyme\nBay leaves',
        instructions: '1. Brown the beef\n2. Cook bacon and vegetables\n3. Add wine and herbs\n4. Simmer for 3 hours',
        prepTime: 180,
        difficulty: 'Hard'
    },
    {
        id: 4,
        title: 'Chocolate Lava Cake',
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e',
        description: 'Decadent chocolate cake with a molten center.',
        ingredients: '200g dark chocolate\n200g butter\n4 eggs\n200g sugar\n100g flour',
        instructions: '1. Melt chocolate and butter\n2. Whisk eggs and sugar\n3. Combine all ingredients\n4. Bake at 200°C for 12 minutes',
        prepTime: 25,
        difficulty: 'Medium'
    }
];

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
addRecipeBtn.addEventListener('click', openAddRecipeModal);
closeModal.addEventListener('click', closeRecipeModal);
cancelBtn.addEventListener('click', closeRecipeModal);
recipeForm.addEventListener('submit', handleRecipeSubmit);
searchInput.addEventListener('input', handleSearch);
filterBtns.forEach(btn => btn.addEventListener('click', handleFilter));
hamburger.addEventListener('click', toggleMobileMenu);

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
        closeRecipeModal();
    }
});

// Initialize the application
function initializeApp() {
    recipes = [...sampleRecipes];
    renderRecipes();
}

// Render recipes to the DOM
function renderRecipes() {
    recipesContainer.innerHTML = '';
    
    const filteredRecipes = recipes.filter(recipe => {
        const matchesCategory = currentCategory === 'all' || recipe.category === currentCategory;
        const matchesSearch = recipe.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                             recipe.description.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    if (filteredRecipes.length === 0) {
        recipesContainer.innerHTML = '<p class="no-recipes">No recipes found. Try a different search or category.</p>';
        return;
    }
    
    filteredRecipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <div class="recipe-image">
                <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${recipe.title}">
            </div>
            <div class="recipe-content">
                <span class="recipe-category ${recipe.category}">${recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}</span>
                <h3 class="recipe-title">${recipe.title}</h3>
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-meta">
                    <span class="recipe-time">${recipe.prepTime} mins</span>
                    <span class="recipe-difficulty ${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</span>
                </div>
                <div class="recipe-actions">
                    <button class="btn secondary edit-btn" data-id="${recipe.id}">Edit</button>
                    <button class="btn danger delete-btn" data-id="${recipe.id}">Delete</button>
                </div>
            </div>
        `;
        recipesContainer.appendChild(recipeCard);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openEditRecipeModal(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteRecipe(e.target.dataset.id));
    });
}

// Open modal for adding a new recipe
function openAddRecipeModal() {
    isEditing = false;
    currentRecipeId = null;
    modalTitle.textContent = 'Add New Recipe';
    recipeForm.reset();
    recipeModal.style.display = 'block';
}

// Open modal for editing an existing recipe
function openEditRecipeModal(recipeId) {
    const recipe = recipes.find(r => r.id == recipeId);
    if (!recipe) return;
    
    isEditing = true;
    currentRecipeId = recipeId;
    modalTitle.textContent = 'Edit Recipe';
    
    // Fill the form with recipe data
    document.getElementById('category').value = recipe.category;
    document.getElementById('title').value = recipe.title;
    document.getElementById('image').value = recipe.image || '';
    document.getElementById('description').value = recipe.description;
    document.getElementById('ingredients').value = recipe.ingredients;
    document.getElementById('instructions').value = recipe.instructions;
    document.getElementById('prep-time').value = recipe.prepTime;
    document.getElementById('difficulty').value = recipe.difficulty;
    document.getElementById('recipe-id').value = recipe.id;
    
    recipeModal.style.display = 'block';
}

// Close the modal
function closeRecipeModal() {
    recipeModal.style.display = 'none';
}

// Handle form submission (POST for new, PATCH for edit)
function handleRecipeSubmit(e) {
    e.preventDefault();
    
    const recipeData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value,
        ingredients: document.getElementById('ingredients').value,
        instructions: document.getElementById('instructions').value,
        prepTime: parseInt(document.getElementById('prep-time').value),
        difficulty: document.getElementById('difficulty').value
    };
    
    if (isEditing) {
        updateRecipe(currentRecipeId, recipeData);
    } else {
        addRecipe(recipeData);
    }
}

// Add a new recipe
function addRecipe(recipeData) {
    const newRecipe = {
        id: Date.now(),
        ...recipeData
    };
    
    recipes.push(newRecipe);
    renderRecipes();
    closeRecipeModal();
    showAlert('Recipe added successfully!', 'success');
}

// Update an existing recipe
function updateRecipe(recipeId, recipeData) {
    const index = recipes.findIndex(r => r.id == recipeId);
    if (index !== -1) {
        recipes[index] = { ...recipes[index], ...recipeData };
        renderRecipes();
        closeRecipeModal();
        showAlert('Recipe updated successfully!', 'success');
    }
}

// Delete a recipe
function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    recipes = recipes.filter(recipe => recipe.id != recipeId);
    renderRecipes();
    showAlert('Recipe deleted successfully!', 'success');
}

// Handle search input
function handleSearch(e) {
    currentSearch = e.target.value;
    renderRecipes();
}

// Handle category filter
function handleFilter(e) {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    renderRecipes();
}

// Toggle mobile menu
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
}

// Show alert message
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Add alert styles to the page
const style = document.createElement('style');
style.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }
    
    .alert.success {
        background-color: var(--success-color);
    }
    
    .alert.error {
        background-color: var(--danger-color);
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .no-recipes {
        text-align: center;
        grid-column: 1 / -1;
        padding: 2rem;
        color: #666;
    }
`;
document.head.appendChild(style);