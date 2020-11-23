$(function () {
    renderLogo();
    renderLoginForm();
    loginOnClick();
    signUpOnClick();
})

const $root = $('#root');

const renderLogo = function () {
    $root.append(`<figure class="image container is-128x128">
                        <img src="logo.png">
                    </figure>`)
}
const renderLoginForm = function (){
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
                                                <div class="control">
                                                    <p id="message"></p>
                                                </div>
                                            </div>                                    
                                        <div class="field">
                                                <a href="#">Forgot Password?</a>                                                             
                                        </div>                                                                      
                                        <div class="field">
                                          <p class="control">
                                            <button type="button" class="button is-rounded is-success loginButton">
                                              Login
                                            </button>
                                            <button type="button" class="button is-rounded is-danger signUpButton">
                                              Sign Up
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
const renderSignUpModal = function() {

    let modal = document.createElement('div');
    modal.setAttribute('class','modal is-active');

    modal.innerHTML = `
        <div class="modal-background"></div>
              <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Please fill in your information to create an account!</p>
                </header>
            <section class="modal-card-body">
                <form class="box">
                   
                    <div class="field">
                    <label class="label">Email</label>
                       <p class="control has-icons-left has-icons-right">                                        
                          <input class="input" id="newUserEmail"  type="email" placeholder="Email">
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
                           <input class="input" id="newUserPassword" type="input" placeholder="Password">
                             <span class="icon is-small is-left">
                               <i class="fas fa-lock"></i>
                             </span>
                         </p>
                       </div> 
                                                                   
                </form>
               </section>
        <footer class="modal-card-foot">
             <button class="button is-success" id="createButtonID" >Create account!</button>
                <button class="button" id="cancelButton" onclick="$('.modal').removeClass('is-active');">Cancel</button>
`

    let newUserEmail = ''
    let newUserPassword = ''

    $root.on('click','#createButtonID',function(){
        $('.modal').removeClass('is-active');
        newUserEmail = $("input#newUserEmail").val()
        newUserPassword = $("input#newUserPassword").val()
        createUserLogin(newUserEmail,newUserPassword);
    })

    $root.append(modal)
}

const loginOnClick = function () {
    //const $root = $('#root');

    let userEmail = ''
    let userPassword = ''
    $root.on('click', '.loginButton', function () {
        userEmail = $("input#userEmail").val()
        userPassword = $("input#userPassword").val()
        verifyLogin(userEmail,userPassword)
    })
}
const signUpOnClick = function() {
    $root.on('click','.signUpButton',function () {
        //alert('hello')
        renderSignUpModal()
    })
}
async function getUserInfo(){
    let response = await $.ajax("http://localhost:3000/users",{
        type: "GET",
        dataType: "json",
    })
    $root.append(JSON.stringify(response))
}
async function getUserID(){
    let response = await $.ajax("http://localhost:3000/userids",{
        type: "GET",
        dataType: "json",
    })
    $root.append(JSON.stringify(response))
}

//User sign up request
async function createUserLogin(email,password){
    let response = await $.ajax("http://localhost:3000/user", {
        type: "POST",
        dataType: "JSON",
        data: {
            "email": email,
            "password": password,
        }
    })
}
//Login credential verification
async function verifyLogin(email,password){
    const $message = $('#message');
    if (email == "" || password == "") {
        $message.html('<span class="has-text-danger">Something went wrong and you were not logged in. Check your email and password and your internet connection.</span>')
        return;
    }
    await $.ajax("http://localhost:3000/login", {
        method: "POST",
        dataType: "JSON",
        data: {
            "email": email,
            "password": password,
        }
    }).then((user) => {
        $message.html('<span class="has-text-success">Success! You are now logged in.</span>');
        setTimeout(function () {
            window.sessionStorage.setItem("userID", user.id.toString())
            window.location.href = "dashboard.html";
        }, 2000);
    }).catch(() => {
        $message.html('<span class="has-text-danger">Something went wrong and you were not logged in. Check your email and password and your internet connection.</span>');
    })
}
