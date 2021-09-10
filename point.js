class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    SqrtDist(p) {
        return Math.pow(p.x-this.x, 2)+Math.pow(p.y-this.y, 2);
    }

    static lerp(p1, p2, t) {
        var point = new Point(p1.x + (p2.x-p1.x)*t, p1.y + (p2.y-p1.y)*t);
        return point;
    }
}

class LineContainer {
    constructor() {
        this.lineList = [];
        this.currentLine = [];
        this.globalPoints = [];
    }

    Add(point) {
        this.currentLine.push(point);
        this.globalPoints.push(point);
    }

    End() {
        if (this.currentLine.length < 2) {
            this.currentLine = [];
            return;
        }
        this.lineList.push(this.currentLine);
        this.currentLine = [];
    }

    Remove(points) {
        if (points == null) {
            return;
        }

        this.lineList.forEach(line => {
            let int = points.filter(el => line.includes(el));
            if (int.length != 0) {
                int.forEach(function(p){
                    line.splice(line.findIndex(x=>x==p),1);
                });
            }
            if (line.length < 2) {
                this.lineList.splice(this.lineList.findIndex(x=>x==line), 1);
            }
        });
    }

    LastPoint() {
        if (this.currentLine.length == 0) {
            return null;
        }
        return this.currentLine[lines.currentLine.length-1];
    }

    SearchOne(p, radius) {
        const sqrtR = Math.pow(radius, 2);
        let results = this.globalPoints.some(pt => {return pt.SqrtDist(p) <= sqrtR;});
        if (!results) {
            return null;
        }
        this.globalPoints.sort(function(a, b) {
            return a.SqrtDist(p) - b.SqrtDist(p);
        });
        return this.globalPoints[0];
    }
    SearchAll(p, radius) {
        const sqrtR = Math.pow(radius, 2);
        let results = this.globalPoints.filter(pt => {return pt.SqrtDist(p) <= sqrtR;});
        return results;
    }
}

class PrimitiveObjectRender {
    constructor (ctx) {
        this.ctx = ctx;
    }

    DrawPoint(p) {
        this.ctx.beginPath();
        this.ctx.ellipse(p.x, p.y, 3, 3, 0, 0, Math.PI*2, false);
        this.ctx.stroke();
    }

    DrawSelectedPoint(p) {
        let prevStyle = this.ctx.strokeStyle;
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ED553B';
        this.ctx.ellipse(p.x, p.y, 4, 4, 0, 0, Math.PI*2, false);
        this.ctx.stroke();
        this.ctx.strokeStyle = prevStyle;
    }

    DrawSelectorSpot(p) {
        let prevStyle = this.ctx.strokeStyle;
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#C70039';
        this.ctx.ellipse(p.x, p.y, 6, 6, 0, 0, Math.PI*2, false);
        this.ctx.stroke();
        this.ctx.strokeStyle = prevStyle;
    }

    DrawLine(p1, p2) {
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    }
}

class MultiLineRender {
    constructor (ctx, primitiveRender) {
        this.ctx = ctx;
        this.render = primitiveRender;
    }

    DrawLines(points) {
        if (points.length == 0) {
            return;
        }

        this.render.DrawPoint(points[0]);
        for (let i = 0; i < points.length-1; i++) {
            this.render.DrawPoint(points[i+1]);
            this.render.DrawLine(points[i], points[i+1]);
        }
    }
}

class BezierCurveRender {
    constructor (ctx, primitiveRender) {
        this.ctx = ctx;
        this.render = primitiveRender;
        this.rate = 100;
    }

    Draw(line) {
        this.ctx.beginPath();
        const dimension = line.length-1;
        let prevPoint = null;
        const shift = 1/this.rate;
        for (let t = 0; t <= 1; t += shift) {
            let lpPoints = line;
            for (let d = 0; d < dimension; d++) {
                let newLpPoints = [];
                for (let i = 0; i < lpPoints.length-1; i++) {
                    newLpPoints.push(Point.lerp(lpPoints[i], lpPoints[i+1], t));
                }
                lpPoints = newLpPoints;
            }
            if (prevPoint != null) {
                this.render.DrawLine(prevPoint, lpPoints[0]);
            }
            prevPoint = lpPoints[0];
        }
    }
}