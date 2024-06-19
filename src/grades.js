
const divGrades = document.getElementById("divGrade");


async function montaTabelaComGrade(grade, index, turmasMesmoHorario) {
    
    var tabela = geraTabelaVazia();

    for (var turma of grade) {
        adicionaTurmaTabela(tabela, turma);
    }

    const tabelaComMoldura = document.createElement('fieldset');
    tabelaComMoldura.className = 'moldura';
    tabelaComMoldura.style.backgroundColor = 'white';

    const i = geraMoldura(index);
    i.appendChild(tabela);
    let tabelaTurmasMesmoHorario = await criaTabelaTurmasMesmoHorario(turmasMesmoHorario);
    i.appendChild(tabelaTurmasMesmoHorario);
    tabelaComMoldura.appendChild(i);


    return tabelaComMoldura;
}

function geraMoldura(index) {

    const i = document.createElement('i');
  
    if (index != -1) { // Se for grade única, index = -1;
        const legend = document.createElement('legend');
        legend.className = 'legend-2';
        legend.textContent = 'OPÇÃO ' + (index+1);
        i.appendChild(legend);
    }
  
    i.appendChild(document.createElement('br'));

    return i;
}

async function criaTabelaTurmasMesmoHorario(turmasMesmoHorario) {

    const tabelaCoresAtividades = await constroiTabelaCores();

    const tabelaMesmoHorario = document.createElement('table');
    const tbodyMesmoHorario = document.createElement('tbody');
    tabelaMesmoHorario.appendChild(tbodyMesmoHorario);

    function createLinhaMesmoHorario(cor, atividade, turmas) {
        const tr = document.createElement('tr');
        tr.setAttribute('height', "10px");
    
        [atividade, turmas].forEach(content => {
            const td = document.createElement('td');
            const font = document.createElement('font');
            font.style.color = cor;
            font.innerHTML = content;
            td.appendChild(font);
            tr.appendChild(td);
        });
    
        return tr;
    }

    for (let j = 0; j < turmasMesmoHorario.length; j++) {
        let arrayTurmas = turmasMesmoHorario[j];

        if (arrayTurmas.length != 0) {

            var codAtividade = arrayTurmas[0].split(" - ")[0];

            let turmasAcc = arrayTurmas.map(turma => turma.slice(turma.indexOf(' - ') + 3));
            const row1 = createLinhaMesmoHorario(tabelaCoresAtividades[codAtividade], ("* " + codAtividade), "&nbsp;&nbsp;" + turmasAcc.join(";&nbsp;&nbsp;"));

            tbodyMesmoHorario.appendChild(row1);
        }
    }

    return tabelaMesmoHorario;
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

    var [turmasOrganizadasPorAtividade, arrayTurmasMesmoHorario] = await obtemTurmasEHorariosCoincidentes();
    
    arrayTurmasMesmoHorario = arrayTurmasMesmoHorario.map((ativ) => ativ.flat(1));

    var listaTurmas = turmasOrganizadasPorAtividade.flat(1);

    var tabelaComMoldura = await montaTabelaComGrade(listaTurmas, -1, arrayTurmasMesmoHorario);

    fragment.appendChild(tabelaComMoldura);
    
    removeGradesHorarias();
    divGrades.appendChild(fragment);
}

async function obtemTurmasEHorariosCoincidentes() {
    
    var turmasOrganizadasPorAtividade = await organizaTurmasSelecionadasPorAtividade();  
    var arrayTurmasMesmoHorario = geraArrayTurmasMesmoHorarioVazia(turmasOrganizadasPorAtividade);

    for (let a = 0; a < turmasOrganizadasPorAtividade.length; a++) {

        atividade = turmasOrganizadasPorAtividade[a];
        
        for (let i = 0; i < atividade.length; i++) {
            
            let j = i+1;
            while (j < atividade.length) {
                
                if (mesmoHorario(atividade[i][2], atividade[j][2])) {

                    if (arrayTurmasMesmoHorario[a][i].length == 0) {
                        arrayTurmasMesmoHorario[a][i].push(atividade[i][1]);
                        arrayTurmasMesmoHorario[a][i].push(atividade[j][1]);
                        turmasOrganizadasPorAtividade[a][i][1] = generalizaStringTurma(turmasOrganizadasPorAtividade[a][i][1]);
                    } else {
                        arrayTurmasMesmoHorario[a][i].push(atividade[j][1]);
                    }

                    atividade.splice(j, 1);

                } else {            
                    j++;
                }
            }
        }
    }

    return [turmasOrganizadasPorAtividade, arrayTurmasMesmoHorario];
}

async function mostraGrades() {

    let fragment = new DocumentFragment();
    await insereInfoFieldsetsOriginais(fragment);

    var conjuntoArraysTurmasSemConflito = await obtemGrades();

    for (let i = 0; i < conjuntoArraysTurmasSemConflito.length; i++) {
        var grade = conjuntoArraysTurmasSemConflito[i][0];
        var turmasMesmoHorario = conjuntoArraysTurmasSemConflito[i][1];
        
        var tabelaGrade = await montaTabelaComGrade(grade, i, turmasMesmoHorario);
        fragment.appendChild(tabelaGrade);
    }

    fragment.appendChild(geraTextoNumeroCronogramas(conjuntoArraysTurmasSemConflito.length));

    removeGradesHorarias();
    divGrades.appendChild(fragment);
}

function removeGradesHorarias() {
    if (divGrades.style.display == "inline") { // Se grades ja tiverem sido geradas previamente.
        while (divGrades.firstChild) {
            divGrades.removeChild(divGrades.lastChild);
        }
    } else {
        divGrades.style.display = "inline";
    }
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
    
    const [turmasOrganizadasPorAtividade, arrayTurmasMesmoHorario] = await obtemTurmasEHorariosCoincidentes();

    var quantAtividades = turmasOrganizadasPorAtividade.length;

    const quantidadeTurmasPorAtividade = new Array(quantAtividades).fill(0);
    for (let i=0; i<quantAtividades; i++) {
        quantidadeTurmasPorAtividade[i] = turmasOrganizadasPorAtividade[i].length;
    }

    var indicesTurmaPorAtividade = new Array(quantAtividades).fill(0);

    var conjuntoArraysTurmasSemConflito = [];

    var fim_do_loop = false;
    proximo_set: while (fim_do_loop == false) {

        var arrayTurmasSemConflito = [];

        var arrayTurmasMesmoHorarioSemConflito = [];
        // contem uma array pra cada turma.
        // se a turma nao tiver outras com mesmo horario,
        // a array é vazia, senão, contem os nomes das turmas.

        var verificaConflitos = new Uint16Array(6);
        
        for (let i=0; i<quantAtividades; i++) {

            var horarioCodificado = turmasOrganizadasPorAtividade[i][indicesTurmaPorAtividade[i]][2];

            var conflito = verificaConflitoHorarioCodificado(verificaConflitos, horarioCodificado);

            if (conflito) {
                fim_do_loop = tentaIncrementarIndice(quantidadeTurmasPorAtividade, indicesTurmaPorAtividade, i);

                continue proximo_set;

            } else {
                uniaoHorariosCodificados(verificaConflitos, horarioCodificado);

                arrayTurmasSemConflito.push(turmasOrganizadasPorAtividade[i][indicesTurmaPorAtividade[i]]);
                arrayTurmasMesmoHorarioSemConflito.push(arrayTurmasMesmoHorario[i][indicesTurmaPorAtividade[i]]);
            }
        }

        // Tenta incrementar o índice da última atividade, cuidando por um possível overflow.
        fim_do_loop = tentaIncrementarIndice(quantidadeTurmasPorAtividade, indicesTurmaPorAtividade, quantAtividades-1);

        conjuntoArraysTurmasSemConflito.push([arrayTurmasSemConflito, arrayTurmasMesmoHorarioSemConflito]);
    }
 
    return conjuntoArraysTurmasSemConflito;
}

function mesmoHorario(hor1, hor2) {
    for (let i = 0; i< hor1.length; i++) {
        if (hor1[i] != hor2[i]) {
            return false;
        }
    }
    return true;
}

function generalizaStringTurma(stringTurma) {
    var codigo = stringTurma.split(" - ")[0];
    return codigo + " - *"
}

function geraArrayTurmasMesmoHorarioVazia(turmasOrganizadasPorAtividade) {
    
    var arrayTurmasMesmoHorario = new Array();

    for (let a = 0; a < turmasOrganizadasPorAtividade.length; a++) {
        atividade = turmasOrganizadasPorAtividade[a];
        arrayTurmasMesmoHorario.push([]);

        for (let i = 0; i < atividade.length; i++) {
            arrayTurmasMesmoHorario[a].push([]);
        }
    }

    return arrayTurmasMesmoHorario;

}

function tentaIncrementarIndice(quantidadeTurmasPorAtividade, indicesTurmaPorAtividade, indice) {
    if (indice == -1) {
        return true; // retorna erro aqui.
    }
    
    indicesTurmaPorAtividade[indice] += 1;
    if (indicesTurmaPorAtividade[indice] >= quantidadeTurmasPorAtividade[indice]) {
        zeraDoIndiceAoFim(indicesTurmaPorAtividade, indice);
        return tentaIncrementarIndice(quantidadeTurmasPorAtividade, indicesTurmaPorAtividade, indice-1);
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
