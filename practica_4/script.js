// Define variables para mantener el estado del sistema
let numProcesos = 0;
let quantum = 0;
let procesosNuevos = [];
let colaListos = [];
let procesoEnEjecucion = null;
let colaBloqueados = [];
let procesosTerminados = [];
let reloj = 0;
let paused = false;

// Función principal para iniciar la simulación
function iniciarSimulacion() {
    // Preguntar número de procesos inicial y valor del quantum
    numProcesos = parseInt(prompt("Ingrese el número de procesos inicial:"));
    quantum = parseInt(prompt("Ingrese el valor del Quantum:"));

    // Generar procesos iniciales
    generarProcesosIniciales(numProcesos);

    // Iniciar el bucle principal de simulación
    setInterval(simularRoundRobin, 1000); // Ejecutar cada segundo

    // Agregar event listener para las teclas
    document.addEventListener('keydown', manejarTeclas);
}

// Función para simular el algoritmo de planificación Round-Robin
function simularRoundRobin() {
    if (!paused) {
        // Actualizar reloj
        reloj++;

        // Comprobar si hay procesos en la cola de bloqueados para regresar a la cola de listos
        manejarProcesosBloqueados();

        // Agregar procesos nuevos a la cola de listos
        agregarProcesosNuevos();

        // Ejecutar proceso actual en CPU
        ejecutarProcesoEnCPU();

        // Actualizar el estado del sistema y la interfaz gráfica
        actualizarInterfaz();
    }
}

// Función para manejar procesos bloqueados y regresarlos a la cola de listos cuando corresponda
function manejarProcesosBloqueados() {
    for (let i = colaBloqueados.length - 1; i >= 0; i--) {
        colaBloqueados[i].tiempoBloqueado++;
        if (colaBloqueados[i].tiempoBloqueado >= 9) {
            // Regresar proceso a la cola de listos
            colaListos.push(colaBloqueados[i]);
            colaBloqueados.splice(i, 1);
        }
    }
}


// Función para agregar procesos nuevos a la cola de listos
function agregarProcesosNuevos() {
    if (procesosNuevos.length > 0) {
        for (let i = 0; i < procesosNuevos.length; i++) {
            colaListos.push(procesosNuevos[i]);
        }
        procesosNuevos = [];
    }
}

// Función para ejecutar el proceso actual en la CPU
function ejecutarProcesoEnCPU() {
    if (procesoEnEjecucion === null && colaListos.length > 0) {
        procesoEnEjecucion = colaListos.shift();
        procesoEnEjecucion.tiempoRestante--;
        procesoEnEjecucion.tiempoEjecutado++;
        procesoEnEjecucion.tiempoQuantum++;

        if (procesoEnEjecucion.tiempoRestante === 0) {
            procesosTerminados.push(procesoEnEjecucion);
            procesoEnEjecucion = null;
        } else if (procesoEnEjecucion.tiempoQuantum === quantum) {
            // Si se ha agotado el quantum, mover proceso al final de la cola de listos
            colaListos.push(procesoEnEjecucion);
            procesoEnEjecucion = null;
        }
    } else if (procesoEnEjecucion !== null) {
        procesoEnEjecucion.tiempoRestante--;
        procesoEnEjecucion.tiempoEjecutado++;
        procesoEnEjecucion.tiempoQuantum++;

        if (procesoEnEjecucion.tiempoRestante === 0) {
            procesosTerminados.push(procesoEnEjecucion);
            procesoEnEjecucion = null;
        } else if (procesoEnEjecucion.tiempoQuantum === quantum) {
            // Si se ha agotado el quantum, mover proceso al final de la cola de listos
            colaListos.push(procesoEnEjecucion);
            procesoEnEjecucion = null;
        }
    }
}

// Función para pausar o reanudar la simulación
function pausarSimulacion() {
    paused = !paused;
}

// Función para manejar las teclas presionadas
function manejarTeclas(event) {
    switch (event.key) {
        case 'P':
            pausarSimulacion();
            break;
        case 'N':
            generarNuevoProceso();
            break;
        case 'B':
            mostrarTablaProcesos();
            break;
        case 'E':
            bloquearProceso();
            break;
        case 'W':
            terminarProcesoConError();
            break;
        case 'C':
            // Continuar simulación si está pausada
            if (paused) {
                paused = false;
                simularRoundRobin();
            }
            break;
        default:
            break;
    }
}

// Función para actualizar la interfaz gráfica con el estado actual del sistema
function actualizarInterfaz() {
    let output = document.getElementById('output');
    output.innerHTML = ''; // Limpiar contenido anterior

    // Mostrar estado actual del sistema
    output.innerHTML += `<h2>Estado del sistema:</h2>`;
    output.innerHTML += `<p>Reloj: ${reloj}</p>`;
    output.innerHTML += `<p>Cola de listos:</p>`;
    output.innerHTML += `<ul>`;
    colaListos.forEach(proceso => {
        output.innerHTML += `<li>ID: ${proceso.id}, Tiempo Restante: ${proceso.tiempoRestante}</li>`;
    });
    output.innerHTML += `</ul>`;

    output.innerHTML += `<p>Proceso en ejecución:</p>`;
    if (procesoEnEjecucion !== null) {
        output.innerHTML += `<p>ID: ${procesoEnEjecucion.id}, Tiempo Restante: ${procesoEnEjecucion.tiempoRestante}</p>`;
    } else {
        output.innerHTML += `<p>No hay proceso en ejecución</p>`;
    }

    output.innerHTML += `<p>Cola de bloqueados:</p>`;
    output.innerHTML += `<ul>`;
    colaBloqueados.forEach(proceso => {
        output.innerHTML += `<li>ID: ${proceso.id}, Tiempo Bloqueado: ${proceso.tiempoBloqueado}</li>`;
    });
    output.innerHTML += `</ul>`;

    output.innerHTML += `<p>Procesos terminados:</p>`;
    output.innerHTML += `<ul>`;
    procesosTerminados.forEach(proceso => {
        output.innerHTML += `<li>ID: ${proceso.id}, Operación: ${proceso.operacion}, Resultado: ${proceso.resultado}</li>`;
    });
    output.innerHTML += `</ul>`;
}

// Función para generar procesos iniciales aleatorios
function generarProcesosIniciales(numProcesos) {
    for (let i = 0; i < numProcesos; i++) {
        // Generar datos aleatorios para cada proceso
        let id = i + 1;
        let tiempoMaximo = Math.floor(Math.random() * 10) + 1;
        let tiempoRestante = tiempoMaximo;
        let operacion = Math.random() > 0.5 ? 'Suma' : 'Resta';
        let resultado = 5;
        let tiempoEjecutado = 0;
        let tiempoQuantum = 0;
        let tiempoBloqueado =0 ;

        // Crear objeto proceso y agregarlo a la lista de procesos nuevos
        procesosNuevos.push({ id, tiempoMaximo, tiempoRestante, operacion, resultado, tiempoEjecutado, tiempoQuantum ,tiempoBloqueado});
    }
}

// Función para generar un nuevo proceso y agregarlo a la lista de procesos nuevos
function generarNuevoProceso() {
    // Generar datos aleatorios para el nuevo proceso
    let id = procesosNuevos.length + 1;
    let tiempoMaximo = Math.floor(Math.random() * 10) + 1;
    let tiempoRestante = tiempoMaximo;
    let operacion = Math.random() > 0.5 ? 'Suma' : 'Resta';
    let resultado = null;
    let tiempoEjecutado = 0;
    let tiempoQuantum = 0;

    // Crear objeto proceso y agregarlo a la lista de procesos nuevos
    procesosNuevos.push({ id, tiempoMaximo, tiempoRestante, operacion, resultado, tiempoEjecutado, tiempoQuantum });
}


// Función para mostrar la tabla de procesos
function mostrarTablaProcesos() {
    paused = true;
    actualizarInterfaz(); // Actualizar interfaz para mostrar la tabla de procesos
    let output = document.getElementById('output');
    output.innerHTML = `<h2>Tabla de Procesos:</h2>`;

    let tableHTML = `<table><thead><tr><th>ID</th><th>Operación</th><th>Tiempo Restante</th><th>Tiempo Ejecutado</th><th>Tiempo Quantum</th><th>Tiempo Bloqueado</th></tr></thead><tbody>`;

    colaListos.forEach(proceso => {
        tableHTML += `<tr><td>${proceso.id}</td><td>${proceso.operacion}</td><td>${proceso.tiempoRestante}</td><td>${proceso.tiempoEjecutado}</td><td>${proceso.tiempoQuantum}</td><td>-</td></tr>`;
    });
    colaBloqueados.forEach(proceso => {
        tableHTML += `<tr><td>${proceso.id}</td><td>${proceso.operacion}</td><td>${proceso.tiempoRestante}</td><td>${proceso.tiempoEjecutado}</td><td>${proceso.tiempoQuantum}</td><td>${proceso.tiempoBloqueado}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    output.innerHTML += tableHTML;
    output.innerHTML += `<p>Presiona la tecla 'C' para continuar la simulación.</p>`;
    output.innerHTML += `<br>`;
}




// Función para bloquear el proceso en ejecución y moverlo a la cola de bloqueados
function bloquearProceso() {
    if (procesoEnEjecucion !== null) {
        colaBloqueados.push(procesoEnEjecucion);
        procesoEnEjecucion = null;
    }
}

// Función para terminar el proceso en ejecución con un error
function terminarProcesoConError() {
    if (procesoEnEjecucion !== null) {
        procesosTerminados.push({ id: procesoEnEjecucion.id, operacion: procesoEnEjecucion.operacion, resultado: 'ERROR' });
        procesoEnEjecucion = null;
    }
}

// Llamada a la función principal para iniciar la simulación
iniciarSimulacion();
