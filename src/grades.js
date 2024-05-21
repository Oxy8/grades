// import { obtemArrayTurmasPorAtividade } from './turmas.js';

// Recebe uma grade, retorna HTMLElement;
function montaTabelaComGrade(grade, index) {
    var tabela = geraTabelaVazia();

    for (var turma of grade) {
        adicionaTurmaTabela(tabela, turma);
    }

    tabelaComMoldura = geraMolduraTabela(tabela, index);

    return tabelaComMoldura;
}

function geraMolduraTabela(tabela, index) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'moldura';
    fieldset.style.backgroundColor = 'white';
  
    const i = document.createElement('i');
    fieldset.appendChild(i);
  
    const legend = document.createElement('legend');
    legend.className = 'legend-2';
    legend.textContent = 'OPÇÃO ' + (index+1);
    i.appendChild(legend);
  
    i.appendChild(document.createElement('br'));
  
    const table = document.createElement('table');
    table.className = 'modelo2';
    i.appendChild(table);
  
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
  
    
    tbody.appendChild(tabela);

  
    return fieldset;
  }
  

function geraTabelaVazia() {

    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
  
    const diasDaSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const larguraTd = 30;

    const row = document.createElement("tr");
    
    const cell = document.createElement("td");
    row.appendChild(cell);

    // Loop through the array and create a <td> element for each day
    diasDaSemana.forEach(dia => {
        let td = document.createElement('td');
        let numEspacos = (larguraTd - dia.length) - 2;
        let espacos = '&nbsp;'.repeat(numEspacos);
        td.innerHTML = `&nbsp;${dia}${espacos}`;
        row.appendChild(td);
    });

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
    table.className = 'modelo2';

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

    conjuntoArraysTurmasSemConflito = await obtemGrades();

    let fragment = new DocumentFragment();



    conjuntoArraysTurmasSemConflito.forEach((grade, index) => {
        var tabelaGrade = montaTabelaComGrade(grade, index);
        fragment.appendChild(tabelaGrade);
    });

    document.body.appendChild(fragment);
}

async function obtemGrades() {
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

    return conjuntoArraysTurmasSemConflito;
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
