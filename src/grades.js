// import { obtemArrayTurmasPorAtividade } from './turmas.js';

const divGrades = document.getElementById("divGrade");

// Recebe uma grade, retorna HTMLElement;

//=========================================//
// Precisa ser adaptada para receber par grade e turmas mesmo horario!
//=========================================//
function montaTabelaComGrade(grade, index) {
    
    var tabela = geraTabelaVazia();

    // grade = gradeEConflitos[0];


    for (var turma of grade) {
        adicionaTurmaTabela(tabela, turma);
    }

    // turmasMesmoHorario = gradeETurmasMesmoHorario[0];
    // tabelaTurmasMesmoHorario = geraTabelaTurmasMesmoHorario(turmasMesmoHorario);


    tabelaComMoldura = geraMolduraTabela(tabela, index);
    // tabelaComMoldura = geraMolduraTabela(tabela, tabelaTurmasMesmoHorario, index); ou
    // tabelaComMoldura = geraMolduraTabelaGrade(tabela, tabelaTurmasMesmoHorario, index);
    // (tem q melhorar os nomes, tabela e grade ta confuso qq é oq)

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

function geraMolduraTabelaUnica(tabela) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'moldura';
    fieldset.style.backgroundColor = 'white';
  
    const i = document.createElement('i');
    fieldset.appendChild(i);
  
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
    const larguraTd = 26;

    const row = document.createElement("tr");
    
    const cell = document.createElement("td");
    row.appendChild(cell);

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
                label.style.color = arrayTurma[3];
                
                label.textContent = stringTurma;

                var br = document.createElement('br');

                tabela.rows[n+1].cells[m+1].appendChild(label);
                tabela.rows[n+1].cells[m+1].appendChild(br);

            }
        }
    }
}


async function mostraGradeUnica() {

    let fragment = new DocumentFragment();

    await insereInfoFieldsetsOriginais(fragment);

    var tabela = geraTabelaVazia();

    var listaTurmas = await constroiArrayInfoTurmas();

    for (var turma of listaTurmas) {
        adicionaTurmaTabela(tabela, turma);
    }

    var tabelaComMoldura = geraMolduraTabelaUnica(tabela);

    fragment.appendChild(tabelaComMoldura);
    
    if (divGrades.style.display == "inline") { // Se grades ja tiverem sido geradas previamente.
        while (divGrades.firstChild) {
            divGrades.removeChild(divGrades.lastChild);
        }
    } else {
        divGrades.style.display = "inline";
    }

    divGrades.appendChild(fragment);
}

async function mostraGrades() {

    let fragment = new DocumentFragment();

    await insereInfoFieldsetsOriginais(fragment);

    var turmasMesmoHorario = [];

    var conjuntoArraysTurmasSemConflito = await obtemGrades();

    conjuntoArraysTurmasSemConflito.forEach((grade, index) => {
        var tabelaGrade = montaTabelaComGrade(grade, index);
        fragment.appendChild(tabelaGrade);
    });

    fragment.appendChild(geraTextoNumeroCronogramas(conjuntoArraysTurmasSemConflito.length));

    removeGradesHorarias();
    divGrades.style.display = "inline";
    divGrades.appendChild(fragment);
}

function removeGradesHorarias() {
    if (divGrades.style.display == "inline") { // Se grades ja tiverem sido geradas previamente.
        while (divGrades.firstChild) {
            divGrades.removeChild(divGrades.lastChild);
        }
    }

    divGrades.style.display = "none";
}

async function insereInfoFieldsetsOriginais(fragment) {

    var responseData = await cachedRequestMontaGrade();

    var tempResponse = document.createElement('div');
    tempResponse.innerHTML = responseData;
    var fieldsetCodigosCadeiras = tempResponse.getElementsByTagName("fieldset")[0];
    var fieldsetInfoTabelas = tempResponse.getElementsByTagName("fieldset")[1];
    let br1 = document.createElement('br');
    let br2 = document.createElement('br');

    fragment.appendChild(br1);
    fragment.appendChild(br2);

    fragment.appendChild(fieldsetCodigosCadeiras);
    fragment.appendChild(fieldsetInfoTabelas);

}


function geraTextoNumeroCronogramas(numero) {

    const paragraph = document.createElement('p');
    paragraph.style.padding = '15px';

    const italicText = document.createElement('i');

    const boldText = document.createElement('b');
    boldText.textContent = 'FORAM GERADOS ' + numero + ' CRONOGRAMAS';

    italicText.appendChild(boldText);

    paragraph.appendChild(italicText);

    return paragraph;
}

async function obtemGrades() {
    
    var turmasOrganizadasPorAtividade = await obtemArrayTurmasPorAtividade();
    var quantAtividades = turmasOrganizadasPorAtividade.length;

    const indicesMaximosControle = new Array(quantAtividades).fill(0);
    for (let i=0; i<quantAtividades; i++) {
        indicesMaximosControle[i] = turmasOrganizadasPorAtividade[i].length;
    }

    var indicesTurmaPorAtividade = new Array(quantAtividades).fill(0);


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
