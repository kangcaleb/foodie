const createRecipeList = async () => {
    const list = $('<div id="recipes-list" class="container"></div>')

    const result = await requestRecipes('0')
    console.log(result)
    const recipes = result.recipes

    console.log(recipes)

    recipes.forEach((recipe) => {
        const recipeCard = createRecipeCard(recipe)
        list.append(recipeCard)
    })

    return list
}

//Give a recipe object from Edamam Documentation
const createRecipeCard = (recipe) => {
    const recipeCard = `<div class="card">
                        <div class="card-image">
                            <figure class="image is-4by3">
                                <img src="recipe.image" alt="Placeholder image">
                            </figure>
                        </div>
                          <div class="card-content">
                            <div class="media">
                              <div class="media-content">
                                <p class="title is-4">${recipe.label}</p>
                              </div>
                            </div>
                        
                            <div class="content">
                              Calories: ${recipe.calories}
                              <br>
                              <a href="${recipe.url}">More</a>
                            </div>
                          </div>
                   </div>`

    return recipeCard
}

const requestRecipes = async (id) => {
    let result = await fetch ('http://localhost:3000/user/' + id + '/data')

    return result.json()
}