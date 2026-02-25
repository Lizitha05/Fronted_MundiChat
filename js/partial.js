fetch("/Html/partial/header.html") .then(response => response.text()) .then(data => { document.getElementById("header").innerHTML = data; });


fetch("/Html/partial/header-login.html") .then(response => response.text()) .then(data => { document.getElementById("header-login").innerHTML = data; });