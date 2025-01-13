const init = () => {
    listCameras();
    selectCamera();
    bindClickButtonGetFrames();
    bindClickButtonGetFrames1s();
    bindClickButtonBtnSenToServer();
}

const listCameras = () => {
    navigator.mediaDevices.getUserMedia({video: true})
    .then(() => {
        const mainElement = document.querySelector(".main");
        mainElement.style.display = "block";

        navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const cameras = devices.filter(device => device.kind === 'videoinput');

            const selectCam1Element = document.getElementById('sel-video-1');
            const selectCam2Element = document.getElementById('sel-video-2');

            cameras.forEach(cam => {
                const option1Element = document.createElement('option');
                option1Element.value = cam.deviceId;
                option1Element.textContent = cam.label;
                selectCam1Element.appendChild(option1Element);


                const option2Element = document.createElement('option');
                option2Element.value = cam.deviceId;
                option2Element.textContent = cam.label;
                selectCam2Element.appendChild(option2Element);
            });            
        });
    })
    .catch(error => {
        const errorElement = document.querySelector(".error");
        errorElement.append(error);
        errorElement.style.display = "block";

    });
}

const selectCamera = () => {
    const selectCam1Element = document.getElementById('sel-video-1');
    selectCam1Element.addEventListener('change', function(event) {
        const deviceId = event.target.value;
        const videoElement = document.querySelector("#lavAI-video-1");
        const videoFilteredElement = document.querySelector("#lavAI-video-filtered");
        if (deviceId === "") {
            videoElement.srcObject = null;
            videoFilteredElement.srcObject = null;
        }
        else {
            navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: deviceId}}})
            .then(stream => {
                videoElement.srcObject = stream;
                videoFilteredElement.srcObject = stream;
            });    
        }
    });

    const selectCam2Element = document.getElementById('sel-video-2');
    selectCam2Element.addEventListener('change', function(event) {
        const deviceId = event.target.value;
        const videoElement = document.querySelector("#lavAI-video-2");
        if (deviceId === "") {
            videoElement.srcObject = null;
        }
        else {
            navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: deviceId}}})
            .then(stream => {
                videoElement.srcObject = stream;
            });
        }
    });

}

const getFrame = (video1Element, video2Element) => {
    const canvas1Element = document.createElement("canvas");
    canvas1Element.height = video1Element.videoHeight;
    canvas1Element.width = video1Element.videoWidth;
    const context1 = canvas1Element.getContext("2d");
    context1.drawImage(video1Element, 0, 0);

    const canvas2Element = document.createElement("canvas");
    canvas2Element.height = video2Element.videoHeight;
    canvas2Element.width = video2Element.videoWidth;
    const context2 = canvas2Element.getContext("2d");
    context2.drawImage(video2Element, 0, 0);

    const divImg = document.createElement("div");
    divImg.append(canvas1Element);
    divImg.append(canvas2Element);

    const framesElement = document.querySelector("#lavAI-frames");
    framesElement.prepend(divImg);
}

const initWebSocket = () => {
    let socket = io.connect('ws://' + document.domain + ':' + location.port + '/ws');
        
    socket.on('connect', function() {
        const qtdImgsRecebidas = document.getElementById('qtdImgsRecebidas');
        qtdImgsRecebidas.textContent = '0';
    });

    socket.on('disconnect', function() {
        const qtdImgsRecebidas = document.getElementById('qtdImgsRecebidas');
        qtdImgsRecebidas.textContent = 'Desconectado';
    });

    socket.on('message', function(msg) {
        const qtdImgsRecebidas = document.getElementById('qtdImgsRecebidas');
        qtdImgsRecebidas.textContent = msg;
    });

    socket.on('error', function(error) {
        alert(error);
    });

    return socket;
}

const bindClickButtonGetFrames = () => {
    const buttonElement = document.querySelector("#lavAI-getFrame");
    buttonElement.addEventListener("click", () => {
        const selectCam1Element = document.getElementById('sel-video-1');
        const selectCam2Element = document.getElementById('sel-video-2');
    
        if ((selectCam1Element.value == "") || (selectCam2Element.value == "")) {
            alert("As câmeras devem esta selecionadas");
            return false;
        }
    
        const video1Element = document.querySelector("#lavAI-video-1");
        const video2Element = document.querySelector("#lavAI-video-2");
        getFrame(video1Element, video2Element);
    });
}

const bindClickButtonGetFrames1s = () => {
    const button1sElement = document.querySelector("#lavAI-getFrame-1s");
    button1sElement.addEventListener("click", () => {
        const selectCam1Element = document.getElementById('sel-video-1');
        const selectCam2Element = document.getElementById('sel-video-2');
    
        if ((selectCam1Element.value == "") || (selectCam2Element.value == "")) {
            alert("As câmeras devem esta selecionadas");
            return false;
        }

        let qtdFrames = 0;

        const video1Element = document.querySelector("#lavAI-video-1");
        const video2Element = document.querySelector("#lavAI-video-2");
        let myInterval = setInterval(() => {
            qtdFrames += 1;
            getFrame(video1Element, video2Element);
        }, 5);

        setTimeout(() => {
            clearInterval(myInterval);
            const qtdCaptElement = document.querySelector("#qtdCapt");
            qtdCaptElement.textContent = qtdFrames;
        }, 1000);
    });
}

const bindClickButtonBtnSenToServer = () => {
    let myInterval = null;
    let socket = null;

    const btnSenToServer = document.querySelector("#btnSenToServer");

    btnSenToServer.addEventListener("click", () => {
        const selectCam1Element = document.getElementById('sel-video-1');
        const selectCam2Element = document.getElementById('sel-video-2');
    
        if ((selectCam1Element.value == "") || (selectCam2Element.value == "")) {
            alert("As câmeras devem esta selecionadas");
            return false;
        }

        let state = btnSenToServer.getAttribute("data-state");

        if (state === 'stopped') {
            btnSenToServer.setAttribute("data-state", "running");
            
            socket = initWebSocket();

            const video1Element = document.querySelector("#lavAI-video-1");
            const canvas1Element = document.createElement("canvas");
            canvas1Element.height = video1Element.videoHeight;
            canvas1Element.width = video1Element.videoWidth;
            const context1 = canvas1Element.getContext("2d");
        
            const video2Element = document.querySelector("#lavAI-video-2");
            const canvas2Element = document.createElement("canvas");
            canvas2Element.height = video2Element.videoHeight;
            canvas2Element.width = video2Element.videoWidth;
            const context2 = canvas2Element.getContext("2d");

            let msg = { imgs: [] }

            myInterval = setInterval(() => {
                context1.drawImage(video1Element, 0, 0);
                context2.drawImage(video1Element, 0, 0);

                // msg.imgs.push({
                //     'imgRGB': canvas1Element.toDataURL('image/png'),
                //     'imgDepth': canvas2Element.toDataURL('image/png'),
                // });

                msg.imgs.push({
                    'imgRGB': canvas1Element.toDataURL('image/jpeg', 0.7),
                    'imgDepth': canvas2Element.toDataURL('image/jpeg', 0.7),
                });
                
                if (msg.imgs.length == 10) {
                    socket.send(msg);
                    msg.imgs = []
                }

            }, 30);
        
        }
        else {
            btnSenToServer.setAttribute("data-state", "stopped");
            clearInterval(myInterval);
            socket.close();
        }
    });
}





window.addEventListener("DOMContentLoaded", init);