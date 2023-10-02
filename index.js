import { iniciarTimer, pararTimer } from "./timer.js";

let TAM = 0;
let blocoTAM = 0

var urlParams = new URLSearchParams(window.location.search);
var sudokuTAM = parseInt(urlParams.get('sudoku'));

class Vertice {
  constructor(cor) {
    this.loc = [-1, -1]; //posicao do vertice no tabuleiro
    this.cor = cor; //cor [valor de 1 até this.tamanho] que ele assumirá no tabuleiro
    this.adj = []; //array que armazena referências de objetos adjacentes ao vertice
  }
  setColor(cor) {
    this.cor = cor;
  }
  setLoc(linha, coluna) {
    this.loc[0] = linha;
    this.loc[1] = coluna;
  }
}
class Grafo {
  constructor() {
    this.vg = []; //Conjunto V(G)
  }
  addVertice(cor) {
    let v = new Vertice(cor);
    this.vg.push(v);
    return v;
  }
  addAresta(vertice1, vertice2) {
    vertice1.adj.push(vertice2);
  }
}

class Tabuleiro {
  constructor() {
    this.grafo = new Grafo(); //tabuleiro possui um grafo para armazenar as relações de adjacência
    this.tabuleiro = [];
  }

  setTamanho(tamanho) {
    this.tamanho = tamanho;
    this.blocoSize = Math.sqrt(tamanho);
    TAM = tamanho;
    blocoTAM = this.blocoSize
  }

  carregaTabuleiro() {
    //cria os vertices e as relações de adjacência entre eles
    for (let i = 0; i < this.tamanho; i++) {
      this.tabuleiro.push([]);
      for (let j = 0; j < this.tamanho; j++) {
        let vertice = this.grafo.addVertice(0);
        vertice.setLoc(i, j);
        this.tabuleiro[i].push(vertice); //inicializa o tabuleiro com valores nulos
      }
    }
    for (let i = 0; i < this.tamanho; i++) {
      //define todas as adjacências de todos os vértices inicializados
      for (let j = 0; j < this.tamanho; j++) {
        this.defineAdj(this.tabuleiro[i][j]);
      }
    }
  }

  defineAdj(vertice) {
    //define adjacências para um vértice
    var linha_vertice = vertice.loc[0];
    var coluna_vertice = vertice.loc[1];
    var linha_bloco = Math.floor(linha_vertice / this.blocoSize);
    var coluna_bloco = Math.floor(coluna_vertice / this.blocoSize);
    var linha_min = linha_bloco * this.blocoSize;
    var coluna_min = coluna_bloco * this.blocoSize;
    var linha_max = linha_min + this.blocoSize;
    var coluna_max = coluna_min + this.blocoSize;
    for (let i of this.tabuleiro[linha_vertice]) {
      //Adicionando adjacência em linhas
      if (i != vertice) {
        this.grafo.addAresta(vertice, i);
      }
    }
    //Adicionando adjacência em colunas
    for (let i of this.tabuleiro) {
      if (i[coluna_vertice] != vertice) {
        this.grafo.addAresta(vertice, i[coluna_vertice]);
      }
    }
    for (let i = linha_min; i < linha_max; i++) {
      //Adicionando adjacência em bloco ignorando os vértices já adicionados
      for (let j = coluna_min; j < coluna_max; j++) {
        if (i == linha_vertice || j == coluna_vertice) {
          //Não adiciona adjacências já definidas anteriormente
          continue;
        }
        if (this.tabuleiro[i][j] != vertice) {
          this.grafo.addAresta(vertice, this.tabuleiro[i][j]);
        }
      }
    }
  }
  colorIsValid(cor, vertice) {
    //se nenhum dos vertices adjacentes possui a cor, ela é válida
    for (let x of vertice.adj) {
      if (x.cor == cor) {
        return false;
      }
    }
    return true;
  }
  tryToColor(vertice) {
    let cor_atual = vertice.cor;
    for (let cor = cor_atual + 1; cor < this.tamanho + 1; cor++) {
      if (this.colorIsValid(cor, vertice)) {
        vertice.setColor(cor);
        return true;
      }
    }
    return false;
  }
  encontraCor0() {
    for (let linha = 0; linha < this.tamanho; linha++) {
      for (let coluna = 0; coluna < this.tamanho; coluna++) {
        if (this.tabuleiro[linha][coluna].cor == 0) {
          return this.tabuleiro[linha][coluna]; //retorna o vertice cuja cor é nula
        }
      }
    }
    return null;
  }
  backtracking() {
    var v_livre = this.encontraCor0();
    if (v_livre == null) {
      //Solução completa do tabuleiro, não existem vértices livres
      return true;
    }
    while (this.tryToColor(v_livre)) {
      //tenta colorir um vértice com cor válida
      if (this.backtracking()) {
        //chama recursão
        return true;
      }
    }
    v_livre.setColor(0);
    return false;
  }
  alteraCelula(pos_linha, pos_coluna, nova_cor) {
    //Tenta alterar a estrutura de um tabuleiro já carregado, caso possível
    var vertice = this.tabuleiro[pos_linha][pos_coluna];
    if (this.colorIsValid(nova_cor, vertice)) {
      vertice.setColor(nova_cor);
      return true;
    }
    return false; //Jogador perdeu
  }

  Celula(valor, cor) {
    this.valor = valor;
    this.cor = cor;
    this.alteradoPeloUsuario = false; // novo campo
  }
}

const tabuleiro = new Tabuleiro();
tabuleiro.setTamanho(sudokuTAM);
iniciarTimer();

// Função para carregar o tabuleiro no HTML
function carregarTabuleiro() {
  const grid = document.getElementById("sudoku-grid");
  for (let i = 0; i < TAM; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < TAM; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = 1;
      input.max = TAM;
      input.maxLength = 1;
      input.value = tabuleiro.tabuleiro[i][j].cor
        ? tabuleiro.tabuleiro[i][j].cor
        : "";

      if (tabuleiro.tabuleiro[i][j].alteradoPeloUsuario) {
        input.classList.add("celula-alterada");
      }
      input.addEventListener("input", () => {
        if (input.value.length > 2) {
          input.value = input.value.slice(0, 2);
        }
        tabuleiro.alteraCelula(
          i,
          j,
          parseInt(input.value) ? parseInt(input.value) : 0
        );
        tabuleiro.tabuleiro[i][j].alteradoPeloUsuario = true; // definir como verdadeiro
        input.classList.add("celula-alterada"); // adicionar classe CSS
      });

      input.addEventListener("blur", () => {
        if (!input.value) {
          tabuleiro.tabuleiro[i][j].alteradoPeloUsuario = false;
          input.classList.remove("celula-alterada");
        }
      });

      if (sudokuTAM === 9) {
        input.style.padding = '13px'
        input.style.fontSize = '23px'
      }
      else if (sudokuTAM === 16) {
        input.style.padding = '7px'
        input.style.fontSize = '15px'
      }
      else {
        input.style.padding = '1px'
        input.style.fontSize = '10px'
      }

      cell.style.borderBottom = "1px solid #e7e7e7";
      cell.style.borderRight = "1px solid #e7e7e7";
      if (i % blocoTAM === 0) cell.style.borderTop = "3px solid #e7e7e7";
      if (j % blocoTAM === 0) cell.style.borderLeft = "3px solid #e7e7e7";

      cell.appendChild(input);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

// Função para resolver o Sudoku quando o botão é clicado
const solveButton = document.getElementById("solve-button");
const sucessBox = document.getElementById("sucess-box");
solveButton.addEventListener("click", () => {
  const grid = document.getElementById("sudoku-grid");
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  if (tabuleiro.backtracking()) {
    carregarTabuleiro();
    solveButton.classList.add("hide");
    sucessBox.classList.remove("hide");
    pararTimer();
  } else {
    alert("Não foi possível encontrar uma solução válida.");
  }
});

// Carrega o tabuleiro no início
tabuleiro.carregaTabuleiro();
carregarTabuleiro();

document.getElementById("reload-button").addEventListener("click", () => {
  window.location.reload(true);
});
