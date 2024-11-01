class Caminante {

    constructor(cadena_, grosor, grafico) {
        this.cadena = cadena_;
        this.grosor = grosor;
        this.grafico = grafico;
        this.cantidadPasos = 30;
        this.paso = 0;
        this.contTramo = 0;
        this.anteX = -1;
        this.anteY = -1;
        this.opacidad = 0.9;
        this.color = color(random(1, 360), 200, 80, this.opacidad);
        this.termino = false;
    }

    avanzar() {
        this.paso++;
        if(this.paso > this.cantidadPasos){
            this.paso = 0;
            this.contTramo++;
        }
        this.caminanteTermino();
    }

    reiniciar() {
        if(this.paso > 0) {
            this.grafico.clear();
        }

        this.paso = 0;
        this.contTramo = 0;
        this.anteX = 0;
        this.anteY = 0;
        this.termino = false;
    }

    dibujar() { 
        if(this.contTramo < this.cadena.lista.length) {
            let c = this.cadena.lista[this.contTramo];
            let pos = map(this.paso, 0, this.cantidadPasos, 0.0, 1, 0);

            let esteX = bezierPoint(c.x1_, c.x2_, c.x3_, c.x4_, pos);
            let esteY = bezierPoint(c.y1_, c.y2_, c.y3_, c.y4_, pos);

            if(this.anteX != -1){
                this.grafico.strokeWeight(this.grosor);
                this.grafico.stroke(this.color);
                this.grafico.line(this.anteX, this.anteY, esteX, esteY);
            }

            this.anteX = esteX;
            this.anteY = esteY;
        }
    }

    caminanteTermino() {
        if(this.contTramo >= this.cadena.lista.length) {
            this.contTramo = this.cadena.lista.length - 1;
            this.paso = this.cantidadPasos;
            this.termino = true;
        }
    }

    caminanteColor(numero) {
        if (numero > 0.5) { // Cambia a 0.5 para hacer la decisión
            let hue = random(0, 61); // Color cálido
            this.color = color(hue, 55, 85, this.opacidad);
            console.log("Color cálido");
        } else {
            this.color = color(random(101, 240), 55, 85, this.opacidad); // Color frío
            console.log("Color frío");
        }
    }
    
}
