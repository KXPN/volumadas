const Configuracion = {
  opcionesBase: {
    volumen: 1,
    posicion: 'izquierda',
    opacidad: 0.5,
    'personasIgnoradas[]': ['Tú', 'Presentación'],
    'personasRenombradas[]': [],
    prefijo: 'Con ',
    sufijo: '. Al terminar devuelvo la llamada',
  },
  opcionesGuardadas: {},
  actualizar: function(forzado) {
    if (!forzado) {
      this.opcionesGuardadas = this.convertirEnObjeto();
    }
    this.revisarSiHayCambios();
  },
  agregarElemento: function(evento) {
    let dAgregarElemento = evento.currentTarget;
    let dContenedorElementos = dAgregarElemento.parentElement;
    let dNuevo = dContenedorElementos.querySelector('.jsBase').cloneNode(true);
    dNuevo.querySelectorAll('input').forEach((dOpcion) => {
      dOpcion.addEventListener('input', this.revisarSiHayCambios.bind(this));
      dOpcion.name = dOpcion.dataset.name.replace(
        /\d+/g,
        (dContenedorElementos.children.length - 1)
      );
    });
    dNuevo.querySelector('.jsQuitarElemento').addEventListener(
      'click',
      this.quitarElemento.bind(this)
    );
    dNuevo.hidden = false;
    dContenedorElementos.insertBefore(dNuevo, dAgregarElemento);
    this.revisarSiHayCambios();
  },
  cargar: function(opciones, forzado) {
    for (let opcionNombre in opciones) {
      if (opcionNombre.indexOf('[]') < 0) {
        let dOpcion = document.querySelector('[name="' + opcionNombre + '"]');
        if ((dOpcion.type !== 'checkbox') && (dOpcion.type !== 'radio')) {
          dOpcion.value = (
            opciones[opcionNombre]
          );
          continue;
        }
        document.querySelectorAll('[name="' + opcionNombre + '"]').forEach(
          (dBoton) => {
            dBoton.checked = (dBoton.value === opciones[opcionNombre]);
          }
        );
        continue;
      }
      let valores = opciones[opcionNombre];
      let opcionNombreLimpio = opcionNombre.replace(/\[\]/g, '');
      let dOpcion = document.querySelector(
        '[data-name^="' + opcionNombreLimpio + '"]'
      );
      let dContenedorElementos = dOpcion.parentElement.parentElement;
      let dAgregarElemento = dContenedorElementos.querySelector(
        '.jsAgregarElemento'
      );
      for (let valorIndice in valores) {
        dAgregarElemento.click();
        let dNuevo = dAgregarElemento.previousElementSibling;
        if (typeof valores[valorIndice] !== 'object') {
          dNuevo.querySelector('[name="' + opcionNombre + '"]').value = (
            valores[valorIndice]
          );
          continue;
        }
        dNuevo.querySelectorAll('[name^="' + opcionNombreLimpio + '"]').forEach(
          (dOpcion, opcionIndice) => {
            dOpcion.value = valores[valorIndice][opcionIndice];
          }
        );
      }
    }
    this.actualizar(forzado);
  },
  convertirEnObjeto: function() {
    let opciones = {};
    let opcionesAConvertirEnArreglos = {};
    new FormData(document.querySelector('form')).forEach(
      (opcionValor, opcionNombre) => {
        if (opcionNombre.indexOf('[]') < 0) {
          opciones[opcionNombre] = opcionValor;
          return;
        }
        let opcionIndice = opcionNombre.match(/\d+/);
        let opcionNombreLimpio = opcionNombre.replace(/\[\d+\]/g, '');
        if (opciones[opcionNombreLimpio] === undefined) {
          opciones[opcionNombreLimpio] = (opcionIndice ? {} : []);
        }
        if (!opcionIndice) {
          opciones[opcionNombreLimpio].push(opcionValor);
          return;
        }
        opcionesAConvertirEnArreglos[opcionNombreLimpio] = true;
        if (opciones[opcionNombreLimpio][opcionIndice[0]] === undefined) {
          opciones[opcionNombreLimpio][opcionIndice[0]] = [];
        }
        opciones[opcionNombreLimpio][opcionIndice[0]].push(opcionValor);
      }
    );
    for (let opcionAConvertirEnArregloNombre in opcionesAConvertirEnArreglos) {
      let opcionComoArreglo = [];
      for (let opcionLlave in opciones[opcionAConvertirEnArregloNombre]) {
        opcionComoArreglo.push(
          opciones[opcionAConvertirEnArregloNombre][opcionLlave]
        );
      }
      opciones[opcionAConvertirEnArregloNombre] = opcionComoArreglo;
    }
    return opciones;
  },
  exportar: function() {
    let opciones = this.convertirEnObjeto();
    let dTextarea = document.createElement('textarea');
    dTextarea.value = JSON.stringify(opciones);
    document.body.appendChild(dTextarea);
    dTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(dTextarea);
    alert('La configuración visible fue copiada al portapapeles');
  },
  guardar: function() {
    let opciones = this.convertirEnObjeto();
    browser.storage.sync.set({opciones}, this.actualizar.bind(this));
  },
  importar: function() {
    let configuracion = prompt(
      'Pega aquí la configuración'
    );
    if (configuracion === null) {
      return;
    }
    if (!configuracion.length) {
      alert('No indicaste una configuración. No se hicieron cambios');
      return;
    }
    let opciones;
    try {
      opciones = JSON.parse(configuracion);
    } catch(error) {
      alert('La configuración indicada no es válida. No se hicieron cambios');
      return;
    }
    this.limpiar();
    this.cargar(opciones, true);
  },
  inicializar: function() {
    window.onbeforeunload = this.revisarSiHayCambios.bind(this);
    document.querySelectorAll('input').forEach((dOpcion) => {
      dOpcion.addEventListener('input', this.revisarSiHayCambios.bind(this));
    });
    document.querySelectorAll('.jsAgregarElemento').forEach(
      (dAgregarElemento) => {
        dAgregarElemento.addEventListener(
          'click',
          this.agregarElemento.bind(this)
        );
      }
    );
    document.querySelector('.jsGuardar').addEventListener(
      'click',
      this.guardar.bind(this)
    );
    document.querySelector('.jsExportar').addEventListener(
      'click',
      this.exportar.bind(this)
    );
    document.querySelector('.jsImportar').addEventListener(
      'click',
      this.importar.bind(this)
    );
    document.querySelector('.jsRestaurar').addEventListener(
      'click',
      this.restaurar.bind(this)
    );
    chrome.storage.sync.get('opciones', ({opciones}) => {
      if (opciones === undefined) {
        opciones = this.opcionesBase;
      }
      this.cargar(opciones);
    });
  },
  limpiar: function() {
    document.querySelector('form').reset();
    document.querySelectorAll('.jsQuitarElemento').forEach(
      (dQuitarElemento) => {
        dQuitarElemento.click();
      }
    );
    this.revisarSiHayCambios();
  },
  quitarElemento: function(evento) {
    let dElemento = evento.currentTarget.parentElement;
    let dContenedorElementos = dElemento.parentElement;
    dContenedorElementos.removeChild(dElemento);
    this.revisarSiHayCambios();
  },
  restaurar: function(evento) {
    this.limpiar();
    this.cargar(this.opcionesBase, true);
  },
  revisarSiHayCambios: function(xd) {
    let opcionesGuardadas = JSON.stringify(this.opcionesGuardadas);
    let opcionesActuales = JSON.stringify(this.convertirEnObjeto());
    let hayCambios = (opcionesGuardadas !== opcionesActuales);
    let claseAPoner = 'correcto';
    let claseAQuitar = 'incorrecto';
    if (hayCambios) {
      claseAPoner = 'incorrecto';
      claseAQuitar = 'correcto';
    }
    document.querySelector('.jsGuardar').classList.add(claseAPoner);
    document.querySelector('.jsGuardar').classList.remove(claseAQuitar);
    return (hayCambios ? 'Quieres salir sin guardar cambios?' : null);
  },
};
if (typeof browser === 'undefined') {
  var browser = chrome;
}
Configuracion.inicializar();
