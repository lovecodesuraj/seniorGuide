console.log("here")
   var loginForm = document.getElementById("loginForm");
   loginForm.onsubmit = function() {
      // window.sessionStorage('userName',document.querySelector('input[name=userName]').value);
      // window.sessionStorage('password',document.querySelector('input[name=password]').value);
   this.setAttribute('action', "/home");
}


