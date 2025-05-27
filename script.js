document.addEventListener('DOMContentLoaded', () => {
    const cantidadEstudiantesInput = document.getElementById('cantidadEstudiantes');
    const generarDatosBtn = document.getElementById('generarDatosBtn');
    const cuerpoTablaEstudiantes = document.getElementById('cuerpoTablaEstudiantes');
    const ksResultadosDiv = document.getElementById('ksResultados');
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    let datosEstudiantes = [];
    let charts = {}; // Para almacenar instancias de gráficos y actualizarlos

    // --- Funciones de Generación de Datos Aleatorios ---
    function generarSexo() {
        return Math.random() < 0.5 ? 'Masculino' : 'Femenino';
    }

    function generarEdad() {
        return Math.floor(Math.random() * (30 - 17 + 1)) + 17; // Edades 17-30
    }

    function generarTipoColegio() {
        return Math.random() < 0.6 ? 'Fiscal' : 'Particular'; // 60% Fiscal
    }

    function generarBooleano(probabilidadTrue = 0.5) {
        return Math.random() < probabilidadTrue;
    }

    function generarDistancia() {
        return parseFloat((Math.random() * (50 - 0.5) + 0.5).toFixed(1)); // 0.5km a 50km
    }

    function generarCantidadMateriasInscritas() {
        return Math.floor(Math.random() * (8 - 3 + 1)) + 3; // 3 a 8 materias
    }

    function generarCantidadMateriasReprobadas(inscritas, reproboSemAnt) {
        if (!reproboSemAnt) {
            return Math.random() < 0.7 ? 0 : (Math.random() < 0.85 ? 1 : 2);
        }
        let reprobadas = Math.floor(Math.random() * (Math.floor(inscritas / 2) + 1));
        return Math.min(reprobadas, inscritas);
    }

    function generarFechaTomaDato() {
        const anioActual = new Date().getFullYear();
        // Generar fechas en los últimos 5 años (ej. si hoy es 2025, genera de 2021 a 2025)
        const anioInicio = anioActual - 20;
        const anio = Math.floor(Math.random() * (anioActual - anioInicio + 1)) + anioInicio;
        const mes = Math.floor(Math.random() * 12) + 1;
        const dia = Math.floor(Math.random() * 28) + 1; // Simplificado a 28 días max
        return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }

    // --- Función Principal para Generar Datos de Estudiantes ---
    function generarDatosCompletos(cantidad) {
        const datos = [];
        for (let i = 0; i < cantidad; i++) {
            const materiasInscritas = generarCantidadMateriasInscritas();
            const reproboSemAnterior = generarBooleano(0.3); // 30% probabilidad
            const ayudaPadres = generarBooleano(0.7); // 70% recibe ayuda
            const padresProfesionales = generarBooleano(0.4); // 40% padres profesionales
            const personasDependientes = generarBooleano(0.2); // 20% tiene dependientes
            const distancia = generarDistancia();

            // Lógica simple para 'retiro_universidad'
            let probabilidadRetiro = 0.1; // Base
            if (reproboSemAnterior) probabilidadRetiro += 0.15;
            if (!ayudaPadres) probabilidadRetiro += 0.1;
            if (distancia > 30) probabilidadRetiro += 0.05;
            if (personasDependientes) probabilidadRetiro += 0.1;
            
            const retiroUniversidad = generarBooleano(probabilidadRetiro);

            datos.push({
                id: i + 1,
                sexo: generarSexo(),
                edad: generarEdad(),
                tipoColegio: generarTipoColegio(),
                ayudaPadres: ayudaPadres,
                distancia: distancia,
                reproboSemAnterior: reproboSemAnterior,
                materiasInscritas: materiasInscritas,
                materiasReprobadas: generarCantidadMateriasReprobadas(materiasInscritas, reproboSemAnterior),
                padresProfesionales: padresProfesionales,
                personasDependientes: personasDependientes,
                fechaTomaDato: generarFechaTomaDato(),
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
                <td>${est.fechaTomaDato}</td>
                <td>${est.retiroUniversidad ? 'Sí' : 'No'}</td>
            </tr>`;
            cuerpoTablaEstudiantes.innerHTML += fila;
        });
    }

    function actualizarGraficos(datos) {
        // Destruir gráficos anteriores si existen para evitar superposiciones
        Object.values(charts).forEach(chart => chart.destroy());
        charts = {}; // Limpiar el objeto de charts

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
        const edadesOrdenadas = Object.keys(conteoEdades).sort((a, b) => parseInt(a) - parseInt(b));
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
                scales: { y: { beginAtZero: true } }
            }
        });

        // 4. Gráfico Tipo de Colegio vs. Retiro (Grouped Bar Chart)
        const colegioRetiroData = {
            'Fiscal': { 'Retiró': 0, 'No Retiró': 0 },
            'Particular': { 'Retiró': 0, 'No Retiró': 0 }
        };
        datos.forEach(est => {
            const estadoRetiro = est.retiroUniversidad ? 'Retiró' : 'No Retiró';
            if (colegioRetiroData[est.tipoColegio]) { // Asegurarse que el tipo de colegio existe
                 colegioRetiroData[est.tipoColegio][estadoRetiro]++;
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
                scales: { y: { beginAtZero: true } }
            }
        });

        // 5. Nuevo Gráfico: Retiros por Año
        const retirosPorAnio = datos.filter(est => est.retiroUniversidad)
            .reduce((acc, est) => {
                const anio = est.fechaTomaDato.substring(0, 4); // Extraer el año
                acc[anio] = (acc[anio] || 0) + 1;
                return acc;
            }, {});
        
        const aniosOrdenadosRetiros = Object.keys(retirosPorAnio).sort();
        const conteoRetirosAnual = aniosOrdenadosRetiros.map(anio => retirosPorAnio[anio]);

        const canvasRetirosAnio = document.getElementById('retirosPorAnioChart');
        const ctxRetirosAnio = canvasRetirosAnio.getContext('2d');

        if (aniosOrdenadosRetiros.length > 0) {
            charts.retirosPorAnioChart = new Chart(ctxRetirosAnio, {
                type: 'bar',
                data: {
                    labels: aniosOrdenadosRetiros,
                    datasets: [{
                        label: 'Número de Retiros',
                        data: conteoRetirosAnual,
                        backgroundColor: '#FF9F40',
                    }]
                },
                options: {
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
            realizarYMostrarPruebaKS(conteoRetirosAnual);
        } else {
            ctxRetirosAnio.clearRect(0, 0, canvasRetirosAnio.width, canvasRetirosAnio.height); // Limpiar canvas
            ksResultadosDiv.innerHTML = "<p>No hay suficientes datos de retiros para generar el gráfico anual o realizar la prueba KS.</p>";
        }
    }

    // --- Funciones para la Prueba Kolmogorov-Smirnov ---
    function kolmogorovSmirnovTestUniform(dataSample) {
        if (!dataSample || dataSample.length === 0 ) {
             return { D: NaN, n: 0, explanation: "No hay datos para realizar la prueba KS." };
        }
        if (dataSample.length < 2) {
             return { D: NaN, n: dataSample.length, explanation: "Se requieren al menos 2 puntos de datos (años con retiros) para realizar la prueba KS de forma significativa." };
        }


        const n = dataSample.length;
        const sortedData = [...dataSample].sort((a, b) => a - b);

        const minVal = sortedData[0];
        const maxVal = sortedData[n - 1];

        if (minVal === maxVal) { 
             return { D: 0, n: n, minVal: minVal, maxVal:maxVal, explanation: `Todos los ${n} valores de conteo de retiros por año son idénticos (${minVal}). La discrepancia (D) con una distribución uniforme sobre este único valor es 0. Esto implica un ajuste perfecto si la hipótesis se centrara en este valor constante, pero dificulta la evaluación contra una uniforme en un rango.` };
        }

        let D_plus_max = 0;
        let D_minus_max = 0;

        for (let i = 0; i < n; i++) {
            const x_i = sortedData[i];
            const ecdf_val_at_xi = (i + 1) / n; 
            const ecdf_val_before_xi = i / n;   

            // CDF Teórica (Uniforme Continua entre minVal y maxVal)
            // F_0(x) = (x - minVal) / (maxVal - minVal)
            // Aseguramos que x_i esté dentro del rango para la CDF teórica, o en los bordes.
            let theoretical_cdf_val_at_xi;
            if (x_i < minVal) theoretical_cdf_val_at_xi = 0;
            else if (x_i > maxVal) theoretical_cdf_val_at_xi = 1;
            else theoretical_cdf_val_at_xi = (x_i - minVal) / (maxVal - minVal);
            
            const d_plus = Math.abs(ecdf_val_at_xi - theoretical_cdf_val_at_xi);
            if (d_plus > D_plus_max) {
                D_plus_max = d_plus;
            }

            const d_minus = Math.abs(theoretical_cdf_val_at_xi - ecdf_val_before_xi);
             if (d_minus > D_minus_max) {
                D_minus_max = d_minus;
            }
        }
        
        const D = Math.max(D_plus_max, D_minus_max);
        const D_critico_aprox_005 = 1.36 / Math.sqrt(n);

        let conclusion = `El estadístico D calculado es ${D.toFixed(4)}. `;
        conclusion += `Para un nivel de significancia $\\alpha = 0.05$, el valor crítico aproximado D_crit es ${D_critico_aprox_005.toFixed(4)}. `;
        if (D > D_critico_aprox_005) {
            conclusion += `Como D (${D.toFixed(4)}) > D_crit (${D_critico_aprox_005.toFixed(4)}), se rechaza la hipótesis nula ($H_0$). Esto sugiere que la cantidad de retiros por año NO sigue una distribución uniforme en el rango de ${minVal} a ${maxVal} retiros/año.`;
        } else {
            conclusion += `Como D (${D.toFixed(4)}) <= D_crit (${D_critico_aprox_005.toFixed(4)}), no se puede rechazar la hipótesis nula ($H_0$). Esto sugiere que los datos son consistentes con una distribución uniforme de retiros por año en el rango de ${minVal} a ${maxVal} retiros/año.`;
        }
        
        return {
            D: D,
            n: n,
            minVal: minVal,
            maxVal: maxVal,
            D_critico_aprox_005: D_critico_aprox_005,
            explanation: conclusion
        };
    }

    function realizarYMostrarPruebaKS(datosRetirosAnual) {
        const resultadoKS = kolmogorovSmirnovTestUniform(datosRetirosAnual);
        let htmlResultado = `<div>`;
        htmlResultado += `<p><strong>Resultados de la Prueba KS (vs. Distribución Uniforme Continua):</strong></p>`;
        htmlResultado += `<p>Muestra de datos (conteos de retiros por año): <code>[${datosRetirosAnual.join(', ')}]</code></p>`;
        htmlResultado += `<p>Número de observaciones (años con retiros): $n = ${resultadoKS.n}$</p>`;
        
        if (!isNaN(resultadoKS.D)) {
            htmlResultado += `<p>Rango de retiros observados: de ${resultadoKS.minVal} a ${resultadoKS.maxVal} retiros por año.</p>`;
            htmlResultado += `<p>Estadístico D (máxima diferencia absoluta): <strong>${resultadoKS.D.toFixed(4)}</strong></p>`;
            if (resultadoKS.D_critico_aprox_005) {
                htmlResultado += `<p>Valor crítico D aproximado para $\\alpha = 0.05$: ${resultadoKS.D_critico_aprox_005.toFixed(4)}</p>`;
            }
        }
        htmlResultado += `<p><strong>Conclusión:</strong> ${resultadoKS.explanation}</p>`;
        htmlResultado += `<p><small><strong>Nota:</strong> Esta es una implementación ilustrativa de la prueba KS. La CDF teórica utilizada es para una distribución uniforme continua sobre el rango de los datos observados. La validez de la aproximación del valor crítico $1.36/\\sqrt{n}$ es mayor para muestras grandes y cuando la distribución hipotética es continua y completamente especificada. Para una prueba formal, se recomienda usar software estadístico especializado.</small></p>`;
        htmlResultado += `</div>`;
        ksResultadosDiv.innerHTML = htmlResultado;
        
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([ksResultadosDiv]).catch(function (err) {
                console.error('Error al renderizar MathJax: ' + err.message);
            });
        }
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

    // Generar datos iniciales al cargar la página
    generarDatosBtn.click();
});