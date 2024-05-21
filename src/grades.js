// import { obtemArrayTurmasPorAtividade } from './turmas.js';

// Recebe uma grade, retorna HTMLElement;
function montaTabelaComGrade(grade) {
    var tabela = geraTabelaVazia();

    for (var turma of grade) {
        adicionaTurmaTabela(tabela, turma);
    }

    return tabela;
}
// melhor criar a tabela e depois inserir um por um?

// Como usar i e j para acessar 

function geraTabelaVazia() {

    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
  
    const diasDaSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    
    const row = document.createElement("tr");
    
    const cell = document.createElement("td");
    row.appendChild(cell);
    for (let n = 0; n < 6; n++) {
        const cell = document.createElement("td");
        cell.innerText = diasDaSemana[n];
        row.appendChild(cell);
    }
    tableBody.appendChild(row);

    for (let m = 0; m < 16; m++) {
        const row = document.createElement("tr");

        const cell = document.createElement("td");
        cell.innerText = (m+7)+":30";
        row.appendChild(cell);
        
        for (let n = 0; n < 6; n++) {
            const cell = document.createElement("td");
            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    }
  
    table.appendChild(tableBody);
    table.style.border = "1px";
    table.style.borderCollapse = "collapse";

    return table;
}


function adicionaTurmaTabela(tabela, arrayTurma) {
    
    var stringTurma = arrayTurma[1];
    var horarioCodificado = arrayTurma[2];


    for (let m = 0; m < 6; m++) {
        for (let n = 0; n < 16; n++) {
            var twoPowN = Math.pow(2,n);
            if ((horarioCodificado[m] & twoPowN) == twoPowN) {
                
                var label = document.createElement('label');
                label.style.padding = '2px';
                label.style.color = '#800000';

                // preciso considerar cores de
                // "Atividades de Ensino com Turma Programada"
                // salvar cor na array de turma quando
                // construindo stringTurma
                
                label.textContent = stringTurma;

                var br = document.createElement('br');

                tabela.rows[n+1].cells[m+1].appendChild(label);
                tabela.rows[n+1].cells[m+1].appendChild(br);

            }
        }
    }
}
  


async function mostraGradeUnica() {

    var arrayInfoTurmas = await obtemArrayTurmasPorAtividade();

    // chamada aqui com turmasPorAtividade para enfim, iterar cada uma das
    // cadeira, e tentar montar tabelas.

    // Monta array com todas possíveis combinações que não dão conflito
    // (2 for loops e um verificador de conflitos no fim pra decidir se add
    // na array ou não).
    // (tem que adicionar um limite de tamanho tambem pra nao explodir a memoria)

    // Depois pega cada um dos itens e processa em uma tabela, joga essa tabela no fim da página.
    

}

async function mostraGrades() {

    var turmasOrganizadasPorAtividade = await obtemArrayTurmasPorAtividade();
    var quantAtividades = turmasOrganizadasPorAtividade.length;

    const indicesMaximosControle = new Array(quantAtividades).fill(0);
    for (let i=0; i<quantAtividades; i++) {
        indicesMaximosControle[i] = turmasOrganizadasPorAtividade[i].length;
    }

    var indicesTurmaPorAtividade = new Array(quantAtividades).fill(0);

    //===================================================================

    var conjuntoArraysTurmasSemConflito = [];

    var fim_do_loop = false;
    proximo_set: while (fim_do_loop == false) {


        var arrayTurmasSemConflito = [];

        var verificaConflitos = new Uint16Array(6);
        
        for (let i=0; i<quantAtividades; i++) {

            var horarioCodificado = turmasOrganizadasPorAtividade[i][indicesTurmaPorAtividade[i]][2];

            var conflito = verificaConflitoHorarioCodificado(verificaConflitos, horarioCodificado);

            if (conflito) {
                fim_do_loop = tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, i);

                continue proximo_set;

            } else {
                uniaoHorariosCodificados(verificaConflitos, horarioCodificado);

                arrayTurmasSemConflito.push(turmasOrganizadasPorAtividade[i][indicesTurmaPorAtividade[i]]);
            }
        }

        // Tenta incrementar o índice da última atividade, cuidando por um possível overflow.
        fim_do_loop = tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, quantAtividades-1);

        conjuntoArraysTurmasSemConflito.push(arrayTurmasSemConflito);
    }

    for (var grade of conjuntoArraysTurmasSemConflito) {
        var tabelaGrade = montaTabelaComGrade(grade);
        document.body.appendChild(tabelaGrade);
    }
}

// Tenta incrementar índice na posição atual, zerando os restantes.  
function tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, indice) {
    if (indice == -1) {
        return true; // retorna erro aqui.
    }
    
    indicesTurmaPorAtividade[indice] += 1;
    if (indicesTurmaPorAtividade[indice] >= indicesMaximosControle[indice]) {
        zeraDoIndiceAoFim(indicesTurmaPorAtividade, indice);
        return tentaIncrementarIndice(indicesMaximosControle, indicesTurmaPorAtividade, indice-1);
    }

    return false;
}

function zeraDoIndiceAoFim(array, indice) {
    for (let k=indice; k < array.length; k++) {
        array[k] = 0;
    }
}

function uniaoHorariosCodificados(horario1, horario2) {

    for (let j=0; j<horario1.length; j++) {
        horario1[j] |= horario2[j];
    }
}

function verificaConflitoHorarioCodificado(horario1, horario2) {
 
    var diaHorario1;

    for (let j=0; j<horario1.length; j++) {
        
        diaHorario1 = horario1[j]; // Necessario para evitar modificar array original.
        diaHorario1 &= horario2[j];
        if (diaHorario1 != 0) {
            return true; // Houve conflito.
        }
    }

    return false; // Não houve conflito.
}

//
