document.addEventListener('DOMContentLoaded', () => {
    const cantidadEstudiantesInput = document.getElementById('cantidadEstudiantes');
    const generarDatosBtn = document.getElementById('generarDatosBtn');
    const cuerpoTablaEstudiantes = document.getElementById('cuerpoTablaEstudiantes');
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    let datosEstudiantes = [];
    let charts = {}; // Para almacenar instancias de gráficos y actualizarlos

    // --- Funciones de Generación de Datos Aleatorios ---
    function generarSexo() {
        return Math.random() < 0.5 ? 'Masculino' : 'Femenino';
    }

    function generarEdad() {
        // Edades típicas universitarias, ej. entre 17 y 30
        return Math.floor(Math.random() * (30 - 17 + 1)) + 17;
    }

    function generarTipoColegio() {
        // Asumamos 60% fiscal, 40% particular
        return Math.random() < 0.6 ? 'Fiscal' : 'Particular';
    }

    function generarBooleano(probabilidadTrue = 0.5) {
        return Math.random() < probabilidadTrue;
    }

    function generarDistancia() {
        // Distancia en km, ej. entre 0.5km y 50km con decimales
        return parseFloat((Math.random() * (50 - 0.5) + 0.5).toFixed(1));
    }

    function generarCantidadMateriasInscritas() {
        // Entre 3 y 8 materias
        return Math.floor(Math.random() * (8 - 3 + 1)) + 3;
    }

    function generarCantidadMateriasReprobadas(inscritas, reproboSemAnt) {
        if (!reproboSemAnt) {
            // Si no reprobó el semestre anterior, es menos probable que repruebe ahora
            // o podría reprobar 0 o 1.
            return Math.random() < 0.7 ? 0 : (Math.random() < 0.85 ? 1 : 2);
        }
        // Si reprobó el semestre anterior, podría reprobar más
        // Asegurarse que no repruebe más de las inscritas (aunque es poco probable con estos rangos)
        let reprobadas = Math.floor(Math.random() * (Math.floor(inscritas / 2) + 1)); // Hasta la mitad de las inscritas
        return Math.min(reprobadas, inscritas);
    }

    // --- Función Principal para Generar Datos de Estudiantes ---
    function generarDatosCompletos(cantidad) {
        const datos = [];
        for (let i = 0; i < cantidad; i++) {
            const materiasInscritas = generarCantidadMateriasInscritas();
            const reproboSemAnterior = generarBooleano(0.3); // 30% de probabilidad de haber reprobado
            const ayudaPadres = generarBooleano(0.7); // 70% recibe ayuda
            const padresProfesionales = generarBooleano(0.4); // 40% padres profesionales
            const personasDependientes = generarBooleano(0.2); // 20% tiene personas dependientes

            // Lógica simple para 'retiro_universidad' (puedes hacerla más compleja)
            // Por ejemplo, si reprobó mucho, no tiene ayuda, y vive lejos, más probabilidad de retiro.
            let probabilidadRetiro = 0.1; // Base
            if (reproboSemAnterior) probabilidadRetiro += 0.15;
            if (!ayudaPadres) probabilidadRetiro += 0.1;
            if (generarDistancia() > 30) probabilidadRetiro += 0.05;
            if (personasDependientes) probabilidadRetiro += 0.1;
            
            const retiroUniversidad = generarBooleano(probabilidadRetiro);

            datos.push({
                id: i + 1,
                sexo: generarSexo(),
                edad: generarEdad(),
                tipoColegio: generarTipoColegio(),
                ayudaPadres: ayudaPadres,
                distancia: generarDistancia(),
                reproboSemAnterior: reproboSemAnterior,
                materiasInscritas: materiasInscritas,
                materiasReprobadas: generarCantidadMateriasReprobadas(materiasInscritas, reproboSemAnterior),
                padresProfesionales: padresProfesionales,
                personasDependientes: personasDependientes,
                retiroUniversidad: retiroUniversidad
            });
        }
        return datos;
    }

    // --- Funciones para Mostrar Datos y Gráficos ---
    function mostrarDatosEnTabla(datos) {
        cuerpoTablaEstudiantes.innerHTML = ''; // Limpiar tabla anterior
        datos.forEach(est => {
            const fila = `<tr>
                <td>${est.id}</td>
                <td>${est.sexo}</td>
                <td>${est.edad}</td>
                <td>${est.tipoColegio}</td>
                <td>${est.ayudaPadres ? 'Sí' : 'No'}</td>
                <td>${est.distancia}</td>
                <td>${est.reproboSemAnterior ? 'Sí' : 'No'}</td>
                <td>${est.materiasInscritas}</td>
                <td>${est.materiasReprobadas}</td>
                <td>${est.padresProfesionales ? 'Sí' : 'No'}</td>
                <td>${est.personasDependientes ? 'Sí' : 'No'}</td>
                <td>${est.retiroUniversidad ? 'Sí' : 'No'}</td>
            </tr>`;
            cuerpoTablaEstudiantes.innerHTML += fila;
        });
    }

    function actualizarGraficos(datos) {
        // Destruir gráficos anteriores si existen para evitar superposiciones
        Object.values(charts).forEach(chart => chart.destroy());

        // 1. Gráfico de Distribución por Sexo (Pie Chart)
        const conteoSexo = datos.reduce((acc, est) => {
            acc[est.sexo] = (acc[est.sexo] || 0) + 1;
            return acc;
        }, {});
        charts.sexoChart = new Chart(document.getElementById('sexoChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(conteoSexo),
                datasets: [{
                    label: 'Distribución por Sexo',
                    data: Object.values(conteoSexo),
                    backgroundColor: ['#FF6384', '#36A2EB'],
                }]
            }
        });

        // 2. Gráfico de Tasa de Retiro (Doughnut Chart)
        const conteoRetiro = datos.reduce((acc, est) => {
            const key = est.retiroUniversidad ? 'Retiró' : 'No Retiró';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        charts.retiroChart = new Chart(document.getElementById('retiroChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoRetiro),
                datasets: [{
                    label: 'Tasa de Retiro',
                    data: Object.values(conteoRetiro),
                    backgroundColor: ['#FFCD56', '#4BC0C0'],
                }]
            }
        });
        
        // 3. Gráfico de Distribución de Edades (Bar Chart)
        const conteoEdades = datos.reduce((acc, est) => {
            acc[est.edad] = (acc[est.edad] || 0) + 1;
            return acc;
        }, {});
        const edadesOrdenadas = Object.keys(conteoEdades).sort((a, b) => a - b);
        const valoresEdades = edadesOrdenadas.map(edad => conteoEdades[edad]);
        charts.edadChart = new Chart(document.getElementById('edadChart'), {
            type: 'bar',
            data: {
                labels: edadesOrdenadas,
                datasets: [{
                    label: 'Número de Estudiantes',
                    data: valoresEdades,
                    backgroundColor: '#9966FF',
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // 4. Gráfico Tipo de Colegio vs. Retiro (Grouped Bar Chart)
        const colegioRetiroData = {
            'Fiscal': { 'Retiró': 0, 'No Retiró': 0 },
            'Particular': { 'Retiró': 0, 'No Retiró': 0 }
        };
        datos.forEach(est => {
            if (est.retiroUniversidad) {
                colegioRetiroData[est.tipoColegio]['Retiró']++;
            } else {
                colegioRetiroData[est.tipoColegio]['No Retiró']++;
            }
        });
        charts.colegioRetiroChart = new Chart(document.getElementById('colegioRetiroChart'), {
            type: 'bar',
            data: {
                labels: ['Fiscal', 'Particular'],
                datasets: [
                    {
                        label: 'Retiró',
                        data: [colegioRetiroData.Fiscal.Retiró, colegioRetiroData.Particular.Retiró],
                        backgroundColor: '#FF6384',
                    },
                    {
                        label: 'No Retiró',
                        data: [colegioRetiroData.Fiscal['No Retiró'], colegioRetiroData.Particular['No Retiró']],
                        backgroundColor: '#36A2EB',
                    }
                ]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // --- Event Listener para el Botón ---
    generarDatosBtn.addEventListener('click', () => {
        const cantidad = parseInt(cantidadEstudiantesInput.value);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Por favor, ingresa un número válido de estudiantes.");
            return;
        }
        datosEstudiantes = generarDatosCompletos(cantidad);
        mostrarDatosEnTabla(datosEstudiantes);
        actualizarGraficos(datosEstudiantes);
    });

    // Generar datos iniciales al cargar la página (opcional)
    // generarDatosBtn.click(); // Descomenta si quieres que se carguen datos al inicio
});