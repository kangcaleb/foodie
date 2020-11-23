$(function () {
    $root.append(createNavbar())
    $root.append(`<div id="root-content" class="container"></div>`)
    $('div#root-content').append(`<section class="section"><h1 class="title">Search for a Recipe!</h1></section>`)
    $('div#root-content').append(createSearch())

    configSearch()
    configNav()
})

const $root = $('#root');

const createNavbar = () => {
    const nav = `<nav class="navbar" role="navigation" aria-label="main navigation">
                      <div class="navbar-brand">
                        <a class="navbar-item" href="./dashboard.html">
                          <img src="logo.png" width="28" height="28">
                        </a>
                    
                        <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                          <span aria-hidden="true"></span>
                          <span aria-hidden="true"></span>
                          <span aria-hidden="true"></span>
                        </a>
                      </div>

                      <div id="navbarBasicExample" class="navbar-menu">
                        <div class="navbar-start">
                          <a class="navbar-item" id="about">
                            About
                          </a>
                    
                          <a class="navbar-item" id="my-recipes">
                            My Recipes
                          </a>
                        </div>

                        <div class="navbar-end">
                          <div class="navbar-item">
                            <div class="buttons">
                              <a class="button is-primary" id="sign-out">
                                <strong>Sign Out</strong>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                  </nav>`
    return nav
}

/*creates and returns an html element (as a string) with a search bar and submit button*/
const createSearch = () => {
    const div = `<div class="field has-addons ">
                      <div class="control is-expanded">
                            <input id='recipe-search' autocomplete="on" class="input" type="text" placeholder="Your Favorite Recipe (or your girl's favorite recipe)">
                        </div>
                        <div class="control">
                             <button id='recipe-submit'class="button is-success searchButton" type="click">Search</button>
                        </div>
                </div>`

    return div

}

/*Adds callbacks to search submit button*/
const configSearch = () => {
    const submit = $('#recipe-submit')
    const searchBar = $('input#recipe-search')

    submit.on('click', () => {
        const searchText = searchBar.val()

        const searchResult = requestRecipeSearch('q', searchText)

        searchResult.then((res) => {
            renderSearchResults(res)
        }).catch((error) => {
            alert(error)
        })
    })
}

/*takes in api response from search query and appends to root*/
const renderSearchResults = (response) => {
    // right now it just makes a p element with the json content and appends to root

    for(let i=0; i<response.hits.length; i++){
        /*const results = `<div class="container">
                        <img src="${response.hits[i].recipe.image}" alt="placeholder">
                        <p>${response.hits[i].recipe.label}</p>
                    </div>`*/

        let calories = Math.round(response.hits[i].recipe.calories)
        let dietType = response.hits[i].recipe.dietLabels
        let recipeImage = response.hits[i].recipe.image
        let recipeName = response.hits[i].recipe.label
        let healthLabel = response.hits[i].recipe.healthLabels
        let serving = response.hits[i].recipe.yield

/*        if(dietType.isEmpty()){
            dietType = 'None'
        }*/

        const results = `
                        <br>
                        <div class="container">
                            <div class="card">
                               <div class="card-image">
                                <div class="content">
                                    <br>
                                    <figure class="image is-128x128">
                                      <img src="${recipeImage}" alt="Placeholder image">
                                    </figure>
                                </div>
                              </div>
                            <div class="card-content">
                                <div class="content">
                                  <p>${recipeName}</p>
                                  <p>Calories: ${calories}</p>
                                  <p>Serving: ${serving}</p>
                                  <p>Diet: ${dietType}</p>
                                  <p>Health Label: ${healthLabel}</p>
                                  <button class="button is-danger saveButton">Save</button>
                                  <button class="button infoButton">More Information</button>
                                </div>
                              </div>
                            </div>                         
                        </div>`

        $root.append(results)
        infoButtonOnClick(response)
    }
}

const infoButtonOnClick = (response) => {
    $root.on('click','.infoButton',function () {
        renderInformationModal(response)
    })
}

const saveButtonOnClick = () => {

}

const renderInformationModal = () => {
    let infoModal = document.createElement('div');
    infoModal.setAttribute('class','modal is-active');

    infoModal.innerHTML = `
        <div class="modal-background"></div>
              <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Ingredient and NutrientInfo</p>
                </header>
            <section class="modal-card-body">
                <form class="box">
                   <p></p>
                                                                                   
                </form>
               </section>
        <footer class="modal-card-foot">
        <button class="modal-close is-large" aria-label="close" id="cancelButton" onclick="$('.modal').removeClass('is-active');"></button>
        <!--<button class="modal-close is-large" aria-label="close"></button>-->
        
`
    $root.append(infoModal)
}

const configNav = () => {
    const signOut = $('a#sign-out')
    signOut.on('click', () => {
      logOutOnClick();
      alert('Signed out')
    })

    const about = $('a#about')
    about.on('click', () => {
        // TODO implement about page
        alert('about')
    })

    const myRecipes = $('a#my-recipes')
    myRecipes.on('click', () => {
        // TODO go to my recipes pages
        const rootContent = $('div#root-content')
        rootContent.empty()

        const list = createRecipeList()

        list.then((value) => {
            rootContent.append(value)
        }).catch((error) => {
            alert(error)
        })
    })
}

async function logOutOnClick() {
  await $.ajax("http://localhost:3000/logout", {
    type: "GET",
  }).then(() => {
    setTimeout(function () {
      window.location.href = "index.html";
    }, 1000);
  })
}