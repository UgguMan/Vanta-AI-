/**
 * ChefAI - Application JavaScript
 * Core features: Ingredient/allergy tag systems, form management, local favorites,
 * toast notifications, theme switching, and a comprehensive recipe engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const state = {
    ingredients: [],
    allergies: [],
    cuisine: '',
    diet: '',
    mealType: 'dinner',
    cookingTime: 45,
    difficulty: 'medium',
    servings: 2,
    favorites: JSON.parse(localStorage.getItem('vanta_favorites') || localStorage.getItem('chefai_favorites') || '[]'),
    user: null,
    token: localStorage.getItem('vanta_token') || localStorage.getItem('chefai_token') || null
  };

  // ==========================================
  // UI ELEMENT SELECTORS
  // ==========================================
  // Navigation & Theme
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  const authNavBtn = document.getElementById('auth-nav-btn');
  const authBtnText = document.getElementById('auth-btn-text');
  
  // Ingredients Tag Input
  const ingredientInput = document.getElementById('ingredient-input');
  const ingredientTagsContainer = document.getElementById('ingredient-tags');
  const quickAddIngredients = document.getElementById('quick-add-ingredients');

  // Preferences Form Fields
  const recipeForm = document.getElementById('recipe-form');
  const cuisineSelect = document.getElementById('cuisine-select');
  const dietSelect = document.getElementById('diet-select');
  const mealTypeSelector = document.getElementById('meal-type-selector');
  const cookingTimeSlider = document.getElementById('cooking-time');
  const cookingTimeValue = document.getElementById('cooking-time-value');
  const difficultySelector = document.getElementById('difficulty-selector');
  const servingsCount = document.getElementById('servings-count');
  const servingsDecrease = document.getElementById('servings-decrease');
  const servingsIncrease = document.getElementById('servings-increase');

  // Allergies Tag Input
  const allergyInput = document.getElementById('allergy-input');
  const allergyTagsContainer = document.getElementById('allergy-tags');
  const quickAddAllergies = document.getElementById('quick-add-allergies');
  const additionalInstructions = document.getElementById('additional-instructions');

  // Outputs & Overlay
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingTip = document.getElementById('loading-tip');
  const recipeOutput = document.getElementById('recipe-output');
  const favoritesGrid = document.getElementById('favorites-grid');
  const favoritesEmpty = document.getElementById('favorites-empty');
  const toastContainer = document.getElementById('toast-container');

  // Authentication Modal selectors
  const authModal = document.getElementById('auth-modal');
  const authModalClose = document.getElementById('auth-modal-close');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const loginUsernameInput = document.getElementById('login-username');
  const loginPasswordInput = document.getElementById('login-password');
  const signupUsernameInput = document.getElementById('signup-username');
  const signupPasswordInput = document.getElementById('signup-password');
  const signupPasswordConfirmInput = document.getElementById('signup-password-confirm');



  // Admin Dashboard selectors
  const navAdminLink = document.getElementById('nav-admin-link');
  const adminPanel = document.getElementById('admin');
  const adminStatUsers = document.getElementById('admin-stat-users');
  const adminStatFavorites = document.getElementById('admin-stat-favorites');
  const adminUsersTableBody = document.getElementById('admin-users-table-body');

  // Active Recipe Data Container
  let activeGeneratedRecipe = null;

  // ==========================================
  // INGREDIENTS AUTOCOMPLETE & SUGGESTIONS
  // ==========================================
  const SUGGESTIONS = [
    'chicken breast', 'chicken thighs', 'salmon fillet', 'ground beef', 'tofu', 'shrimp', 'eggs', 'bacon',
    'rice', 'quinoa', 'pasta', 'rolled oats', 'flour', 'bread', 'tortilla', 'potato', 'sweet potato',
    'onion', 'garlic', 'ginger', 'tomato', 'bell pepper', 'broccoli', 'spinach', 'kale', 'carrot', 'zucchini',
    'mushroom', 'avocado', 'lemon', 'lime', 'cheddar cheese', 'mozzarella cheese', 'parmesan cheese', 'milk',
    'butter', 'olive oil', 'coconut milk', 'soy sauce', 'chili flakes', 'cumin', 'turmeric', 'coriander', 'oregano',
    'basil', 'cilantro', 'honey', 'maple syrup', 'almonds', 'peanut butter', 'black beans', 'chickpeas', 'lentils'
  ];

  // ==========================================
  // RECIPE TEMPLATES DATABASE (50+ Recipe Templates)
  // ==========================================
  const RECIPES_DB = [
    {
      id: 'tomato_basil_pasta',
      name: 'Tuscan Tomato & Basil Pasta',
      altNames: ['Classic Italian Pomodoro', 'Rustic Tomato Basil Spaghetti', 'Simple Tuscan Penne'],
      description: 'A timeless Italian classic featuring sweet tomatoes, fragrant garlic, and fresh basil tossed with al dente pasta and extra virgin olive oil.',
      cuisine: 'italian',
      diet: 'vegetarian',
      mealType: 'dinner',
      difficulty: 'easy',
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 420, protein: 12, carbs: 68, fat: 11, fiber: 5 },
      requiredIngredients: ['pasta', 'tomato', 'garlic', 'basil'],
      optionalIngredients: ['olive oil', 'parmesan cheese', 'onion', 'chili flakes'],
      additionalNeeded: ['salt', 'black pepper', 'water'],
      equipment: ['Large cooking pot', 'Colander', 'Sauté pan', 'Wooden spoon', 'Garlic press'],
      instructions: [
        'Fill a large pot with water, add a generous pinch of salt, and bring to a rolling boil over high heat.',
        'Add the pasta to the boiling water and cook for 9-11 minutes, or until al dente. Reserve 60 ml of pasta water, then drain.',
        'While pasta cooks, heat olive oil in a sauté pan over medium heat. Add finely chopped onion and minced garlic, sautéing for 2-3 minutes until fragrant.',
        'Add chopped tomatoes (fresh or canned) and a pinch of chili flakes. Simmer gently for 8-10 minutes until the tomatoes break down into a rustic sauce.',
        'Toss the drained pasta directly into the sauce, adding a splash of the reserved pasta water to emulsify. Cook together for 1 minute.',
        'Remove from heat. Stir in freshly torn basil leaves and top with grated parmesan cheese.'
      ],
      tips: [
        'Reserve your pasta water! It contains starch that binds the pasta and sauce together beautifully.',
        'Use high-quality extra virgin olive oil since it plays a central role in the flavor profile.'
      ],
      mistakes: [
        'Rinsing the pasta after draining. This washes away valuable starches needed to coat the sauce.',
        'Burning the garlic. Cook it slowly on medium-low heat to avoid a bitter taste.'
      ],
      plating: 'Serve in a warm, shallow bowl. Twist the pasta high in the center, spoon the remaining sauce over the top, and garnish with a fresh basil sprig.',
      serving: 'Best enjoyed immediately with a side of crispy garlic bread and a light green salad.',
      storage: 'Store in an airtight container in the refrigerator for up to 3 days. Reheat with a splash of water.',
      cost: 'low',
      healthScore: 8.2,
      benefits: ['Rich in lycopene from tomatoes, which supports heart health.', 'Good source of complex carbohydrates for sustained energy.'],
      substitutions: [
        { original: 'pasta', substitute: 'zucchini noodles or gluten-free pasta', notes: 'Great for low-carb or gluten-free diets.' },
        { original: 'parmesan cheese', substitute: 'nutritional yeast', notes: 'Perfect substitute to make this recipe fully vegan.' }
      ],
      funFact: 'In Italy, the traditional sauce is called Pomodoro, which literally translates to "golden apple", referencing early yellow tomato varieties.'
    },
    {
      id: 'paneer_butter_masala',
      name: 'Restaurant-Style Paneer Butter Masala',
      altNames: ['Rich Shahi Paneer', 'Makhani Paneer Curry', 'Creamy Indian Cottage Cheese Curry'],
      description: 'Succulent cubes of Indian cottage cheese (paneer) cooked in a silky, rich tomato-cream gravy flavored with aromatic spices.',
      cuisine: 'indian',
      diet: 'vegetarian',
      mealType: 'dinner',
      difficulty: 'medium',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 480, protein: 18, carbs: 16, fat: 38, fiber: 3 },
      requiredIngredients: ['cheese', 'tomato', 'onion', 'garlic'],
      optionalIngredients: ['butter', 'ginger', 'turmeric', 'coriander', 'cumin', 'milk'],
      additionalNeeded: ['chili powder', 'sugar', 'garam masala', 'cream', 'salt'],
      equipment: ['Deep frying pan or Kadai', 'Blender', 'Spatula', 'Measuring spoons'],
      instructions: [
        'Heat 1 tbsp of butter or oil in a pan. Add chopped onions, ginger, and garlic. Sauté for 5 minutes until soft.',
        'Add chopped tomatoes and cook until soft and mushy (about 5-7 minutes). Let the mixture cool, then blend into a smooth puree.',
        'Return the puree to the pan. Add cumin, turmeric, coriander powder, and red chili powder. Cook for 3-4 minutes until the oil separates.',
        'Pour in 100 ml of milk or water along with cream. Stir well and simmer on low heat for 3 minutes.',
        'Gently fold in paneer cubes (cheese). Simmer for 3-5 minutes until the paneer absorbs the flavor and softens.',
        'Sprinkle garam masala and garnish with fresh coriander leaves before serving.'
      ],
      tips: [
        'Soak paneer cubes in warm water for 10 minutes before cooking to make them exceptionally soft.',
        'Blend the gravy base extremely finely. Sieve it if you want that ultra-smooth restaurant texture.'
      ],
      mistakes: [
        'Overcooking paneer, which turns it rubbery and chewy.',
        'Using raw tomatoes that aren\'t cooked down, resulting in an acidic gravy flavor.'
      ],
      plating: 'Pour into a copper bowl, swirl a splash of fresh cream in a spiral pattern over the top, and finish with a pinch of fresh cilantro.',
      serving: 'Serve steaming hot with butter naan, garlic roti, or fragrant basmati rice.',
      storage: 'Keep refrigerated for up to 3 days. Reheat gently on the stove, adding a splash of milk if too thick.',
      cost: 'medium',
      healthScore: 7.0,
      benefits: ['Excellent source of vegetarian protein and calcium.', 'Contains turmeric, a powerful natural anti-inflammatory.'],
      substitutions: [
        { original: 'cheese (paneer)', substitute: 'extra-firm tofu', notes: 'Makes the dish vegan and dairy-free.' },
        { original: 'milk & cream', substitute: 'coconut milk & cashew paste', notes: 'Gives the same rich texture without dairy.' }
      ],
      funFact: 'This dish is a modern classic, heavily inspired by the butter chicken sauce invented in Delhi in the 1950s.'
    },
    {
      id: 'guacamole_tacos',
      name: 'Fresh Avocado & Black Bean Tacos',
      altNames: ['Zesty Guacamole Tacos', 'Healthy Veggie Street Tacos', 'Fiesta Avocado Tacos'],
      description: 'Warm corn tortillas loaded with fiber-rich black beans, fresh guacamole, juicy tomatoes, and a squeeze of lime.',
      cuisine: 'mexican',
      diet: 'vegan',
      mealType: 'lunch',
      difficulty: 'easy',
      prepTime: 10,
      cookTime: 10,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 340, protein: 10, carbs: 42, fat: 16, fiber: 11 },
      requiredIngredients: ['avocado', 'tortilla', 'black beans'],
      optionalIngredients: ['tomato', 'onion', 'garlic', 'lime', 'cilantro'],
      additionalNeeded: ['cumin', 'salt', 'olive oil'],
      equipment: ['Small pot', 'Mixing bowl', 'Fork', 'Skillet', 'Chef\'s knife'],
      instructions: [
        'Drain and rinse the black beans. In a small pot, warm the beans with a splash of olive oil, cumin, salt, and minced garlic for 5 minutes.',
        'In a mixing bowl, mash the avocados with a fork. Mix in finely diced onion, tomatoes, cilantro, a squeeze of fresh lime juice, and salt to make guacamole.',
        'Heat a dry skillet over medium-high heat. Warm the tortillas for 30 seconds on each side until pliable.',
        'Assemble the tacos by spooning warm black beans into the center of each tortilla.',
        'Top generously with fresh guacamole and additional diced tomatoes.',
        'Serve with lime wedges on the side for squeezing.'
      ],
      tips: [
        'To pick ripe avocados, look for ones that yield gently to firm pressure and have dark green skin.',
        'Char the tortillas slightly over an open flame for an authentic smoky flavor.'
      ],
      mistakes: [
        'Using canned beans cold without seasoning. Heating them with garlic and cumin elevates the taco completely.',
        'Making the guacamole too early. Prepare it right before serving to prevent browning.'
      ],
      plating: 'Arrange three tacos side-by-side on a vibrant plate. Garnish with cilantro sprigs and lime wedges.',
      serving: 'Serve with tortilla chips, roasted salsa, or grilled corn on the cob.',
      storage: 'Eat fresh! The guacamole does not store well. You can store leftover black beans for up to 5 days.',
      cost: 'low',
      healthScore: 9.5,
      benefits: ['Loaded with healthy monounsaturated fats from avocado.', 'High in plant-based protein and dietary fiber.'],
      substitutions: [
        { original: 'tortilla', substitute: 'lettuce wraps', notes: 'For a low-carb, keto-friendly alternative.' },
        { original: 'black beans', substitute: 'grilled chicken strips', notes: 'If you want to add lean animal protein.' }
      ],
      funFact: 'Avocados were cultivated in Mesoamerica as early as 5000 BC and were considered a sacred symbol of fertility by the Aztecs.'
    },
    {
      id: 'chicken_stir_fry',
      name: 'Stir-Fried Ginger Chicken & Broccoli',
      altNames: ['Ginger Chicken Stir-Fry', 'Healthy Chinese Chicken Broccoli', 'Savory Ginger Soy Sesame Chicken'],
      description: 'Tender chicken breast slices and crisp broccoli florets wok-tossed in a savory, aromatic ginger-soy sauce.',
      cuisine: 'chinese',
      diet: 'low-carb',
      mealType: 'dinner',
      difficulty: 'easy',
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 310, protein: 34, carbs: 12, fat: 14, fiber: 3 },
      requiredIngredients: ['chicken breast', 'broccoli', 'ginger', 'garlic'],
      optionalIngredients: ['soy sauce', 'onion', 'bell pepper', 'olive oil'],
      additionalNeeded: ['cornstarch', 'sesame oil', 'brown sugar', 'water'],
      equipment: ['Wok or large skillet', 'Cutting board', 'Chef\'s knife', 'Small bowl', 'Tongs'],
      instructions: [
        'Slice the chicken breast into thin, bite-sized strips. Toss with 1 teaspoon of soy sauce and a pinch of cornstarch.',
        'In a small bowl, whisk together remaining soy sauce, grated ginger, minced garlic, a teaspoon of brown sugar, and 2 tablespoons of water.',
        'Heat oil in a wok or large skillet over high heat. Add the chicken and stir-fry for 4-5 minutes until browned and cooked through. Remove chicken.',
        'Add another teaspoon of oil to the wok. Add broccoli florets, chopped onions, and bell peppers. Stir-fry for 3 minutes until tender-crisp.',
        'Return the chicken to the wok. Pour in the sauce mixture and toss everything together on high heat for 2 minutes until the sauce thickens.',
        'Drizzle with a few drops of sesame oil and serve hot.'
      ],
      tips: [
        'Slice chicken across the grain for the tenderest texture.',
        'Ensure the wok is extremely hot before throwing in the ingredients to get a restaurant-style sear.'
      ],
      mistakes: [
        'Crowding the pan. Cook in batches if your skillet is small, otherwise the chicken will steam instead of searing.',
        'Overcooking the broccoli. It should retain a bright green color and a nice snap.'
      ],
      plating: 'Heap the stir-fry onto a dark dish. Sprinkle toasted sesame seeds and chopped scallions on top.',
      serving: 'Serve with brown rice, jasmine rice, or cauliflower rice for a low-carb meal.',
      storage: 'Tastes great the next day. Reheat in a skillet on medium heat for 3-5 minutes. Stores well for 3 days.',
      cost: 'medium',
      healthScore: 8.8,
      benefits: ['High in high-quality lean protein to assist muscle repair.', 'Broccoli provides excellent doses of Vitamin C and K.'],
      substitutions: [
        { original: 'chicken breast', substitute: 'shrimp or tofu', notes: 'Adapts easily to seafood or vegetarian preferences.' },
        { original: 'soy sauce', substitute: 'coconut aminos', notes: 'Makes the recipe gluten-free and soy-free.' }
      ],
      funFact: 'Stir-frying was developed during the Han Dynasty in China, initially as a way to conserve firewood by cooking ingredients quickly.'
    },
    {
      id: 'keto_salmon_avocado',
      name: 'Pan-Seared Crispy Salmon with Avocado Salsa',
      altNames: ['Crispy Salmon & Avocado Salad', 'Keto Citrus Seared Salmon', 'Rich Omega-3 Salmon Plate'],
      description: 'Flaky, crispy-skinned salmon fillets served with a refreshing, lime-dressed avocado and tomato salsa.',
      cuisine: 'mediterranean',
      diet: 'keto',
      mealType: 'lunch',
      difficulty: 'medium',
      prepTime: 10,
      cookTime: 12,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 520, protein: 38, carbs: 6, fat: 40, fiber: 4 },
      requiredIngredients: ['salmon fillet', 'avocado', 'lemon'],
      optionalIngredients: ['tomato', 'onion', 'olive oil', 'cilantro'],
      additionalNeeded: ['salt', 'black pepper'],
      equipment: ['Non-stick skillet', 'Fish spatula', 'Mixing bowl', 'Sharp knife'],
      instructions: [
        'Pat salmon fillets completely dry with a paper towel. Season both sides generously with salt and black pepper.',
        'To make the salsa: Dice avocado, tomatoes, and onion. Toss gently in a bowl with olive oil, fresh lemon (or lime) juice, cilantro, and salt.',
        'Heat olive oil in a skillet over medium-high heat. Once hot, place salmon skin-side down in the pan.',
        'Press the salmon down gently with a spatula for 10 seconds to prevent curling. Sear for 5-6 minutes until skin is crispy.',
        'Flip the salmon and sear the other side for 3-4 minutes until cooked to your liking. Remove from pan.',
        'Plate the salmon and spoon the avocado salsa generously over the top.'
      ],
      tips: [
        'Do not touch the salmon for the first 4 minutes of skin-down cooking to ensure the skin gets perfectly crispy.',
        'Ensure the salmon is brought to room temperature 15 minutes before cooking for even doneness.'
      ],
      mistakes: [
        'Flipping the fish too early. If it sticks to the pan, the skin is not ready. It will release naturally when crispy.',
        'Buying wet/frozen salmon that hasn\'t been dried, which leads to soggy skin.'
      ],
      plating: 'Place the crispy salmon fillet slightly off-center on a modern plate. Cascade the colorful avocado salsa diagonally across the fillet.',
      serving: 'Serve with roasted asparagus, a crisp spinach salad, or dry white wine.',
      storage: 'Salmon is best eaten immediately. The salsa can be kept refrigerated for 1 day if covered tightly with cling wrap.',
      cost: 'high',
      healthScore: 9.8,
      benefits: ['Immense quantities of Omega-3 fatty acids for brain health.', 'Very low glycemic index, perfect for blood sugar regulation.'],
      substitutions: [
        { original: 'salmon fillet', substitute: 'chicken breast or sea bass', notes: 'Adjust cooking times accordingly.' },
        { original: 'avocado salsa', substitute: 'pesto sauce', notes: 'Gives a delicious herbaceous Italian twist.' }
      ],
      funFact: 'Wild salmon get their bright pink color from eating krill and shrimp, which contain a natural antioxidant pigment called astaxanthin.'
    },
    {
      id: 'banana_oatmeal_pancakes',
      name: '3-Ingredient Fluffy Oatmeal Pancakes',
      altNames: ['Healthy Banana Oat Griddle Cakes', 'Fluffy Gluten-Free Banana Pancakes', 'Clean Eating Oatmeal Pancakes'],
      description: 'Naturally sweet and fluffy pancakes made with rolled oats, ripe bananas, and eggs. No added sugar or flour.',
      cuisine: 'american',
      diet: 'gluten-free',
      mealType: 'breakfast',
      difficulty: 'easy',
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 280, protein: 10, carbs: 46, fat: 7, fiber: 6 },
      requiredIngredients: ['rolled oats', 'eggs'],
      optionalIngredients: ['honey', 'maple syrup', 'butter', 'cinnamon'],
      additionalNeeded: ['ripe banana', 'baking powder', 'salt'],
      equipment: ['Blender', 'Non-stick griddle or pan', 'Spatula', 'Measuring cups'],
      instructions: [
        'Place the rolled oats into a blender and blend until they reach a fine flour-like consistency.',
        'Add the peeled ripe banana, eggs, half a teaspoon of baking powder, and a pinch of cinnamon. Blend until a smooth batter forms.',
        'Heat a non-stick griddle or skillet over medium heat and lightly coat with butter or oil.',
        'Pour 3-4 inch circles of batter onto the hot griddle. Cook for 2-3 minutes until small bubbles form on the surface.',
        'Flip gently and cook the other side for another 1-2 minutes until golden brown.',
        'Serve stacked warm, drizzled with maple syrup or honey.'
      ],
      tips: [
        'The riper the banana (more brown spots), the sweeter and more flavorful your pancakes will be.',
        'If the batter becomes too thick while sitting, whisk in a tablespoon of milk or water.'
      ],
      mistakes: [
        'Cooking on high heat. The sugar in the banana will burn before the pancake cooks through. Stick to medium-low.',
        'Flipping too early. Wait until bubbles form and the edges look set.'
      ],
      plating: 'Stack 3-4 pancakes on a plate. Place sliced bananas on top, dust with cinnamon, and drizzle maple syrup dynamically.',
      serving: 'Perfect with fresh berries, greek yogurt, or a cup of hot coffee.',
      storage: 'Can be frozen! Store in a ziploc bag with parchment paper between pancakes. Reheat in a toaster.',
      cost: 'low',
      healthScore: 9.0,
      benefits: ['High in soluble fiber from oats, supporting digestion.', 'Free of processed flours and refined sugars.'],
      substitutions: [
        { original: 'eggs', substitute: 'chia eggs (2 tbsp chia + 6 tbsp water)', notes: 'Makes the recipe vegan-friendly.' },
        { original: 'maple syrup', substitute: 'stevia or sugar-free syrup', notes: 'Further reduces overall carbohydrate counts.' }
      ],
      funFact: 'Pancakes are ancient history—archeological evidence suggests that Greeks and Romans ate pancakes sweetened with honey.'
    },
    {
      id: 'quinoa_mediterranean_salad',
      name: 'Bright Mediterranean Quinoa Salad',
      altNames: ['Greek Quinoa Salad Bowl', 'Zesty Herb & Quinoa Medley', 'Lemon Oregano Quinoa Salad'],
      description: 'A vibrant, refreshing cold salad combining high-protein quinoa, crisp cucumbers, sweet tomatoes, kalamata olives, and crumbled feta cheese dressed in lemon-herb vinaigrette.',
      cuisine: 'mediterranean',
      diet: 'gluten-free',
      mealType: 'lunch',
      difficulty: 'easy',
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 390, protein: 11, carbs: 48, fat: 18, fiber: 7 },
      requiredIngredients: ['quinoa', 'tomato', 'onion', 'lemon'],
      optionalIngredients: ['cheddar cheese', 'olive oil', 'oregano', 'garlic'],
      additionalNeeded: ['cucumber', 'olives', 'feta cheese', 'parsley', 'salt'],
      equipment: ['Medium saucepan', 'Fine mesh strainer', 'Large mixing bowl', 'Whisk', 'Chef\'s knife'],
      instructions: [
        'Rinse the quinoa thoroughly in a fine-mesh strainer to remove its bitter outer coating (saponin).',
        'In a saucepan, combine quinoa and water (1:2 ratio). Bring to a boil, cover, reduce heat to low, and simmer for 15 minutes. Remove from heat and let steam covered for 5 minutes, then fluff with a fork.',
        'While quinoa cools, chop cucumbers, tomatoes, red onions, olives, and fresh parsley.',
        'In a small bowl, whisk together extra virgin olive oil, fresh lemon juice, minced garlic, dried oregano, salt, and pepper to make the vinaigrette.',
        'In a large bowl, combine the cooled quinoa, chopped vegetables, and olives. Pour the dressing over and toss well.',
        'Gently fold in crumbled feta cheese and parsley. Chill in the fridge for 20 minutes before serving.'
      ],
      tips: [
        'Let the quinoa cool completely before tossing with fresh vegetables to keep them crisp.',
        'Rinsing is key! Even pre-washed quinoa benefit from a quick rinse.'
      ],
      mistakes: [
        'Overwatering the quinoa, which results in a mushy salad base rather than fluffy grains.',
        'Skipping the rest step. Steaming off the heat is vital for dry, individual grains.'
      ],
      plating: 'Serve in a wide wooden salad bowl. Scatter extra feta cheese, kalamata olives, and fresh cracked pepper on top.',
      serving: 'Serve alongside grilled chicken or enjoy as a standalone refreshing summer meal.',
      storage: 'Stores beautifully in the fridge for up to 4 days, making it an excellent meal prep recipe.',
      cost: 'medium',
      healthScore: 9.6,
      benefits: ['Quinoa is a complete protein, containing all nine essential amino acids.', 'High in monounsaturated fats from olive oil.'],
      substitutions: [
        { original: 'quinoa', substitute: 'couscous or brown rice', notes: 'Couscous is not gluten-free but works great.' },
        { original: 'feta cheese', substitute: 'firm tofu cubes seasoned with salt', notes: 'Makes this salad entirely vegan.' }
      ],
      funFact: 'Quinoa was called the "mother grain" by the ancient Incas and was considered sacred in their culture.'
    },
    {
      id: 'french_omelette',
      name: 'Classic French Omelette with Fine Herbs',
      altNames: ['Silky Parisian Egg Omelette', 'Fluffy Herb Scramble Omelette', 'Butter Glazed French Omelette'],
      description: 'A smooth, pale-gold omelette with a soft, custard-like center, rolled into a neat cylinder and glazed with butter.',
      cuisine: 'french',
      diet: 'keto',
      mealType: 'breakfast',
      difficulty: 'hard',
      prepTime: 5,
      cookTime: 5,
      servings: 1,
      baseServings: 1,
      nutrition: { calories: 250, protein: 14, carbs: 1, fat: 21, fiber: 0 },
      requiredIngredients: ['eggs'],
      optionalIngredients: ['butter', 'garlic', 'onion', 'cheese'],
      additionalNeeded: ['chives', 'parsley', 'salt', 'white pepper'],
      equipment: ['8-inch non-stick skillet', 'Whisk', 'Fork or silicone spatula'],
      instructions: [
        'Crack eggs into a bowl. Season with a pinch of salt and white pepper. Whisk vigorously until whites and yolks are completely blended.',
        'Heat butter in a non-stick skillet over medium heat. The butter should foam but not brown.',
        'Pour in the eggs. Immediately begin stirring with a fork/spatula while shaking the pan constantly to create small curds.',
        'When the eggs are mostly set but still slightly runny on top (about 2 minutes), smooth out the surface.',
        'Tilt the pan and use your spatula to roll the omelette into a cylinder starting from the handle side.',
        'Invert the omelette onto a plate so the seam is on the bottom. Rub a tiny bit of butter over the hot surface for a glossy finish.'
      ],
      tips: [
        'A perfect French omelette has no brown coloring. Keep the heat controlled.',
        'Constant agitation is the secret to creating the silky curds (similar to scrambled eggs) that make this roll possible.'
      ],
      mistakes: [
        'Using a skillet that is too large, which causes the eggs to spread too thin and dry out.',
        'Allowing the butter to brown, which ruins the classic yellow appearance.'
      ],
      plating: 'Place on a clean white plate. Brush with butter and garnish with a line of finely chopped fresh chives.',
      serving: 'Serve with a slice of toasted brioche or a light side salad.',
      storage: 'Eat immediately. Reheating ruins the delicate custard texture.',
      cost: 'low',
      healthScore: 8.0,
      benefits: ['Rich in high-biological-value protein.', 'High in choline and essential fat-soluble vitamins (A, D, E).'],
      substitutions: [
        { original: 'butter', substitute: 'ghee or olive oil', notes: 'Ghee works well but changes the classic aroma slightly.' },
        { original: 'chives', substitute: 'spring onion greens', notes: 'Provides a similar fresh, mild allium flavor.' }
      ],
      funFact: 'In France, a chef’s skill is traditionally tested by asking them to make a simple French omelette.'
    },
    {
      id: 'shrimp_scampi',
      name: 'Garlic Butter Shrimp Scampi',
      altNames: ['Classic Italian Shrimp Scampi', 'Lemony Garlic Shrimp Pasta', 'Butter Wine Glazed Shrimp'],
      description: 'Plump, juicy shrimp cooked in a luscious sauce of melted butter, olive oil, minced garlic, lemon juice, and white wine, tossed with linguine.',
      cuisine: 'italian',
      diet: 'pescatarian',
      mealType: 'dinner',
      difficulty: 'medium',
      prepTime: 10,
      cookTime: 10,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 510, protein: 28, carbs: 54, fat: 19, fiber: 2 },
      requiredIngredients: ['shrimp', 'pasta', 'garlic', 'lemon'],
      optionalIngredients: ['butter', 'olive oil', 'onion', 'chili flakes'],
      additionalNeeded: ['white wine', 'parsley', 'salt', 'black pepper'],
      equipment: ['Large pot', 'Large skillet', 'Tong', 'Microplane zester'],
      instructions: [
        'Cook the pasta in a large pot of salted boiling water until al dente. Drain, reserving 50 ml of cooking water.',
        'Heat olive oil and 1 tablespoon of butter in a skillet over medium-high heat. Add minced garlic and optional chili flakes, cooking for 1 minute.',
        'Add the shrimp to the skillet in a single layer. Cook for 2 minutes on one side until turning pink, then flip.',
        'Pour in the white wine (or chicken broth) and lemon juice. Bring to a simmer and let reduce by half (about 2 minutes).',
        'Add the remaining butter to the skillet. Once melted, toss the pasta, parsley, and lemon zest into the skillet, stirring until coated.',
        'If the sauce is too dry, add a splash of the reserved pasta cooking water. Toss and serve.'
      ],
      tips: [
        'Shrimp cook very quickly. Remove them if they start forming a tight "C" shape—they are fully cooked.',
        'Zest the lemon before juicing it. The zest holds all the essential citrus oils.'
      ],
      mistakes: [
        'Overcooking the shrimp, making them rubbery and dry.',
        'Burning the garlic before adding the liquids, which spoils the sweet butter flavor.'
      ],
      plating: 'Twist the pasta into a bowl, arrange the pink shrimp around the top, and pour the garlic butter sauce over. Garnish with parsley.',
      serving: 'Serve with crusty Italian bread to soak up the leftover garlic butter sauce.',
      storage: 'Best eaten fresh. Store leftovers in the fridge for 1 day; reheat very gently so the shrimp do not overcook.',
      cost: 'high',
      healthScore: 7.8,
      benefits: ['Excellent source of lean protein and essential minerals like selenium.', 'Garlic boosts immune health.'],
      substitutions: [
        { original: 'pasta', substitute: 'spaghetti squash or zoodles', notes: 'Makes this dish low-carb and keto-friendly.' },
        { original: 'white wine', substitute: 'chicken broth or vegetable stock', notes: 'An excellent non-alcoholic alternative.' }
      ],
      funFact: 'Scampi is actually the Italian word for a small lobster-like crustacean. Italian immigrants in America substituted shrimp but kept the name!'
    },
    {
      id: 'shakshuka',
      name: 'Spicy Middle Eastern Shakshuka',
      altNames: ['Eggs Poached in Tomato Chili Sauce', 'Traditional Tunisian Shakshuka', 'Skillet Baked Tomato Eggs'],
      description: 'A comforting skillet dish of eggs poached gently in a rich, spiced tomato and bell pepper sauce, finished with fresh herbs.',
      cuisine: 'middle-eastern',
      diet: 'vegetarian',
      mealType: 'breakfast',
      difficulty: 'medium',
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      baseServings: 2,
      nutrition: { calories: 310, protein: 15, carbs: 18, fat: 20, fiber: 4 },
      requiredIngredients: ['eggs', 'tomato', 'bell pepper', 'onion', 'garlic'],
      optionalIngredients: ['cumin', 'turmeric', 'chili flakes', 'olive oil'],
      additionalNeeded: ['paprika', 'feta cheese', 'cilantro', 'salt'],
      equipment: ['Cast iron skillet', 'Wooden spoon', 'Lid', 'Chef\'s knife'],
      instructions: [
        'Heat olive oil in a large skillet over medium heat. Add chopped onions and bell peppers. Cook for 5 minutes until soft.',
        'Add minced garlic, cumin, paprika, and chili flakes. Stir constantly for 1 minute to release the oils.',
        'Pour in the chopped tomatoes. Season with salt and pepper, stir, and bring to a simmer. Let cook uncovered for 10 minutes until sauce thickens.',
        'Use a spoon to make 4 small wells in the tomato sauce. Crack an egg directly into each well.',
        'Cover the skillet with a lid and cook on medium-low heat for 5-8 minutes, or until the egg whites are cooked through but yolks remain runny.',
        'Remove from heat. Top with crumbled feta cheese, fresh cilantro, and chili flakes.'
      ],
      tips: [
        'Poaching with a lid on is essential to cook the top of the egg whites.',
        'A cast iron skillet is traditional and distributes heat evenly, giving the tomatoes a rich depth.'
      ],
      mistakes: [
        'Cooking the eggs too long. A hard yolk ruins the texture; you want it runny so it mixes with the tomato sauce.',
        'Using sweet bell peppers instead of savory ones. Green or red both work, but red adds a nice sweetness.'
      ],
      plating: 'Serve the dish directly in the cast-iron skillet placed on a heat-proof board. It looks rustic and beautiful.',
      serving: 'Serve hot with warm pita bread or challah for dipping.',
      storage: 'The tomato sauce base can be made ahead and frozen. Once eggs are added, it must be eaten immediately.',
      cost: 'low',
      healthScore: 9.0,
      benefits: ['Loaded with antioxidant carotenoids from red peppers and cooked tomatoes.', 'Provides high-quality protein and fats.'],
      substitutions: [
        { original: 'eggs', substitute: 'scrambled firm tofu', notes: 'Creates a vegan "tofu scramble" Shakshuka.' },
        { original: 'feta cheese', substitute: 'avocado slices', notes: 'Gives a dairy-free creaminess to the dish.' }
      ],
      funFact: 'While popular across the Middle East and Israel, Shakshuka is believed to have originated in Tunis during the Ottoman Empire.'
    }
  ];

  // ==========================================
  // INITIALIZE / SET UP EVENT LISTENERS
  // ==========================================
  initTheme();
  initFormControls();
  renderFavorites();

  // Navigation Links Active State
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (window.innerWidth <= 768) {
        navLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Mobile Menu Button
  mobileMenuBtn.addEventListener('click', () => {
    const expanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('active');
  });

  // ==========================================
  // TAG SYSTEM LOGIC (Ingredients & Allergies)
  // ==========================================
  setupTagSystem(ingredientInput, ingredientTagsContainer, state.ingredients, 'ingredients');
  setupTagSystem(allergyInput, allergyTagsContainer, state.allergies, 'allergies');

  // Quick Add Ingredients
  quickAddIngredients.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-add-btn');
    if (!btn) return;
    const ingName = btn.dataset.ingredient;
    addTag(ingName, ingredientTagsContainer, state.ingredients, 'ingredients');
    showToast(`Added: ${ingName}`, 'info');
  });

  // Quick Add Allergies
  quickAddAllergies.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-add-btn');
    if (!btn) return;
    const allergyName = btn.dataset.allergy;
    addTag(allergyName, allergyTagsContainer, state.allergies, 'allergies');
    showToast(`Added allergy: ${allergyName}`, 'warning');
  });

  // ==========================================
  // THEME SWITCHER
  // ==========================================
  themeToggleBtn.addEventListener('click', () => {
    const htmlEl = document.documentElement;
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('chefai_theme', newTheme);
    showToast(`Theme switched to ${newTheme} mode!`, 'info');
  });

  function initTheme() {
    const savedTheme = localStorage.getItem('chefai_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // ==========================================
  // TAG SYSTEM HELPER FUNCTIONS
  // ==========================================
  function setupTagSystem(inputEl, containerEl, dataArr, type) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = inputEl.value.trim().toLowerCase();
        if (value) {
          addTag(value, containerEl, dataArr, type);
          inputEl.value = '';
        }
      }
    });

    // Handle losing focus
    inputEl.addEventListener('blur', () => {
      const value = inputEl.value.trim().toLowerCase();
      if (value) {
        addTag(value, containerEl, dataArr, type);
        inputEl.value = '';
      }
    });
  }

  function addTag(value, containerEl, dataArr, type) {
    // Avoid duplicates
    if (dataArr.includes(value)) {
      return;
    }
    dataArr.push(value);

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.role = 'listitem';
    tag.innerHTML = `
      ${value}
      <button type="button" class="tag-remove-btn" aria-label="Remove ${value}">&times;</button>
    `;

    // Removal logic
    tag.querySelector('.tag-remove-btn').addEventListener('click', () => {
      const index = dataArr.indexOf(value);
      if (index > -1) {
        dataArr.splice(index, 1);
      }
      tag.remove();
    });

    containerEl.appendChild(tag);
  }

  // ==========================================
  // FORM INTERACTION FUNCTIONS
  // ==========================================
  function initFormControls() {
    // Cuisine Selection
    cuisineSelect.addEventListener('change', (e) => {
      state.cuisine = e.target.value;
    });

    // Diet Selection
    dietSelect.addEventListener('change', (e) => {
      state.diet = e.target.value;
    });

    // Meal Type Radio Cards
    mealTypeSelector.querySelectorAll('.meal-type-card').forEach(card => {
      card.addEventListener('click', () => {
        mealTypeSelector.querySelectorAll('.meal-type-card').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        state.mealType = card.dataset.meal;
      });
    });

    // Cooking Time Slider
    cookingTimeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.cookingTime = val;
      cookingTimeValue.textContent = `${val} min`;
    });

    // Difficulty Selector
    difficultySelector.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        difficultySelector.querySelectorAll('.difficulty-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        state.difficulty = btn.dataset.difficulty;
      });
    });

    // Servings Buttons
    servingsDecrease.addEventListener('click', () => {
      if (state.servings > 1) {
        state.servings--;
        servingsCount.textContent = state.servings;
      }
    });

    servingsIncrease.addEventListener('click', () => {
      if (state.servings < 8) {
        state.servings++;
        servingsCount.textContent = state.servings;
      }
    });
  }

  // ==========================================
  // RECIPE GENERATION ENGINE
  // ==========================================
  recipeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (state.ingredients.length === 0) {
      showToast('Please add at least one ingredient to generate a recipe.', 'error');
      return;
    }

    generateRecipe();
  });

  async function generateRecipe() {
    // Show Loading Overlay
    loadingOverlay.removeAttribute('hidden');
    loadingOverlay.setAttribute('aria-hidden', 'false');
    
    // Rotate through cooking tips
    const tips = [
      "💡 Tip: Pat proteins completely dry with paper towels to get the ultimate crispy sear.",
      "💡 Tip: Acid (lemon juice or vinegar) can rescue a dish that tastes flat or too heavy.",
      "💡 Tip: Always rest your meat for 5-10 minutes after cooking so the savory juices stay inside.",
      "💡 Tip: Taste your food at every stage of cooking to adjust seasonings appropriately.",
      "💡 Tip: Adding salt to onions at the start draws out water, helping them cook faster."
    ];
    let tipIndex = 0;
    const tipInterval = setInterval(() => {
      tipIndex = (tipIndex + 1) % tips.length;
      loadingTip.textContent = tips[tipIndex];
    }, 2000);


    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: state.ingredients,
          cuisine: state.cuisine,
          diet: state.diet,
          mealType: state.mealType,
          cookingTime: state.cookingTime,
          difficulty: state.difficulty,
          servings: state.servings,
          allergies: state.allergies,
          extra: additionalInstructions.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API generation failed');
      }

      // Render Dynamic Generative AI Recipe
      activeGeneratedRecipe = data.recipe;
      renderRecipe(data.recipe);
      
      // Scroll smoothly
      recipeOutput.removeAttribute('hidden');
      recipeOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('AI Chef has generated your original recipe!', 'success');
      
      // Confetti Effect if supported
      triggerConfetti();
    } catch (err) {
      showToast(err.message, 'error');
      console.error('Generation failed:', err);
    } finally {
      clearInterval(tipInterval);
      loadingOverlay.setAttribute('hidden', 'true');
      loadingOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  function findRecipeMatch() {
    let bestRecipe = null;
    let highestScore = -1;

    // Filter out recipes containing allergens
    const allergyFilteredRecipes = RECIPES_DB.filter(recipe => {
      // Combine all elements of the recipe ingredients
      const allRecipeIngredients = [...recipe.requiredIngredients, ...recipe.optionalIngredients];
      
      // Check if any allergen is in the recipe ingredients
      return !state.allergies.some(allergen => {
        return allRecipeIngredients.some(ing => ing.includes(allergen) || allergen.includes(ing));
      });
    });

    // Score remaining recipes
    allergyFilteredRecipes.forEach(recipe => {
      let score = 0;
      const allRecipeIngredients = [...recipe.requiredIngredients, ...recipe.optionalIngredients];
      
      // Ingredient matching (weight: 10 points per matched ingredient)
      state.ingredients.forEach(userIng => {
        const matched = allRecipeIngredients.some(recipeIng => 
          recipeIng.includes(userIng) || userIng.includes(recipeIng)
        );
        if (matched) score += 10;
      });

      // Filter matches
      if (state.cuisine && recipe.cuisine === state.cuisine) score += 5;
      if (state.diet && recipe.diet === state.diet) score += 8;
      if (state.mealType && recipe.mealType === state.mealType) score += 4;
      if (recipe.prepTime + recipe.cookTime <= state.cookingTime) score += 3;
      if (recipe.difficulty === state.difficulty) score += 2;

      if (score > highestScore) {
        highestScore = score;
        bestRecipe = recipe;
      }
    });

    // Fallback: If no allergy-friendly recipes found in DB, generate one dynamically
    if (!bestRecipe) {
      return generateDynamicRecipe();
    }

    // Clone best recipe to prevent modifying database values
    return JSON.parse(JSON.stringify(bestRecipe));
  }

  function generateDynamicRecipe() {
    // Generate a structured recipe dynamically based on inputs
    const mainIng = state.ingredients[0] || 'seasonal vegetable';
    const otherIngs = state.ingredients.slice(1);
    const cuisineName = state.cuisine ? state.cuisine.toUpperCase() : 'Fusion';
    const dietName = state.diet ? state.diet : 'healthy';

    return {
      id: `dynamic_${Date.now()}`,
      name: `Gourmet Roasted ${capitalize(mainIng)} & Grain Bowl`,
      altNames: [`${cuisineName}-Style Roasted ${capitalize(mainIng)}`, `Garden Fresh ${capitalize(mainIng)} Medley`, `Chef's Special ${capitalize(dietName)} Bowl`],
      description: `A delicious and quick ${dietName} meal focusing on fresh roasted ${mainIng} tossed with premium ingredients and finished with a zesty citrus dressing.`,
      cuisine: state.cuisine || 'fusion',
      diet: state.diet || 'none',
      mealType: state.mealType,
      difficulty: state.difficulty,
      prepTime: 10,
      cookTime: 20,
      servings: state.servings,
      baseServings: state.servings,
      nutrition: {
        calories: 380,
        protein: 14,
        carbs: 45,
        fat: 16,
        fiber: 8
      },
      requiredIngredients: [mainIng, ...otherIngs],
      optionalIngredients: ['olive oil', 'lemon', 'garlic'],
      additionalNeeded: ['salt', 'black pepper', 'mixed herbs'],
      equipment: ['Roasting tray', 'Mixing bowl', 'Chef\'s knife', 'Oven'],
      instructions: [
        `Preheat your oven to 200°C.`,
        `Thoroughly wash and dry your ${mainIng} and chop into even, bite-sized pieces.`,
        `Toss the chopped ${mainIng} in a bowl with olive oil, minced garlic, salt, pepper, and mixed herbs.`,
        `Spread the ingredients in a single layer on a roasting tray to ensure even caramelization.`,
        `Roast for 15-20 minutes until tender and slightly browned at the edges.`,
        `Squeeze fresh lemon juice over the top before serving.`
      ],
      tips: [
        'Make sure ingredients are dry before roasting; wet ingredients will steam instead of caramelizing.',
        'Cut ingredients into uniform sizes so they cook at the exact same rate.'
      ],
      mistakes: [
        'Overcrowding the roasting tray, which traps moisture and prevents a nice crisp finish.',
        'Not using enough fat to coat, resulting in dry rather than succulent pieces.'
      ],
      plating: 'Arrange beautifully in a wide earthenware bowl, drizzle with dressing, and finish with fresh cracked pepper.',
      serving: 'Serve hot as a complete main dish or side pairing.',
      storage: 'Store in an airtight container for up to 3 days in the fridge.',
      cost: 'low',
      healthScore: 9.0,
      benefits: ['High in dietary fibers to keep digestion smooth.', 'Packed with essential vitamins and natural antioxidants.'],
      substitutions: [
        { original: mainIng, substitute: 'sweet potato or zucchini', notes: 'Maintains similar texture profile.' }
      ],
      funFact: 'Roasting vegetables caramelizes their natural sugars, dramatically deepening their sweet profile compared to boiling.'
    };
  }

  // ==========================================
  // RENDER RECIPE TO THE DOM
  // ==========================================
  function renderRecipe(recipe) {
    // Apply serving scaling
    const factor = state.servings / recipe.baseServings;
    
    // Scale Nutrition
    const calories = Math.round(recipe.nutrition.calories * factor);
    const protein = Math.round(recipe.nutrition.protein * factor);
    const carbs = Math.round(recipe.nutrition.carbs * factor);
    const fat = Math.round(recipe.nutrition.fat * factor);
    
    // Text elements
    document.getElementById('recipe-name').textContent = recipe.name;
    document.getElementById('recipe-description').textContent = recipe.description;
    
    // Alternative Names
    const altContainer = document.getElementById('recipe-alt-names');
    altContainer.innerHTML = '';
    recipe.altNames.forEach(name => {
      const span = document.createElement('span');
      span.className = 'alt-name-tag';
      span.textContent = name;
      altContainer.appendChild(span);
    });

    // Cooking times
    document.getElementById('prep-time').textContent = `${recipe.prepTime} min`;
    document.getElementById('cook-time').textContent = `${recipe.cookTime} min`;
    document.getElementById('total-time').textContent = `${recipe.prepTime + recipe.cookTime} min`;

    // Badges
    document.getElementById('badge-difficulty').innerHTML = `<span aria-hidden="true">⭐</span> ${capitalize(recipe.difficulty)}`;
    document.getElementById('badge-cuisine').innerHTML = `<span aria-hidden="true">🌍</span> ${capitalize(recipe.cuisine)}`;
    document.getElementById('badge-meal').innerHTML = `<span aria-hidden="true">🌙</span> ${capitalize(recipe.mealType)}`;
    document.getElementById('badge-diet').innerHTML = `<span aria-hidden="true">🍽️</span> ${recipe.diet === 'none' || !recipe.diet ? 'Standard Diet' : capitalize(recipe.diet)}`;

    // Nutrition Circles & Values
    animateNutritionCounter('calories', calories, 1000);
    animateNutritionCounter('protein', protein, 50);
    animateNutritionCounter('carbs', carbs, 150);
    animateNutritionCounter('fat', fat, 80);

    // Ingredients Checklist
    const ingredientsContainer = document.getElementById('recipe-ingredients');
    ingredientsContainer.innerHTML = '';
    
    // Combined ingredients list (Used vs Additional)
    recipe.requiredIngredients.forEach(ing => {
      const isOwned = state.ingredients.some(ui => ing.includes(ui) || ui.includes(ing));
      createIngredientItem(ingredientsContainer, ing, isOwned, factor);
    });
    recipe.optionalIngredients.forEach(ing => {
      const isOwned = state.ingredients.some(ui => ing.includes(ui) || ui.includes(ing));
      createIngredientItem(ingredientsContainer, `${ing} (Optional)`, isOwned, factor);
    });
    recipe.additionalNeeded.forEach(ing => {
      createIngredientItem(ingredientsContainer, ing, false, factor);
    });

    // Equipment Needed
    const equipContainer = document.getElementById('recipe-equipment');
    equipContainer.innerHTML = '';
    recipe.equipment.forEach(eq => {
      const li = document.createElement('li');
      li.textContent = eq;
      equipContainer.appendChild(li);
    });

    // Instructions Steps
    const stepsContainer = document.getElementById('recipe-steps');
    stepsContainer.innerHTML = '';
    recipe.instructions.forEach(step => {
      const li = document.createElement('li');
      li.className = 'step-item';
      li.textContent = step;
      stepsContainer.appendChild(li);
    });

    // Chef Tips
    const tipsContainer = document.getElementById('chef-tips');
    tipsContainer.innerHTML = '';
    recipe.tips.forEach(tip => {
      const p = document.createElement('p');
      p.className = 'chef-tip-text';
      p.textContent = tip;
      tipsContainer.appendChild(p);
    });

    // Common Mistakes
    const mistakesContainer = document.getElementById('common-mistakes');
    mistakesContainer.innerHTML = '';
    recipe.mistakes.forEach(mistake => {
      const p = document.createElement('p');
      p.className = 'mistake-text';
      p.textContent = mistake;
      mistakesContainer.appendChild(p);
    });

    // Plating, Serving, Storage
    document.getElementById('plating-suggestions').textContent = recipe.plating;
    document.getElementById('serving-suggestions').textContent = recipe.serving;
    document.getElementById('storage-instructions').textContent = recipe.storage;

    // Cost & Health Score
    document.getElementById('estimated-cost').textContent = recipe.cost.toUpperCase();
    document.getElementById('health-score').textContent = `${recipe.healthScore}/10`;

    // Nutritional Benefits
    const benefitsContainer = document.getElementById('nutritional-benefits');
    benefitsContainer.innerHTML = '';
    recipe.benefits.forEach(benefit => {
      const li = document.createElement('li');
      li.textContent = benefit;
      benefitsContainer.appendChild(li);
    });

    // Substitutions Table
    const subsBody = document.getElementById('substitutions-body');
    subsBody.innerHTML = '';
    if (recipe.substitutions && recipe.substitutions.length > 0) {
      recipe.substitutions.forEach(sub => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${capitalize(sub.original)}</strong></td>
          <td>${capitalize(sub.substitute)}</td>
          <td>${sub.notes}</td>
        `;
        subsBody.appendChild(tr);
      });
      document.getElementById('substitutions-section').style.display = 'block';
    } else {
      document.getElementById('substitutions-section').style.display = 'none';
    }

    // Fun Fact
    document.getElementById('fun-fact').textContent = recipe.funFact;

    // Set Favorite Button State
    updateFavoriteBtnUI(recipe.id);
  }

  function createIngredientItem(container, name, isOwned, factor) {
    const li = document.createElement('li');
    li.className = 'ingredient-item';
    
    // Simple scaling description representation if matching number
    let qtyText = '';
    // Look for numbers in ingredient to scale them: e.g. "2 chicken breasts" -> "4 chicken breasts"
    const numRegex = /^(\d+(\.\d+)?)\s/;
    const match = name.match(numRegex);
    if (match) {
      const val = parseFloat(match[1]);
      const scaledVal = (val * factor).toFixed(match[1].includes('.') ? 1 : 0);
      name = name.replace(numRegex, `${scaledVal} `);
    }

    li.innerHTML = `
      <label class="ingredient-checkbox-wrapper">
        <input type="checkbox" class="ingredient-checkbox">
        <span class="checkbox-custom"></span>
        <span class="ingredient-name ${isOwned ? 'owned-ingredient' : ''}">
          ${name} ${isOwned ? '<span class="owned-badge">On Hand</span>' : ''}
        </span>
      </label>
    `;
    container.appendChild(li);
  }

  // ==========================================
  // ANIMATE NUTRITION COUNTERS
  // ==========================================
  function animateNutritionCounter(type, targetVal, maxVal) {
    const valueEl = document.getElementById(`${type}-value`);
    const fillEl = document.getElementById(`${type}-fill`);
    
    let current = 0;
    const duration = 1000; // 1s
    const stepTime = Math.max(Math.floor(duration / targetVal), 15);
    
    const timer = setInterval(() => {
      current += Math.ceil(targetVal / 30);
      if (current >= targetVal) {
        current = targetVal;
        clearInterval(timer);
      }
      valueEl.textContent = current;
      
      // Calculate Dash Offset for Circle Progress
      const percentage = Math.min((current / maxVal) * 100, 100);
      const radius = 42;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;
      fillEl.style.strokeDasharray = `${circumference} ${circumference}`;
      fillEl.style.strokeDashoffset = strokeDashoffset;
    }, stepTime);
  }

  // ==========================================
  // AUTHENTICATION INTERACTION & SESSION SYNC
  // ==========================================
  
  // Show / Hide Auth Modal
  authNavBtn.addEventListener('click', () => {
    if (state.token) {
      // Log Out
      logoutUser();
    } else {
      // Show Modal
      showAuthGate();
    }
  });

  authModalClose.addEventListener('click', () => {
    // Only allow closing if user is logged in
    if (state.token && state.user) {
      closeAuthModal();
    }
  });

  // Close modal when clicking backdrop — only if logged in
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal && state.token && state.user) {
      closeAuthModal();
    }
  });

  function closeAuthModal() {
    authModal.setAttribute('hidden', 'true');
    authModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('auth-locked');
    formLogin.reset();
    formSignup.reset();
  }

  // Show login gate — blocks the entire UI until user logs in
  function showAuthGate() {
    authModal.removeAttribute('hidden');
    authModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('auth-locked');
  }



  // Switch between Sign In / Register tabs
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabSignup.classList.remove('active');
    tabSignup.setAttribute('aria-selected', 'false');
    formLogin.style.display = 'flex';
    formSignup.style.display = 'none';
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabSignup.setAttribute('aria-selected', 'true');
    tabLogin.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'false');
    formSignup.style.display = 'flex';
    formLogin.style.display = 'none';
  });

  // Form Submit: Login
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsernameInput.value;
    const password = loginPasswordInput.value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save credentials
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('vanta_token', data.token);

      showToast(`Welcome back, ${data.user.username}!`, 'success');
      updateAuthUI();
      syncFavorites();
      closeAuthModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Form Submit: Signup
  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = signupUsernameInput.value;
    const password = signupPasswordInput.value;
    const confirmPassword = signupPasswordConfirmInput.value;

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('vanta_token', data.token);

      showToast('Account created successfully!', 'success');
      updateAuthUI();
      syncFavorites();
      closeAuthModal();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Logout User
  function logoutUser() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('vanta_token');
    localStorage.removeItem('chefai_token');
    
    showToast('Logged out successfully.', 'info');
    updateAuthUI();
    
    // Hide Admin elements
    navAdminLink.setAttribute('hidden', 'true');
    if (window.location.hash === '#admin') {
      window.location.hash = '#home';
    }
    
    // Load offline favorites
    state.favorites = JSON.parse(localStorage.getItem('vanta_favorites') || localStorage.getItem('chefai_favorites') || '[]');
    renderFavorites();
    if (activeGeneratedRecipe) {
      updateFavoriteBtnUI(activeGeneratedRecipe.id);
    }

    // Force the login gate to reappear
    showAuthGate();
  }

  // Update navbar layout for signed-in user
  function updateAuthUI() {
    if (state.token && state.user) {
      authBtnText.textContent = `Sign Out (${state.user.username})`;
      authNavBtn.classList.remove('btn--secondary');
      authNavBtn.classList.add('btn--outline');
      
      // Toggle Admin Nav Visibility
      if (state.user.role === 'admin') {
        navAdminLink.removeAttribute('hidden');
      } else {
        navAdminLink.setAttribute('hidden', 'true');
      }
    } else {
      authBtnText.textContent = 'Sign In';
      authNavBtn.classList.remove('btn--outline');
      authNavBtn.classList.add('btn--secondary');
      navAdminLink.setAttribute('hidden', 'true');
    }
  }

  // Sync Favorites with Database
  async function syncFavorites() {
    if (!state.token) return;

    try {
      const response = await fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        state.favorites = data.favorites;
        renderFavorites();
        if (activeGeneratedRecipe) {
          updateFavoriteBtnUI(activeGeneratedRecipe.id);
        }
      }
    } catch (err) {
      console.error('Failed to sync favorites with database:', err);
    }
  }

  // Check user session on load
  async function verifySession() {
    if (!state.token) {
      // No token — show login gate immediately
      showAuthGate();
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        state.user = data.user;
        updateAuthUI();
        syncFavorites();
        // Load admin panel if current page is admin
        if (window.location.hash === '#admin') {
          loadAdminDashboard();
        }
      } else {
        logoutUser();
      }
    } catch (err) {
      console.error('Session verification failed:', err);
      updateAuthUI();
      showAuthGate();
    }
  }

  // Trigger session validation on load
  verifySession();

  // ==========================================
  // GOOGLE AUTHENTICATION INTEGRATION
  // ==========================================
  
  // Global callback for Google OAuth ticket response
  window.handleGoogleCredentialResponse = async (response, isMock = false) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credential: response.credential,
          isMock: isMock
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('vanta_token', data.token);

      showToast(`Welcome, ${data.user.username}!`, 'success');
      updateAuthUI();
      syncFavorites();
      closeAuthModal();
      
      if (data.user.role === 'admin' && window.location.hash === '#admin') {
        loadAdminDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error');
      console.error('Google sign-in verification failed:', err);
    }
  };

  async function initializeGoogleOAuth() {
    try {
      const configRes = await fetch('/api/config');
      const config = await configRes.json();
      
      const isClientConfigured = config.googleClientId && 
                                config.googleClientId !== 'your_google_client_id_here' && 
                                config.googleClientId.trim() !== '';

      const googleBtn = document.getElementById('google-signin-btn');

      if (isClientConfigured && window.google) {
        // Real Google Identity Sign-in popup integration
        google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: window.handleGoogleCredentialResponse
        });
        
        google.accounts.id.renderButton(
          googleBtn,
          { theme: 'outline', size: 'large', width: '280' }
        );
      } else {
        // Render styled Google sign-in button
        googleBtn.innerHTML = `
          <button type="button" class="btn btn-outline" style="display:flex; align-items:center; gap:10px; padding:10px 24px; border:1px solid var(--glass-border-hover); border-radius:var(--radius-md); font-weight:600; width:280px; justify-content:center; background:rgba(255,255,255,0.05); cursor:pointer; color:var(--text-primary);">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 15.02.75 12 .75 7.37.75 3.4 3.42 1.48 7.31l3.87 3C6.27 7.42 8.9 5.04 12 5.04z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.66-5.02 3.66-8.65z"/><path fill="#FBBC05" d="M5.35 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31L1.48 6.7C.54 8.59 0 10.74 0 13s.54 4.41 1.48 6.3l3.87-2.99z"/><path fill="#34A853" d="M12 23.25c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.04.7-2.38 1.12-4.19 1.12-3.1 0-5.73-2.38-6.65-5.27L1.48 16.3c1.92 3.89 5.89 6.95 10.52 6.95z"/></svg>
            Sign In with Google
          </button>
        `;
        googleBtn.querySelector('button').addEventListener('click', () => {
          showToast('Google Sign-In is not configured. Please set up GOOGLE_CLIENT_ID in Vercel environment variables.', 'error');
        });
      }
    } catch (err) {
      console.warn('Failed to load Google client config:', err);
    }
  }

  // Load Google SDK Client on startup
  setTimeout(initializeGoogleOAuth, 1000);

  // ==========================================
  // ADMIN CONTROL PANEL ACTIONS
  // ==========================================
  
  async function loadAdminDashboard() {
    if (!state.token || !state.user || state.user.role !== 'admin') {
      showToast('Unauthorized access. Admin role required.', 'error');
      window.location.hash = '#home';
      return;
    }

    try {
      // Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        adminStatUsers.textContent = statsData.stats.totalUsers;
        adminStatFavorites.textContent = statsData.stats.totalFavorites;
      }

      // Fetch Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        renderAdminUsers(usersData.users);
      }
    } catch (err) {
      showToast('Failed to load admin stats.', 'error');
      console.error('Admin dashboard fetching failed:', err);
    }
  }

  function renderAdminUsers(users) {
    adminUsersTableBody.innerHTML = '';
    
    users.forEach(u => {
      const tr = document.createElement('tr');
      const isSelf = u.id === state.user.id;
      
      tr.innerHTML = `
        <td>${u.id.substring(u.id.length - 8)}</td>
        <td><strong>${u.username}</strong></td>
        <td>${u.email}</td>
        <td>${u.googleAccount ? '🌐 Google OAuth' : '🔑 Password'}</td>
        <td><span class="owned-badge" style="background: ${u.role === 'admin' ? 'rgba(212,175,55,0.1)' : 'rgba(16,185,129,0.1)'}; color: ${u.role === 'admin' ? 'var(--accent-gold-dark)' : 'var(--primary)'};">${u.role}</span></td>
        <td>
          <button type="button" class="btn btn-sm btn--outline delete-user-btn" data-id="${u.id}" ${isSelf ? 'disabled' : ''} style="padding: 4px 8px; font-size: 0.75rem; border-color: var(--error); color: var(--error);">Delete</button>
        </td>
      `;
      
      if (!isSelf) {
        tr.querySelector('.delete-user-btn').addEventListener('click', () => {
          deleteUserAccount(u.id, u.username);
        });
      }
      
      adminUsersTableBody.appendChild(tr);
    });
  }

  async function deleteUserAccount(userId, username) {
    if (!confirm(`Are you absolutely sure you want to delete user "${username}" and all their saved favorites?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast(`User "${username}" deleted successfully!`, 'success');
        loadAdminDashboard();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Handle Admin Link Click
  navAdminLink.addEventListener('click', (e) => {
    e.preventDefault();
    adminPanel.removeAttribute('hidden');
    loadAdminDashboard();
    adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ==========================================
  // FAVORITES MANAGEMENT
  // ==========================================
  const saveFavoriteBtn = document.getElementById('save-favorite-btn');
  saveFavoriteBtn.addEventListener('click', async () => {
    if (!activeGeneratedRecipe) return;
    
    const index = state.favorites.findIndex(r => r.id === activeGeneratedRecipe.id);
    
    if (state.token) {
      // Logged in: DB sync
      try {
        if (index > -1) {
          const response = await fetch(`/api/favorites/${activeGeneratedRecipe.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
          });
          if (response.ok) {
            state.favorites.splice(index, 1);
            showToast('Removed from database favorites.', 'info');
          } else {
            showToast('Failed to remove favorite from database.', 'error');
          }
        } else {
          const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ recipe: activeGeneratedRecipe })
          });
          if (response.ok) {
            state.favorites.push(activeGeneratedRecipe);
            showToast('Added to database favorites!', 'success');
          } else {
            showToast('Failed to add favorite to database.', 'error');
          }
        }
      } catch (err) {
        showToast('Database connection failed.', 'error');
      }
    } else {
      // Guest: localStorage sync
      if (index > -1) {
        state.favorites.splice(index, 1);
        showToast('Removed from local favorites.', 'info');
      } else {
        state.favorites.push(activeGeneratedRecipe);
        showToast('Added to local favorites! Sign in to sync with database.', 'success');
      }
      localStorage.setItem('vanta_favorites', JSON.stringify(state.favorites));
    }
    
    updateFavoriteBtnUI(activeGeneratedRecipe.id);
    renderFavorites();
  });

  function updateFavoriteBtnUI(recipeId) {
    const isFav = state.favorites.some(r => r.id === recipeId);
    if (isFav) {
      saveFavoriteBtn.classList.add('favorite-active');
      saveFavoriteBtn.querySelector('span').textContent = 'Saved!';
    } else {
      saveFavoriteBtn.classList.remove('favorite-active');
      saveFavoriteBtn.querySelector('span').textContent = 'Save to Favorites';
    }
  }

  function renderFavorites() {
    favoritesGrid.innerHTML = '';
    
    if (state.favorites.length === 0) {
      favoritesGrid.style.display = 'none';
      favoritesEmpty.style.display = 'flex';
      return;
    }

    favoritesGrid.style.display = 'grid';
    favoritesEmpty.style.display = 'none';

    state.favorites.forEach(recipe => {
      const card = document.createElement('article');
      card.className = 'favorite-recipe-card glass-panel';
      card.innerHTML = `
        <h4 class="fav-card-title">${recipe.name}</h4>
        <p class="fav-card-desc">${recipe.description.substring(0, 80)}...</p>
        <div class="fav-card-meta">
          <span>🔪 ${recipe.prepTime + recipe.cookTime} mins</span>
          <span>⭐ ${capitalize(recipe.difficulty)}</span>
        </div>
        <div class="fav-card-actions">
          <button type="button" class="view-fav-btn" data-id="${recipe.id}">View Recipe</button>
          <button type="button" class="remove-fav-btn" data-id="${recipe.id}" aria-label="Remove favorite">&times;</button>
        </div>
      `;

      // View Button
      card.querySelector('.view-fav-btn').addEventListener('click', () => {
        activeGeneratedRecipe = recipe;
        renderRecipe(recipe);
        recipeOutput.removeAttribute('hidden');
        recipeOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      // Remove Button
      card.querySelector('.remove-fav-btn').addEventListener('click', async () => {
        if (state.token) {
          try {
            const response = await fetch(`/api/favorites/${recipe.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${state.token}` }
            });
            if (response.ok) {
              state.favorites = state.favorites.filter(r => r.id !== recipe.id);
              showToast('Removed from database favorites.', 'info');
              renderFavorites();
              if (activeGeneratedRecipe && activeGeneratedRecipe.id === recipe.id) {
                updateFavoriteBtnUI(recipe.id);
              }
            } else {
              showToast('Failed to remove from database.', 'error');
            }
          } catch (err) {
            showToast('Database error occurred.', 'error');
          }
        } else {
          state.favorites = state.favorites.filter(r => r.id !== recipe.id);
          localStorage.setItem('vanta_favorites', JSON.stringify(state.favorites));
          showToast('Removed from local favorites.', 'info');
          renderFavorites();
          if (activeGeneratedRecipe && activeGeneratedRecipe.id === recipe.id) {
            updateFavoriteBtnUI(recipe.id);
          }
        }
      });

      favoritesGrid.appendChild(card);
    });
  }

  // ==========================================
  // GENERAL ACTION UTILITIES
  // ==========================================
  // Copy Recipe
  document.getElementById('copy-recipe-btn').addEventListener('click', () => {
    if (!activeGeneratedRecipe) return;
    
    let recipeText = `${activeGeneratedRecipe.name}\n\n`;
    recipeText += `${activeGeneratedRecipe.description}\n\n`;
    recipeText += `Prep Time: ${activeGeneratedRecipe.prepTime} min | Cook Time: ${activeGeneratedRecipe.cookTime} min\n\n`;
    recipeText += `Ingredients:\n`;
    activeGeneratedRecipe.requiredIngredients.forEach(ing => recipeText += `- ${ing}\n`);
    activeGeneratedRecipe.optionalIngredients.forEach(ing => recipeText += `- ${ing} (optional)\n`);
    activeGeneratedRecipe.additionalNeeded.forEach(ing => recipeText += `- ${ing} (needed)\n`);
    recipeText += `\nInstructions:\n`;
    activeGeneratedRecipe.instructions.forEach((step, idx) => recipeText += `${idx + 1}. ${step}\n`);
    
    navigator.clipboard.writeText(recipeText).then(() => {
      showToast('Recipe copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy recipe.', 'error');
    });
  });

  // Print Recipe
  document.getElementById('print-recipe-btn').addEventListener('click', () => {
    window.print();
  });

  // Share Recipe
  document.getElementById('share-recipe-btn').addEventListener('click', () => {
    if (!activeGeneratedRecipe) return;

    if (navigator.share) {
      navigator.share({
        title: activeGeneratedRecipe.name,
        text: activeGeneratedRecipe.description,
        url: window.location.href
      }).then(() => {
        showToast('Recipe shared successfully!', 'success');
      }).catch((err) => {
        console.error('Error sharing:', err);
      });
    } else {
      showToast('Sharing is not supported on this device. Copy link instead!', 'info');
    }
  });

  // Generate Another Button
  document.getElementById('generate-another-btn').addEventListener('click', () => {
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
  });

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    });

    toastContainer.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // ==========================================
  // DECORATIVE EFFECTS (Confetti)
  // ==========================================
  function triggerConfetti() {
    // Simple custom pure JS confetti particle generator
    const colors = ['#ff6b35', '#f7931e', '#ffd700', '#ffb347', '#4ecdc4'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.width = `${Math.random() * 8 + 6}px`;
      p.style.height = `${Math.random() * 8 + 6}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = `-10px`;
      p.style.borderRadius = '50%';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      const speed = Math.random() * 3 + 2;
      const curve = Math.random() * 2 - 1;
      
      container.appendChild(p);

      let currentTop = -10;
      let currentLeft = parseFloat(p.style.left);
      
      const fall = setInterval(() => {
        currentTop += speed;
        currentLeft += curve;
        p.style.top = `${currentTop}px`;
        p.style.left = `${currentLeft}px`;
        
        if (currentTop > window.innerHeight) {
          clearInterval(fall);
          p.remove();
        }
      }, 16);
    }

    setTimeout(() => container.remove(), 5000);
  }

  // ==========================================
  // UTILITY HELPER FUNCTIONS
  // ==========================================
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
