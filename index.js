class Vertice{
    constructor(cor) {
        this.loc = [-1, -1]//posicao do vertice no tabuleiro
        this.cor = cor//cor [valor de 1 até 9] que ele assumirá no tabuleiro
        this.adj = [];//array que armazena referências de objetos adjacentes ao vertice
    }
    setColor(cor) {
        this.cor = cor;
    }
    setLoc(linha, coluna) {
        this.loc[0] = linha;
        this.loc[1] = coluna;
    }
}
class Grafo{
    constructor(){
        this.vg = [];//Conjunto V(G)
    }
    addVertice(cor) {
        let v = new Vertice(cor);
        this.vg.push(v);
        return v;
    }
    addAresta(vertice1, vertice2){
        vertice1.adj.push(vertice2);
    }

}

class Tabuleiro{
    constructor() {
        this.grafo = new Grafo();//tabuleiro possui um grafo para armazenar as relações de adjacência
        this.tabuleiro = [];
        
    }
    carregaTabuleiro(){//cria os vertices e as relações de adjacência entre eles
        for (let i = 0; i < 9 ; i++){
            this.tabuleiro.push([]);
            for (let j = 0; j < 9; j++){
                let vertice = this.grafo.addVertice(0);
                vertice.setLoc(i, j);
                this.tabuleiro[i].push(vertice);//inicializa o tabuleiro com valores nulos
            }
        }
        for (let i = 0; i < 9; i++){//define todas as adjacências de todos os vértices inicializados
            for (let j = 0; j < 9; j++){
                this.defineAdj(this.tabuleiro[i][j]);
            }
        }
    }
    defineAdj(vertice) {//define adjacências para um vértice
        var linha_vertice = vertice.loc[0];
        var coluna_vertice = vertice.loc[1];
        var linha_bloco = Math.floor(linha_vertice / 3);
        var coluna_bloco = Math.floor(coluna_vertice / 3);
        var linha_min = linha_bloco * 3;
        var coluna_min = coluna_bloco * 3;
        var linha_max = linha_min + 3;
        var coluna_max = coluna_min + 3;
        for (let i of this.tabuleiro[linha_vertice]) {//Adicionando adjacência em linhas
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
        for (let i = linha_min; i < linha_max; i++) {//Adicionando adjacência em bloco ignorando os vértices já adicionados
            for (let j = coluna_min; j < coluna_max; j++){
                if (i == linha_vertice || j == coluna_vertice) {//Não adiciona adjacências já definidas anteriormente
                    continue;
                }
                if (this.tabuleiro[i][j] != vertice) {
                    this.grafo.addAresta(vertice, this.tabuleiro[i][j])
                }
            }
        }
    }
    colorIsValid(cor, vertice) {//se nenhum dos vertices adjacentes possui a cor, ela é válida
        for (let x of vertice.adj) {
            if (x.cor == cor) {
                return false;
            }
        }
        return true;
    }
    tryToColor(vertice) {
        let cor_atual = vertice.cor;
        for (let cor = cor_atual + 1; cor < 10; cor++){
            if (this.colorIsValid(cor, vertice)) {
                vertice.setColor(cor);
                return true;
            }
        }
        return false;
    }
    encontraCor0(){
        for (let linha = 0; linha < 9; linha++) {
            for (let coluna = 0; coluna < 9; coluna++) {
                if (this.tabuleiro[linha][coluna].cor == 0) {
                    if (linha == 5 && coluna == 8) {
                    }
                    return this.tabuleiro[linha][coluna];//retorna o vertice cuja cor é nula
                }
            }
        }
        return null;
    }
    backtracking() {
        var v_livre = this.encontraCor0();
        if (v_livre == null) {//Solução completa do tabuleiro, não existem vértices livres
            return true;
        }
        while (this.tryToColor(v_livre)) {//tenta colorir um vértice com cor válida
            if (this.backtracking()) {//chama recursão
                return true;
            }
        }
        v_livre.setColor(0);
        return false;
    }
    alteraCelula(pos_linha, pos_coluna, nova_cor) {//Tenta alterar a estrutura de um tabuleiro já carregado, caso possível
        var vertice = this.tabuleiro[pos_linha][pos_coluna];
        if (this.colorIsValid(nova_cor, vertice)) {
            vertice.setColor(nova_cor);
            return true;
        }
        return false;//Jogador perdeu
    }
}