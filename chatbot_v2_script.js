// =================================================================
// Recipe Generator functionality
// =================================================================

/**
 * Displays the generated recipe with a typewriter effect
 * @param {Object} response - The API response containing the recipe
 */
function displayRecipe(response) {
  console.log("Recipe generated");
  const recipeElement = document.querySelector("#recipe");
  
  // Create loading animation and clear it once typewriter is done
  recipeElement.innerHTML = '';
  
  new Typewriter("#recipe", {
    strings: response.data.answer,
    autoStart: true,
    delay: 30,
    cursor: "",
    onComplete: (typewriter) => {
      // Add a subtle fade-in animation to the completed recipe
      recipeElement.style.opacity = '0.7';
      setTimeout(() => {
        recipeElement.style.opacity = '1';
      }, 200);
    }
  });
}

/**
 * Generates a recipe based on user input via API call
 * @param {Event} event - Form submission event
 */
function generateRecipe(event) {
  event.preventDefault();
  let instructions = document.querySelector("#user-instructions").value.trim();
  
  if (!instructions) {
    alert("Please enter what you'd like a recipe for!");
    return;
  }
  
  let apiKey = "16t1b3fa04b8866116ccceb0d2do3a04";
  let prompt = `User instructions are: Generate a recipe for ${instructions}`;
  let context =
    "You are an expert at recipes. Your mission is to generate a short and easy recipe in basic HTML. Make sure to follow user instructions. Sign the recipe at the end with '<strong>Thank You</strong>' in bold";

  let apiUrl = `https://api.shecodes.io/ai/v1/generate?prompt=${encodeURIComponent(prompt)
  }&context=${encodeURIComponent(context)}&key=${apiKey}`;

  let recipeElement = document.querySelector("#recipe");
  recipeElement.classList.remove("hidden");
  recipeElement.innerHTML = `<div class="blink">👩🏽‍🍳 Generating recipe for ${instructions}...</div>`;

  console.log("Generating recipe");
  
  // Add loading animation to the button
  const submitButton = document.querySelector(".submit-button");
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Generating...";
  submitButton.disabled = true;
  
  axios.get(apiUrl)
    .then(displayRecipe)
    .catch(error => {
      recipeElement.innerHTML = `<div>Sorry, we couldn't generate a recipe right now. Please try again later.</div>`;
      console.error("Error generating recipe:", error);
    })
    .finally(() => {
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
}

// =================================================================
// Cuisine suggestions functionality
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  const mealCardsRight = document.querySelectorAll('.meal-card-right');
  const recipeInput = document.querySelector("#user-instructions");

  // Cuisine food ideas data object
  const cuisineFoodIdeas = {
    "Italian": ["pasta", "pizza", "risotto", "lasagna", "gnocchi", "tiramisu", "carbonara", "bruschetta"],
    "French": ["soup", "crepes", "ratatouille", "quiche", "macarons", "boeuf bourguignon", "coq au vin", "crème brûlée"],
    "Mexican": ["tacos", "enchiladas", "burritos", "salsa", "guacamole", "churros", "quesadilla", "mole poblano"],
    "Chinese": ["noodles", "stir-fry", "dumplings", "fried rice", "spring rolls", "Peking duck", "kung pao chicken", "hot pot"],
    "Indian": ["curry", "biryani", "naan", "samosa", "tikka masala", "jalebi", "butter chicken", "dal makhani"],
    "Japanese": ["sushi", "ramen", "tempura", "miso soup", "yakitori", "mochi", "udon", "teriyaki chicken"],
    "Thai": ["curry", "pad thai", "tom yum soup", "stir-fry", "spring rolls", "mango sticky rice", "green curry", "pad see ew"],
    "Greek": ["salad", "gyros", "souvlaki", "moussaka", "spanakopita", "baklava", "tzatziki", "dolmades"]
  };

  // Create an object to store the suggestion container for each card
  const suggestionContainers = {};
  let currentlyOpenCard = null; // Keep track of the currently open card

  mealCardsRight.forEach(card => {
    // Create a suggestion container for this card
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.classList.add('suggestions-container');
    suggestionsContainer.style.display = 'none'; // Initially hide the container
    suggestionContainers[card.dataset.cuisine] = suggestionsContainer;
    card.parentNode.insertBefore(suggestionsContainer, card.nextSibling); // Insert below the card

    // Add a visual indicator for clickable cards
    card.innerHTML += '<span class="dropdown-indicator">▼</span>';

    card.addEventListener('click', function() {
      const cuisine = this.dataset.cuisine;
      const foodIdeas = cuisineFoodIdeas[cuisine];
      const currentContainer = suggestionContainers[cuisine];

      // Close the previously open card's suggestions if it's not the current card
      if (currentlyOpenCard && currentlyOpenCard !== this) {
        const previousCuisine = currentlyOpenCard.dataset.cuisine;
        suggestionContainers[previousCuisine].style.display = 'none';
        currentlyOpenCard.querySelector('.dropdown-indicator').textContent = '▼';
      }

      // Toggle the display of the current card's suggestions
      if (currentContainer.style.display === 'none') {
        currentContainer.innerHTML = ''; // Clear previous suggestions
        if (foodIdeas && foodIdeas.length > 0) {
          const suggestionsList = document.createElement('ul');

          foodIdeas.forEach(food => {
            const listItem = document.createElement('li');
            listItem.textContent = food;
            listItem.addEventListener('click', (event) => {
              event.stopPropagation(); // Prevent the card's click event from firing again
              if (recipeInput) {
                recipeInput.value = food;
                // Auto-scroll to the input form
                recipeInput.scrollIntoView({ behavior: 'smooth' });
                recipeInput.focus();
              }
              currentContainer.style.display = 'none'; // Close suggestions after selection
              this.querySelector('.dropdown-indicator').textContent = '▼';
              currentlyOpenCard = null;
            });
            suggestionsList.appendChild(listItem);
          });
          currentContainer.appendChild(suggestionsList);
          currentContainer.style.display = 'block';
          this.querySelector('.dropdown-indicator').textContent = '▲';
          currentlyOpenCard = this; // Set the current card as open
        } else {
          const noSuggestions = document.createElement('p');
          noSuggestions.textContent = `No suggestions for ${cuisine} yet.`;
          currentContainer.appendChild(noSuggestions);
          currentContainer.style.display = 'block';
          this.querySelector('.dropdown-indicator').textContent = '▲';
          currentlyOpenCard = this;
        }
      } else {
        currentContainer.style.display = 'none';
        this.querySelector('.dropdown-indicator').textContent = '▼';
        currentlyOpenCard = null; // No card is open
      }
    });
  });

  // Close suggestion dropdowns when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.meal-card-right') && !event.target.closest('.suggestions-container')) {
      for (const cuisine in suggestionContainers) {
        suggestionContainers[cuisine].style.display = 'none';
        const card = document.querySelector(`.meal-card-right[data-cuisine="${cuisine}"]`);
        if (card && card.querySelector('.dropdown-indicator')) {
          card.querySelector('.dropdown-indicator').textContent = '▼';
        }
      }
      currentlyOpenCard = null;
    }
  });
});

// =================================================================
// Calorie Calculator functionality
// =================================================================

document.getElementById("calorieForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const activity = parseFloat(document.getElementById("activity").value);

  // Validate inputs
  if (isNaN(age) || isNaN(height) || isNaN(weight)) {
    document.getElementById("result").textContent = "Please enter valid numbers.";
    return;
  }

  if (age < 15 || age > 80) {
    document.getElementById("result").textContent = "Please enter an age between 15 and 80.";
    return;
  }

  if (height < 130 || height > 230) {
    document.getElementById("result").textContent = "Please enter a height between 130cm and 230cm.";
    return;
  }

  if (weight < 40 || weight > 160) {
    document.getElementById("result").textContent = "Please enter a weight between 40kg and 160kg.";
    return;
  }

  // Calculate BMR based on gender
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Calculate daily calorie needs
  const calories = Math.round(bmr * activity);
  
  // Create result with animation
  const resultElement = document.getElementById("result");
  resultElement.textContent = '';
  resultElement.style.opacity = '0';
  
  setTimeout(() => {
    resultElement.textContent = `You need approximately ${calories} calories/day.`;
    resultElement.style.opacity = '1';
  }, 300);
});

// =================================================================
// Initialize event listeners
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
  let recipeForm = document.querySelector("#recipe-generator-form");
  recipeForm.addEventListener("submit", generateRecipe);
});
