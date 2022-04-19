$(async function () {
    const user = await getCurrentUser()

    if (user == null) {
        alert("403 Forbidden")
        return
    }

    $root.append(createNavbar())
    $root.append(`<div id="root-content" class="container"></div>`)
    $('div#root-content').append(`<br><div class="columns is-centered"><h1 class="title is-2">Welcome, ${user}!</h1></div>`)
    $('div#root-content').append(createSearch())


    let ac = new AmazonAutocomplete({
        selector: '#recipe-search',
        delay: 200,
        showWords: true,
        hideOnblur: true
    })

    configSearch()
    configNav()
    myAccountOnClick()
    verifyOnClick()
})

const $root = $('#root');

const createNavbar = () => {
    const nav = `<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="./dashboard.html">
      <img src="../logo.png" width="30" height="30">
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
      <div class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link">
          Setting
        </a>
        <div class="navbar-dropdown">
          <a class="navbar-item myAccount">
            My Account
          </a>               
        </div>
      </div>    
      
        <div class="buttons">        
          <a class="button is-danger" id="sign-out">
            <strong>Sign out</strong>
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>
      `

    return nav
}

/*creates and returns an html element (as a string) with a search bar and submit button*/
const createSearch = () => {
    const div = `<br>
                    <div class="columns is-centered searchbar">
                    <div class="column is-half">
                     <div class="field has-addons">
                      <div class="control is-expanded">
                            <input id='recipe-search' autocomplete="on" class="input" type="text" placeholder="Your Favorite Recipe">
                        </div>
                        <div class="control">
                             <button id='recipe-submit'class="button is-success searchButton">Search</button>
                        </div>
                        </div>
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
            $('.searchResult').empty()
            renderSearchResults(res)
        }).catch((error) => {
            alert(error)
        })
    })
}

/*takes in api response from search query and appends to root*/
const renderSearchResults = (response) => {

    const $rootContent = $('div#root-content')
    $rootContent.append(`<div class="container wrapper" style="margin-top: 30px;"></div>`)

    for(let i=0; i<response.hits.length; i++){

        let calories = Math.round(response.hits[i].recipe.calories)
        let dietType = response.hits[i].recipe.dietLabels
        let recipeImage = response.hits[i].recipe.image
        let recipeName = response.hits[i].recipe.label
        let healthLabel = response.hits[i].recipe.healthLabels
        let serving = response.hits[i].recipe.yield
        let recipeuri = response.hits[i].recipe.uri
        const recipeid = recipeuri.slice(-32)

        const results = `<div class="container searchResult">
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
                                <div class="content" id="recipe:${recipeid}">
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
        
        $('div#root-content').append(results)
    }

    infoButtonOnClick(response);
    saveButtonOnClick(response);
}

const infoButtonOnClick = (response) => {
    $root.on('click','.infoButton',function (event) {
        const recipeid = event.target.parentNode.id.slice(-32)
        renderInformationModal(recipeid)
    })
}

const saveButtonOnClick = (response) => {
  $root.on('click', '.saveButton', function(event) {
    
    const recipeid = event.target.parentNode.id.slice(-32)
    saveRecipe(recipeid).then((success) => {
      event.target.parentNode.append(`Recipe Saved!`);
    }, (rejected) => {
      alert("recipe not saved:", rejected)
    });
  })
}

async function saveRecipe(recipeid) {
  let response = await $.ajax(location.origin+"/user/"+recipeid+"/recipe", {
    type: "POST",
    dataType: "JSON",
    data: {
        "recipeid": recipeid,
    }
  }).catch((error) => {
      alert(error)
  })

  if (response.dataType === Error.type) {
    return Promise.reject(response.detail)
  } else {
    return response
  }
}

const myAccountOnClick = () => {
    $root.on('click','.myAccount',function(){
        renderEditForm()
    })
}

const renderInformationModal = async (recipeid) => {
    const recipe = (await requestRecipeSpecific(recipeid)).recipe
    let ingredients = recipe.ingredientLines
    let url = recipe.url;

    let ingredList = ""
    ingredients.forEach(line => {
      ingredList += `<p>-` + line + `</p>`
    })

    let infoModal = document.createElement('div');
    infoModal.setAttribute('class','modal is-active');
    infoModal.innerHTML = `
        <div class="modal-background"></div>
              <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Ingredient and Source Info</p>
                </header>
            <section class="modal-card-body">
                <form class="box">
                  <h4>Ingredients:</h4>` +
                    ingredList +
                  `<a href = "${url}" target="_blank">Recipe Source</a>                                                    
                </form>
               </section>
        <footer class="modal-card-foot">
        <button class="modal-close is-large" aria-label="close" id="cancelButton" onclick="$('.modal').removeClass('is-active');"></button>`
    $root.append(infoModal)
}

const renderEditForm = () => {
    let editModal = document.createElement('div');
    editModal.setAttribute('class','modal is-active');
    editModal.innerHTML = `
        <div class="modal-background"></div>
              <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Edit User Information</p>
                </header>
            <section class="modal-card-body">
                <form class="box">
                    <div class="field">
                    <label class="label">Current Username</label>
                       <p class="control has-icons-left has-icons-right">                                        
                          <input class="input" id="currentUserEmail" type="email" placeholder="Current Email">
                            <span class="icon is-small is-left">
                               <i class="fas fa-at"></i>    
                            </span>
                       </p>                     
                     </div>
                     <div class="field">
                       <label class="label">Current Password</label>
                         <p class="control has-icons-left">
                           <input class="input" id="currentUserPassword" type="password" placeholder="Current Password">
                             <span class="icon is-small is-left">
                               <i class="fas fa-lock"></i>
                             </span>
                         </p>                       
                       </div>
                     <div class="field">
                     <div class="field">
                       <label class="label">New Password</label>
                         <p class="control has-icons-left">
                           <input class="input" id="newUserPassword" type="password" placeholder="New Password?">
                             <span class="icon is-small is-left">
                               <i class="fas fa-lock"></i>
                             </span>
                         </p>                       
                       </div>                                         
                </form>
                <div class="field">
                   <div class="control">
                        <p id="verificationMessage"></p>
                   </div>
                </div>
               </section>
        <footer class="modal-card-foot">
        <button class="button is-danger updateCredentialButton" >Update Credentials!</button>
        <button class="modal-close is-large" aria-label="close" id="cancelButton" onclick="$('.modal').removeClass('is-active');"></button>        
`
    $root.append(editModal)
}

const verifyOnClick = () => {

    let username = ''
    let password = ''
    let np = ''

    $root.on('click','.updateCredentialButton', function(){
      username = $('input#currentUserEmail').val()
        password = $('input#currentUserPassword').val()
        np = $('input#newUserPassword').val()
        verificationRequest(username,password,np)
    })
}

const configNav = () => {
    const signOut = $('a#sign-out')
    signOut.on('click', () => {
      logOutOnClick();
      alert('Signed out')
    })

    const about = $('a#about')
    about.on('click', () => {
      const rootContent = $('#root-content')
      rootContent.empty()
      renderAbout()
    })

    const myRecipes = $('a#my-recipes')
    myRecipes.on('click', () => {
        const rootContent = $('div#root-content')
        rootContent.empty()
        getRecipes();
    })
}

const renderAbout = () => {
  const rootContent = $('#root-content')
  rootContent.append(`<br><div class="columns is-centered"><h1 class="title is-2">About</h1></div>`)
  rootContent.append(`<div class="container searchResult">
                        <br><br>
                        <div class="card">
                        <p class="has-text-centered" style="padding: 20px"> Foodie was developed by George Chen, Chun Yeung, and
                          Caleb Kang, graduates from The University of North Carolina, Chapel Hill. Designed to help people keep
                          track of the seemingly endless number of recipes they want to try to cook, keep them all in one place. We
                          that it can be useful to that end. Shout out to KMP and for inspiring us to come up with this idea and for
                          motivating us to actually create it. Github for this project is <span><a href="https://github.com/kangcaleb/foodie">here</a></span>.
                          Enjoy!</p>
                      </div>
                        </div>`)
}

const renderMyRecipes = function(recipes) {
  const rootContent = $('div#root-content')
  if (recipes.length == 0) {
    rootContent.append(`<div class="container searchResult">
                          <br><br>
                          <div class="card">
                            <p class="is-size-2 has-text-centered"> Search for your own Recipes to save! </p>
                          </div>
                        </div>` 
    )
  }

  recipes.forEach(async (rec) => {
      const recipe = (await requestRecipeSpecific(rec.recipeid)).recipe

      let calories = Math.round(recipe.calories)
      let dietType = recipe.dietLabels
      let recipeImage = recipe.image
      let recipeName = recipe.label
      let healthLabel = recipe.healthLabels
      let serving = recipe.yield

        const results = `<div class="container searchResult">
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
                                <div class="content" id="savedRecipe:${rec.recipeid}">
                                  <p>${recipeName}</p>
                                  <p>Calories: ${calories}</p>
                                  <p>Serving: ${serving}</p>
                                  <p>Diet: ${dietType}</p>
                                  <p>Health Label: ${healthLabel}</p>
                                  <button class="button is-danger deleteButton">Delete</button>
                                  <button class="button myinfoButton">More Information</button>
                                  <button class="button is-warning notesButton">Personal Notes</button>
                                </div>
                              </div>
                            </div>                         
                        </div>`
        
        rootContent.append(results)
  })
  deleteButtonOnClick()
  myInfoButtonOnClick()
  notesButtonOnClick(recipes)
}

const deleteButtonOnClick = function() {
  $root.on('click', '.deleteButton', function(event) {
    let recipeid = event.target.parentNode.id.slice(12)

    deleteRecipe(recipeid).then(() => {
      event.target.parentNode.append(`Recipe Deleted!`);
    }, (rejected) => {
      alert(rejected)
    })
  })
}

async function deleteRecipe(recipeid) {
  let response = await $.ajax(location.origin+"/user/"+recipeid+"/recipe", {
    type: "DELETE",
    dataType: "JSON",
    data: {
        "recipeid": recipeid,
    }}).catch((error) => {
      alert(error)
    })

    if (response.command) {
        return response
    } else {
        return Promise.reject(response.detail)    }
}

const myInfoButtonOnClick = function(){
  $root.on('click','.myinfoButton',function (event) {
      const recipeid = event.target.parentNode.id.slice(12)
      renderInformationModal(recipeid)
  })
}

async function getRecipes() {
  let userid = await getCurrentUser()
  await $.ajax(location.origin+"/user/"+userid+"/data", {
    type: "GET",
    success: function(response) {
      renderMyRecipes(response)
    }
  })
}

const notesButtonOnClick = function(){
  $root.on('click', '.notesButton', function(event) {
    let recipeid = event.target.parentNode.id.slice(12)
    renderNotesModal(recipeid);
  })
}

const renderNotesModal = async function(recipeid){
    const notes = await notesRequest(recipeid)

    if(document.getElementById(recipeid) == null) {
      let notesModal = document.createElement('div');
      notesModal.setAttribute('class','modal is-active');
      notesModal.setAttribute('id', recipeid)
      notesModal.innerHTML = `
          <div class="modal-background"></div>
                <div class="modal-card">
                  <header class="modal-card-head">
                      <p class="modal-card-title">Ingredient and Source Info</p>
                  </header>
              <section class="modal-card-body">
                  <form class="box">
                    <p class="pnotes is-size-5" contenteditable="true">${notes}</p>                                             
                  </form>
              </section>
          <footer class="modal-card-foot">
          <button class="modal-close is-large" aria-label="close" id="cancelButton" onclick="$('.modal').removeClass('is-active');"></button>`
      $root.append(notesModal)

      $("#cancelButton").on('click', (event) => {
          const notesToSave = $("p.pnotes").text()

          postNotesRequest(recipeid, notesToSave).then((fulfilled) => {
              $('.modal').removeClass('is-active')
          }, (rejected) => {
            alert("failed to save note")
          })

      })

    } else {
      let noteModals = document.getElementById(recipeid);
      noteModals.setAttribute('class', 'modal is-active')
    }
}

async function logOutOnClick() {
  await $.ajax(location.origin+"/logout", {
    type: "GET",
  }).then(() => {
    setTimeout(function () {
      window.location.href = "../index.html";
    }, 1000);
  })
}

/*validate credentials to update password*/
async function verificationRequest(username,password,newPassword){
    const verificationMessage = document.getElementById("verificationMessage")
    await $.ajax(location.origin+"/user/"+username,{
        type: "PUT",
        data: {
            "username": username,
            "password": password,
            "newPassword": newPassword
        }
    }).then(() => {
        verificationMessage.innerHTML = '<span class="has-text-success">Credentials updated successfully</span>'
    }).catch(() => {
        verificationMessage.innerHTML = '<span class="has-text-danger">Invalid current email/password</span>'
    })
}

const notesRequest = async (recipeid) => {
  const result = await fetch(location.origin+'/notes/'+recipeid, {
      method: "GET"
  })

  return result.json()
}

const postNotesRequest = async (recipeid, notesToSave) => {
  const data = {notes: `${notesToSave}`}

  const result = await fetch(location.origin+'/notes/'+recipeid, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
  })

  return result.json()
}