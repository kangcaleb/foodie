const createRecipeList = async () => {
    const list = $('<div id="recipes-list" class="container"></div>')

    const user = await getCurrentUser()
    console.log(user)

    const result = await requestRecipes(user.id) // TODO make this line get the current user not just the user at 0
    const recipes = result.recipes

    for (let i=0; i<recipes.length; i++) {
        const recipeUri = recipes[i]
        const recipe = await requestRecipeSearch('r', recipeUri)
        const recipeCard = createRecipeCard(recipe[0])
        list.append(recipeCard)
    }

    return list
}

//Give a recipe object from Edamam Documentation
const createRecipeCard = (recipe) => {
    const recipeCard = `<div class="card">
                        <div class="card-image">
                            <figure class="image is-128x128">
                                <img src="${recipe.image}" alt="Placeholder image">
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
                   </div>
                    <br>`

    return recipeCard
}

const requestRecipes = async (id) => {
    let result = await fetch ('http://localhost:3000/user/' + id + '/data')
    return result.json()
}

/*use the recipe api to make a fetch, results the result*/
const requestRecipeSearch = async (type, search) => {
    let baseUrl = 'https://api.edamam.com/search?'
    baseUrl = baseUrl + (type + '=' + search)

    baseUrl = baseUrl + '&app_id=' + app_id
    baseUrl = baseUrl + '&app_key=' + app_key

    const url = baseUrl.replace('#', '%23')

    const result = await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })

    return result.json();
}