<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MundiChat - Chat Messages</title>
    <link rel="stylesheet" href="/css/header.css">
    <link rel="stylesheet" href="/css/messageChat.css">
</head>
<script defer src="http://localhost:3000/socket.io/socket.io.js"></script>
<script defer src="/js/script_chat.js"></script>

<body>

    <?php require 'controller/header-login.php'; ?>


    <div class="chatConteiner">
        <div class="wrapperFirst">

            <div class="conteinerChats">
                <div class="chatUser">
                    <img src="/Image/perfil1.png" alt="" class="listPhoto">
                    <div class="content">
                        <label class="lChat" for="">Karen Abigail Guerra Lozano</label>

                        <input class="iChat" type="text" value="Eh we,pescado!" disabled>
                    </div>
                </div>

                <div class="chatUser">
                    <img src="/Image/perfil1.png" alt="" class="listPhoto">
                    <div class="content">
                        <label class="lChat" for="">Karen Abigail Guerra Lozano</label>

                        <input class="iChat" type="text" value="Eh we,pescado!" disabled>
                    </div>
                </div>

                <div class="chatUser">
                    <img src="/Image/perfil1.png" alt="" class="listPhoto">
                    <div class="content">
                        <label class="lChat" for="">Karen Abigail Guerra Lozano</label>

                        <input class="iChat" type="text" value="Eh we,pescado!" disabled>
                    </div>
                </div>
            </div>
        </div>

        <div class="wrapperSecond">
            <div class="headerChat">
                <img src="/Image/perfil1.png" alt="" class="profileChat">
                <input class="iUser" type="text" value="Karen Abigail Guerra Lozano">
            </div>
            
            <div class="message">

                <div id="message-container"></div>
                <div class="sendMessage">
                    <form id="send-container">
                        <label class="iDoc">
                            <input type="file" class="hiddenFile">
                        </label>

                        <input class="imessage" type="text" id="message-input">

                        <button class="btnSend" id="send-button"><img class="imgSend" src="/icons/icon-enviar.png" alt=""></button>
                    </form>

                </div>

            </div>

        </div>
    </div>

</body>

<script src="/js/partial.js"></script>

</html>