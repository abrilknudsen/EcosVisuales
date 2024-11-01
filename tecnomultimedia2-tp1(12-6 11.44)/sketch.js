//---SONIDO---
let monitorear = false;

let FREC_MIN = 150;
let FREC_MAX = 800;
let FREC;

let AMP_MIN = 0.007;
let AMP_MAX = 0.1;
let AMP;

let mic;
let pitch;
let audioContext;

let gestorAmp;
let gestorPitch;

let haySonido;
let antesHabiaSonido;

const pitchModel = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

//---TEACHABLE MACHINE---
let classifier;
const options = { probabilityThreshold: 0.7 };
let label;
let soundModel = 'https://teachablemachine.withgoogle.com/models/1wnCX0-l3/';
let chasquidoEjecutandose;

//---CAMINANTES---
let grosorEstablecido = null;
let estado = 0;

let cadenas = [];
let caminantes = [];
let caminanteActual = 0;
let cantidadCadenas = 6;

function preload() {
  classifier = ml5.soundClassifier(soundModel + 'model.json', options);
}

function setup() {
  createCanvas(1200, windowHeight);

//---SONIDO---
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);

  classifier.classify(gotResult);

  gestorAmp =  new GestorSenial( AMP_MIN, AMP_MAX);
  gestorPitch = new GestorSenial( FREC_MIN, FREC_MAX);

  antesHabiaSonido = false;

}

function draw() {
  userStartAudio();

  colorMode(RGB);
  background(200);
  noFill();
  colorMode(HSB);

  gestorAmp.actualizar(mic.getLevel()); 
  FREC = gestorPitch.filtrada;
  AMP = gestorAmp.filtrada;
  haySonido = gestorAmp.filtrada > AMP_MIN;
  let inicioSonido = haySonido && !antesHabiaSonido;

  // Lógica de estados
  if (estado === 0 && inicioSonido) {
      // Definición de grosor de cadenas
      if (AMP < AMP_MAX) {
          grosorEstablecido = 50;
      } else {
          grosorEstablecido = 70;
      }

      for (let i = 0; i < cantidadCadenas; i++) {
          let estaCad = new Cadena();
          estaCad.click(random(-10, width + 10), random(-10, height + 10));
          estaCad.fin();
          estaCad.grosor = grosorEstablecido;
          cadenas.push(estaCad);
      }

      for (let i = 0; i < cadenas.length; i++) {
          let grafico = createGraphics(1200, height);
          let estecam = new Caminante(cadenas[i], grosorEstablecido, grafico);
          caminantes.push(estecam);
      }

      estado = 1;
  }

  // Estado 1
  if (estado === 1) {
      if (haySonido) {
          if (caminanteActual < caminantes.length) {
              let caminante = caminantes[caminanteActual];
              caminante.dibujar();
              caminante.avanzar();

              if (caminante.termino) {
                  caminanteActual++;
              }
          }
      } else {
          if (caminanteActual < caminantes.length) {
              let caminante = caminantes[caminanteActual];
              if (!caminante.termino) {
                  caminante.reiniciar();
              }
          }
      }

      for (let i = 0; i < caminantes.length; i++) {
          let caminante = caminantes[i];
          // Aplica la opacidad específica de cada caminante usando el color
          let camColor = color(hue(caminante.color), saturation(caminante.color), brightness(caminante.color), caminante.opacidad);
          tint(camColor); // Aplica tint con la opacidad
          image(caminante.grafico, 0, 0);
      }

      if (label == "Chasquido" && !chasquidoEjecutandose) {
          chasquidoEjecutandose = true;
          eliminarUno();
      }
      if (label != "Chasquido") {
          chasquidoEjecutandose = false;
      }
  }

  antesHabiaSonido = haySonido;

  if (monitorear) {
      gestorAmp.dibujar(100, 100);
      gestorPitch.dibujar(100, 300);
  }
}


  function eliminarUno() {
    // Verifica si hay caminantes disponibles
    if (caminantes.length > 0) {
        // Encuentra el siguiente caminante que tiene opacidad completa (255)
        for (let i = 0; i < caminantes.length; i++) {
            if (caminantes[i].opacidad === 0.9) {
                // Cambia la opacidad al 50%
                caminantes[i].opacidad = 0.1; // 50% de 255
                break; // Salimos del bucle después de modificar la opacidad de un caminante
            }
        }
    }

    // Crear un nuevo caminante
    let nuevaCadena = new Cadena();
    nuevaCadena.click(random(-100, width + 10), random(-100, height + 10));
    nuevaCadena.fin();
    nuevaCadena.grosor = grosorEstablecido;
    cadenas.push(nuevaCadena);

    let grafico = createGraphics(1200, height);
  let nuevoCaminante = new Caminante(nuevaCadena, grosorEstablecido, grafico);
  nuevoCaminante.caminanteColor(random()); // Pasa un número aleatorio entre 0 y 1
  caminantes.push(nuevoCaminante);
  console.log('Nuevo caminante creado. Total caminantes:', caminantes.length);

}


  //DETECCION DE FRECUENCIA
  function startPitch() {
    pitch = ml5.pitchDetection(pitchModel, audioContext , mic.stream, modelLoaded);
  }
  
  function modelLoaded() {
    getPitch();
  }
  
  function getPitch() {
    pitch.getPitch(function(err, frequency) {
      if (frequency) {
        gestorPitch.actualizar(frequency);
        frec = gestorPitch.filtrada;
      } else {
      }
      getPitch();
    })
  }

  //CLASIFICADOR

  function gotResult(error, results) {
    // Display error in the console
    if (error) {
      console.error(error);
    }
    // The results are in an array ordered by confidence.
    console.log(results);
    label = results[0].label;
    //console.log(label);
    
  }

  function mousePressed() {
    eliminarUno();
  }