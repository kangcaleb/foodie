const createRecipeList = async () => {
    const list = $('<div id="recipes-list" class="container"></div>')

    const user = await getCurrentUser()

    const result = await requestRecipes(user)
    const recipes = result.recipes

    for (let i=0; i<recipes.length; i++) {
        const recipeObj = recipes[i]
        const recipeCard = createRecipeCard(recipeObj)
        list.append(recipeCard)
    }

    return list
}

const getCurrentUser = async () => {
    const result = await fetch(location.origin+'/login', {
        method: "GET"
    })

    return result.json()
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
    let result = await fetch (location.origin+'/user/' + id + '/data')
    return result.json()
}

/*use the recipe api to make a fetch, results the result*/
/*Return 30 results from the search*/
/*Infinite scrolling not supported due to api call limit */
const requestRecipeSearch = async (type, search) => {
    let baseUrl = 'https://api.edamam.com/search?'
    baseUrl = baseUrl + (type + '=' + search)

    baseUrl = baseUrl + '&app_id=' + app_id
    baseUrl = baseUrl + '&app_key=' + app_key
    baseUrl = baseUrl + '&from=0&to=30'

    const url = baseUrl.replace('#', '%23')

    const result = await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })

    return result.json();
}

/** Search Edadam DB for a specific recipe with given ID*/
const requestRecipeSpecific = async (id) => {
    let baseUrl = 'https://api.edamam.com/api/recipes/v2/'
    baseUrl = baseUrl + id

    baseUrl += '?' // start entering params
    baseUrl += 'type=public'
    
    baseUrl = baseUrl + '&app_id=' + app_id
    baseUrl = baseUrl + '&app_key=' + app_key

    // select fields we want
    baseUrl += '&field=calories'
    baseUrl += '&field=dietLabels'
    baseUrl += '&field=image'
    baseUrl += '&field=healthLabels'
    baseUrl += '&field=label'
    baseUrl += '&field=yield'
    baseUrl += '&field=ingredientLines'
    baseUrl += '&field=url'


    const url = baseUrl.replace('#', '%23')

    const result = await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })

    return result.json();
}