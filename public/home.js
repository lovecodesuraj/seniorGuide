 <script>
   var loginForm = document.getElementById("loginForm");
   loginForm.onsubmit = function() {
   this.setAttribute('action', "/login/" + document.querySelector('input[name=userName]').value)
}
</script>