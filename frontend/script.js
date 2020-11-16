$(function () {
    renderLogo();
    renderLoginForm();
    //loginOnClick();
    //homePageContent()
})

const $root = $('#root');

const renderLogo = function () {
    $root.append(`<figure class="image container is-128x128">
                        <img src="logo.png/"
                    </figure>`)
}


const homePageContent = function(){
    $root.append(`<section class="hero is-medium is-bold">
<div class="hero-body">
<div class="container">
<h1 class="title has-text-white has-text-left">
Foodies Welcome
</h1>
</div>
</div>
</section>`)
}
const renderLoginForm = function () {
    //const $root = $('#root');

    $root.append(`<div class="hero">
                    <div class="hero-body">                   
                        <div class="container">                      
                            <div class="columns is-centered">                      
                                <div class="column is-4-desktop">                            
                                    <form class="box">
                                       <div class="field">
                                           <label class="label">Email</label>
                                        <p class="control has-icons-left has-icons-right">                                        
                                            <input class="input" id="userEmail"  type="email" placeholder="Email">
                                                <span class="icon is-small is-left">
                                                    <i class="fas fa-at"></i>    
                                                </span>
                                                <span class="icon is-small is-right">
                                                    <i class="fas fa-check"></i>
                                                </span>
                                        </p>
                                        </div>
                                            <div class="field">
                                            <label class="label">Password</label>
                                              <p class="control has-icons-left">
                                                <input class="input" id="userPassword" type="password" placeholder="Password">
                                                <span class="icon is-small is-left">
                                                  <i class="fas fa-lock"></i>
                                                </span>
                                              </p>
                                            </div>
                                        <div class="field">
                                                <a href="#">Sign up</a>                                                             
                                        </div>
                                        <div class="field">
                                                <a href="#">Forgot Password?</a>                                                             
                                        </div>                                                                      
                                        <div class="field">
                                          <p class="control">
                                            <button class="button is-rounded is-success loginButton">
                                              Login
                                            </button>
                                          </p>
                                        </div>
                                    
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`)


}

const renderSignUpModal = function(){

}

const loginOnClick = function () {
    //const $root = $('#root');

    let userEmail = ''
    let userPassword = ''
    $root.on('click', '.loginButton', function () {
        userEmail = $("input#userEmail").val()
        userPassword = $("input#userPassword").val()
    })
}