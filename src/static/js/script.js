const video = document.getElementById('video');
const videoDiv = document.getElementById('div1');
const urlApi = 'http://localhost:5000'
let tipo = 0;
let videoStream;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/src/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/src/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/src/models')
]).then();

$(window).resize(() => {
  $('.contagemTotal').css('margin-bottom', `${($('video').height() * 550 / 480) + 20}px`);
  $('.carregar').css('width', $('video').width()).css('height', $('video').height());
});

$('#logar').on('click', async () => {
  const user = $('#user').val();
  const senha = $('#password').val();
  if(user == '' || senha == '') return;
  const login = await $.ajax({
    type : 'GET',
    url : `${urlApi}/login?user=${user}&senha=${senha}`,
    dataType : 'json',
    cache : false,
    processData : false,
    contentType : false
  });
  if(!login.result){
    return finalizarCamera(login.msg, login.status)
  }
  tipo = login.tipo;
  $('#div1').css('display', 'flex');
  startVideo();
})

video.addEventListener('play', async () => {
  if(!videoStream) return;
  $('#div1').css('opacity', '1');
  const user = $('#user').val();
  const senha = $('#password').val();
  const canvas = faceapi.createCanvasFromMedia(video);
  const displaySize = { width: video.width, height: video.height };
  videoDiv.appendChild(canvas);
  faceapi.matchDimensions(canvas, displaySize);
  $('.contagemTotal').css('margin-bottom', `${($('video').height() * 550 / 480) + 20}px`);
  $('.carregar').css('width', $('video').width()).css('height', $('video').height());
  switch (tipo) {
    case 1:
      fluxoLoginExistente(canvas, displaySize, user, senha);
      break;
    case 2:
      fluxoLoginNovo(canvas, displaySize, user, senha);
      break;
    default:
      alert('Sem fluxo definido!')
  }
});

async function fluxoLoginExistente(canvas, displaySize, user, senha) {
  const dataImages = new FormData();
  const quantidadeImages = 1;
  criarContadorFotos(quantidadeImages);
  let espera = true;
  let execute = true;
  await esperar(1000);
  const capturarImagem = async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    await esperar(500);
    if (detections.length > 0 && espera && getFormDataSize(dataImages) < quantidadeImages) {
      espera = false;
      const canvas2 = document.getElementById('canvas2');
      const context = canvas2.getContext('2d');
      const index = getFormDataSize(dataImages) + 1;

      canvas2.width = video.videoWidth;
      canvas2.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas2.width, canvas2.height);
      canvas2.toBlob(async (blob) => {
        const file = new File([blob], `${Date.now()}_${index}.png`, { type: 'image/png' });
        const dT = new DataTransfer();
        dT.items.add(file);
        $('#fileI')[0].files = dT.files;

        $.each($('#fileI')[0].files, function (i, file) {
          dataImages.append('file[]', file);
          $($('.contagem')[index - 1]).css('background', 'green');
        });
        $('#fileI').val('');
      }, 'image/png');
    }

    if (getFormDataSize(dataImages) === quantidadeImages && execute) {
      execute = false;
      $('#carregar').css('display', 'flex');
      criarContagemEnviando();
      await esperar(500);

      await $.ajax({
        type: 'POST',
        url: `${urlApi}/validarUsuario?user=${user}&senha=${senha}`,
        dataType: 'json',
        data: dataImages,
        cache: false,
        processData: false,
        contentType: false,
        success: function (data) {
          $('#carregar').css('display', 'none');
          finalizarCamera(data.msg, data.status);
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        }
      });
    }

    requestAnimationFrame(capturarImagem);
  };

  requestAnimationFrame(capturarImagem);
}

async function fluxoLoginNovo(canvas, displaySize, user, senha) {
  const dataImages = new FormData();
  const quantidadeImages = 3;
  criarContadorFotos(quantidadeImages);
  let espera = true;
  let execute = true;
  await esperar(1000);
  const capturarImagem = async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (detections.length > 0 && espera && getFormDataSize(dataImages) < quantidadeImages) {
      espera = false;
      const canvas2 = document.getElementById('canvas2');
      const context = canvas2.getContext('2d');
      const index = getFormDataSize(dataImages) + 1;

      canvas2.width = video.videoWidth;
      canvas2.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas2.width, canvas2.height);
      canvas2.toBlob(async (blob) => {
        const file = new File([blob], `${Date.now()}_${index}.png`, { type: 'image/png' });
        const dT = new DataTransfer();
        dT.items.add(file);
        $('#fileI')[0].files = dT.files;

        $.each($('#fileI')[0].files, function (i, file) {
          dataImages.append('file[]', file);
          $($('.contagem')[index - 1]).css('background', 'green');
        });

        await esperar(1000);
        espera = true;
        $('#fileI').val('');
      }, 'image/png');
    }

    if (getFormDataSize(dataImages) === quantidadeImages && execute) {
      execute = false;
      $('#carregar').css('display', 'flex');
      criarContagemEnviando();
      await esperar(300);

      await $.ajax({
        type: 'POST',
        url: `${urlApi}/criarUsuario?user=${user}&senha=${senha}`,
        dataType: 'json',
        data: dataImages,
        cache: false,
        processData: false,
        contentType: false,
        success: function (data) {
          $('#carregar').css('display', 'none');
          finalizarCamera(data.msg, data.status);
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        }
      });
    }

    requestAnimationFrame(capturarImagem);
  };

  requestAnimationFrame(capturarImagem);
}


function startVideo() {
  navigator.mediaDevices.getUserMedia({video: {}}) .then((stream)=> {
    video.srcObject = stream;
    videoStream = stream;
  }, (err)=> Swal.fire({
    title: 'Camera não identificada!',
    icon: 'error',
    confirmButtonText: 'OK'
  }));
}

function stopVideo() {
  if(videoStream) {
    const tracks = videoStream.getTracks();
    tracks.forEach(track => {
      track.stop();
    });
    videoStream = null;
    resetaCanvas();
  }
}

function resetaCanvas() {
  const total = $('#div1').children().length - 3
  for(var i = 0; i < total; i++){
    $('#div1').children()[$('#div1').children().length - 1].remove()
}
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getFormDataSize(formData) {
  let count = 0;
  for (let pair of formData.entries()) {
    count++;
  }
  return count;
}

function criarContadorFotos(quantidadeImages) {
  for(var i = 0; i < quantidadeImages; i++){
    $('#contagemTotal').append(`<div class="contagem">${i + 1}</div>`);
  }
}

function criarContagemEnviando(){
  $('#contagemTotal').html(`
    <div class="enviando">enviando
      <div class="pontilhado1">.</div>
      <div class="pontilhado2">.</div>
      <div class="pontilhado3">.</div>
    </div>
  `);
}

async function finalizarCamera(mensagem, status) {
  await Swal.fire({
    title: mensagem,
    icon: status,
    confirmButtonText: 'OK'
  });

  $('#div1').css('display', 'none');
  $('#div1').css('opacity', '0');
  $('#contagemTotal').html('');
  stopVideo();
}