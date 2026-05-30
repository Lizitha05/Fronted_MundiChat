fetch("/header") .then(response => response.text()) .then(data => { document.getElementById("header").innerHTML = data; });


fetch("/header-login") .then(response => response.text()) .then(data => { document.getElementById("header-login").innerHTML = data; });