const Volumadas = {
  dBarraVolumen: null,
  prefijo: '',
  sufijo: '',
  personasIgnoradas: [],
  personasRenombradas: [],
  selectoresPorNombre: {
    listaParticipante: (
      '[data-panel-container-id=sidePanel1] [data-participant-id]'
    ),
    participantesListaIcono: '[data-panel-id][data-promo-anchor-id] i',
  },
  ajustarVolumen: function() {
    let volumen = this.dBarraVolumen.value;
    let colores = ['red', 'green'];
    this.aplicarEstilos(this.dBarraVolumen, {
      'backgroundColor': (colores[volumen] || 'orange'),
    });
    document.querySelectorAll('audio').forEach(function(dAudio) {
      dAudio.volume = volumen;
    });
  },
  aplicarAtributos: function(dElemento, atributos) {
    for (let atributoNombre in atributos) {
      dElemento[atributoNombre] = atributos[atributoNombre];
    }
  },
  aplicarEstilos: function(dElemento, estilos) {
    for (let estiloNombre in estilos) {
      dElemento.style[estiloNombre] = estilos[estiloNombre];
    }
  },
  cambiarPosicion: function(evento) {
    let dVolumadas = evento.currentTarget.parentElement;
    let estilos = {};
    if(dVolumadas.style.left === '0px'){
      estilos.left = 'unset';
      estilos.right = 0;
    }else{
      estilos.left = 0;
      estilos.right = 'unset';
    }
    this.aplicarEstilos(dVolumadas, estilos);
  },
  copiarParticipantes: function() {
    let dTextarea = document.createElement('textarea');
    dTextarea.value = (this.prefijo + 'INDETERMINADO' + this.sufijo);
    document.body.appendChild(dTextarea);
    dTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(dTextarea);
    let dParticipantesListaIcono = (
      document.querySelector(this.selectoresPorNombre.participantesListaIcono)
    );
    if (!dParticipantesListaIcono) {
      return;
    }
    dParticipantesListaIcono.click();
    dParticipantesListaIcono.click();
    let dListaParticipantes = (
      document.querySelectorAll(this.selectoresPorNombre.listaParticipante)
    );
    if (!dListaParticipantes.length) {
      setTimeout(this.copiarParticipantes.bind(this));
      return;
    }
    let selectores = {
      'meet.google.com': '[class=notranslate]',
      'hangouts.google.com': '[data-participant-id] div:nth-child(2)',
    };
    let selector = selectores[window.location.host];
    let asistentes = [];
    let personasIgnoradas = this.personasIgnoradas;
    let apodosPorAsistente = {};
    let personasRenombradas = this.personasRenombradas;
    for (let personaRenombradaIndice in personasRenombradas) {
      let renombramiento = personasRenombradas[personaRenombradaIndice];
      apodosPorAsistente[renombramiento[0]] = renombramiento[1];
    }
    let participantesPorNombre = {};
    (
      dListaParticipantes
      .forEach(
        function(dParticipante) {
          let nombre = dParticipante.querySelector('span').textContent.trim();
          if (!nombre) {
            return;
          }
          if (personasIgnoradas.indexOf(nombre) >= 0) {
            return;
          }
          if (participantesPorNombre[nombre]) {
            return;
          }
          participantesPorNombre[nombre] = true;
          asistentes.push(apodosPorAsistente[nombre] || nombre);
        },
      )
    );
    dTextarea = document.createElement('textarea');
    dTextarea.value = (
      this.prefijo +
      (asistentes.length ? asistentes.join(', ') : 'INDETERMINADO') +
      this.sufijo
    );
    document.body.appendChild(dTextarea);
    dTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(dTextarea);
  },
  inicializar: function({opciones}) {
    if (opciones === undefined) {
      opciones = {
        volumen: 1,
        posicion: 'izquierda',
        opacidad: 0.5,
        'personasIgnoradas[]': ['Tú', 'Presentación'],
        'personasRenombradas[]': [],
        prefijo: 'Con ',
        sufijo: '. Al terminar devuelvo la llamada',
      };
    }
    const windowLocation = window.location;
    const reunionEnlace = (windowLocation.origin + windowLocation.pathname);
    const reunionEnlaceVariableExpresionRegular = (
      new RegExp('\\\[REUNION_ENLACE\\\]', 'g')
    );
    this.prefijo = (
      opciones
      .prefijo
      .replace(reunionEnlaceVariableExpresionRegular, reunionEnlace)
    );
    this.sufijo = (
      opciones
      .sufijo
      .replace(reunionEnlaceVariableExpresionRegular, reunionEnlace)
    );
    this.personasIgnoradas = opciones['personasIgnoradas[]'];
    this.personasRenombradas = opciones['personasRenombradas[]'];
    let dVolumadas = document.createElement('div');
    let estilos = {
      opacity: opciones.opacidad,
      position: 'absolute',
      top: 0,
      zIndex: 99999,
    };
    if (opciones.posicion === 'izquierda') {
      estilos.left = 0;
    } else {
      estilos.right = 0;
    }
    this.aplicarEstilos(dVolumadas, estilos);
    let dBarraVolumen = document.createElement('input');
    this.aplicarAtributos(dBarraVolumen, {
      max: 1,
      min: 0,
      step: 0.01,
      type: 'range',
      value: opciones.volumen,
    });
    this.aplicarEstilos(dBarraVolumen, {
      cursor: 'pointer',
      height: '8px',
      webkitAppearance: 'none',
    });
    dVolumadas.appendChild(dBarraVolumen);
    this.dBarraVolumen = dBarraVolumen;
    let dCopiarParticipantes = document.createElement('button');
    this.aplicarAtributos(dCopiarParticipantes, {
      innerText: '*',
    });
    this.aplicarEstilos(dCopiarParticipantes, {
      cursor: 'pointer',
    });
    dCopiarParticipantes.addEventListener(
      'click',
      this.copiarParticipantes.bind(this)
    );
    dVolumadas.appendChild(dCopiarParticipantes);
    let dCambiarPosicion = document.createElement('a');
    this.aplicarAtributos(dCambiarPosicion, {
      innerText: '<->',
    });
    this.aplicarEstilos(dCambiarPosicion, {
      color: '#fff',
      cursor: 'pointer',
      fontFamily: 'courier new',
      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000',
    });
    dVolumadas.appendChild(dCambiarPosicion);
    dCambiarPosicion.addEventListener('click', this.cambiarPosicion.bind(this));
    document.body.appendChild(dVolumadas);
    setInterval(this.ajustarVolumen.bind(this), 1);
  },
};

if (typeof browser === 'undefined') {
  var browser = chrome;
}
if (browser.storage) {
  browser.storage.sync.get('opciones', iniciarVolumadas);
} else {
  iniciarVolumadas({});
}

function iniciarVolumadas(opciones) {
  Volumadas.inicializar.call(Volumadas, opciones);
}
