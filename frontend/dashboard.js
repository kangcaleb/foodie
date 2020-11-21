$(function () {
    $root.append(createNavbar())
    $root.append(`<div id="root-content" class="container"></div>`)
    $('div#root-content').append(`<section class="section"><h3 class="title -1">Search for a Recipe</h3></section>`)
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
    const div = `<div class="field container">
                      <div class="control">
                            <input id='recipe-search' autocomplete="on" class="input" type="text" placeholder="Your Favorite Recipe (or your girl's favorite recipe)">
                            <button id='recipe-submit'class="button is-success" type="click">Submit</button>
                    </div>
                </div>`

    return div
}

/*Adds callbacks to search submit buttom*/
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
    // this is from chun
    const results = `<div class="container">
                        <p>${JSON.stringify(response, null, 2)}</p>
                    </div>`

    $root.append(results)
}

const configNav = () => {
    const signOut = $('a#sign-out')
    signOut.on('click', () => {
        // TODO actually sign out and go to dashboard
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