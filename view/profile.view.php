<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MundiChat - profile</title>
    <link rel="stylesheet" href="/css/header.css">
    <link rel="stylesheet" href="/css/profile.css">

</head>

<body>
    <?php require 'controller/header-login.php'; ?>

    <div class="wrapperProfile">

        <div class="flexProf">

            <div class="wrapperImg">
                <img class="imgProf" src="/Image/perfil.png" alt="">

            </div>

            <div class="data">

                <h1 id="myProf">Mi perfil</h1>


                <label class="lData" for="">Andreiy Medrano Garcia</label>

                <label class="lData" for="">El pescado</label>
                <label class="lData" for="">05-12-03</label>
                <label class="lData" for="">pescado@gmail.completo</label>



                <div class="flexBtn">
                    <button class="btn-Prof"><a class="link" href="/events">Mis eventos</a></button>
                    <button class="btn-Prof"><a class="link" href="/coupon">Mis cupones</a></button>
                </div>
            </div>


        </div>

        <div class="wrapperTooltip">
            <a href="/editProfile"> <img class="imgEdit" src="/icons/icon-editProfile.png" alt="Editar"></a>
              
             <span class="tooltiptext">Editar perfil</span>
            

        </div>

    </div>
</body>

<script src="/js/partial.js"></script>
<script src="/js/profile.js"></script>

</html>