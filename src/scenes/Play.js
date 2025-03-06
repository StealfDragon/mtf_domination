class Play extends Phaser.Scene {
    constructor() {
        super("playScene")
    }

    create() {
        // this.tempFrance = this.add.tileSprite(0,0, 600, 600, 'France').setOrigin(0,0)

        const scaleFactor = 0.75; // Adjust this value to make the shape bigger or smaller

        this.countryOutline = new Phaser.Geom.Polygon([
            365.96265 * scaleFactor, 232.9695 * scaleFactor,
            347.39003 * scaleFactor, 143.87735 * scaleFactor,
            382.63164 * scaleFactor, 148.70077 * scaleFactor,
            389.11705 * scaleFactor, 178.45314 * scaleFactor,
            444.057 * scaleFactor, 186.73364 * scaleFactor,
            466.63102 * scaleFactor, 175.47 * scaleFactor,
            465.35647 * scaleFactor, 152.74944 * scaleFactor,
            547.55192 * scaleFactor, 109.13685 * scaleFactor,
            548.90293 * scaleFactor, 45.600454 * scaleFactor,
            596.26311 * scaleFactor, 32.741794 * scaleFactor,
            615.76435 * scaleFactor, 65.80692 * scaleFactor,
            632.47971 * scaleFactor, 57.540638 * scaleFactor,
            643.62329 * scaleFactor, 80.502532 * scaleFactor,
            665.91043 * scaleFactor, 94.279667 * scaleFactor,
            686.34031 * scaleFactor, 95.198143 * scaleFactor,
            690.05484 * scaleFactor, 125.50783 * scaleFactor,
            710.48471 * scaleFactor, 130.10022 * scaleFactor,
            729.05733 * scaleFactor, 112.64918 * scaleFactor,
            733.70049 * scaleFactor, 142.0404 * scaleFactor,
            768.05982 * scaleFactor, 163.16534 * scaleFactor,
            788.4897 * scaleFactor, 158.57296 * scaleFactor,
            801.49053 * scaleFactor, 169.59467 * scaleFactor,
            826.56359 * scaleFactor, 167.75772 * scaleFactor,
            845.13622 * scaleFactor, 193.47504 * scaleFactor,
            926.85569 * scaleFactor, 201.74133 * scaleFactor,
            898.08814 * scaleFactor, 293.03353 * scaleFactor,
            900.57328 * scaleFactor, 330.51488 * scaleFactor,
            875.78106 * scaleFactor, 336.75726 * scaleFactor,
            860.92288 * scaleFactor, 344.10506 * scaleFactor,
            872.06651 * scaleFactor, 347.77897 * scaleFactor,
            809.84821 * scaleFactor, 454.32215 * scaleFactor,
            820.47727 * scaleFactor, 457.3058 * scaleFactor,
            832.13983 * scaleFactor, 448.02276 * scaleFactor,
            826.84261 * scaleFactor, 444.0391 * scaleFactor,
            828.40643 * scaleFactor, 433.56208 * scaleFactor,
            856.27975 * scaleFactor, 428.60483 * scaleFactor,
            862.78015 * scaleFactor, 454.55177 * scaleFactor,
            876.74619 * scaleFactor, 468.73906 * scaleFactor,
            871.35691 * scaleFactor, 478.27719 * scaleFactor,
            863.58097 * scaleFactor, 486.8834 * scaleFactor,
            875.43663 * scaleFactor, 497.95093 * scaleFactor,
            889.22793 * scaleFactor, 517.49634 * scaleFactor,
            882.28146 * scaleFactor, 532.39259 * scaleFactor,
            857.20844 * scaleFactor, 540.65887 * scaleFactor,
            865.56611 * scaleFactor, 565.45771 * scaleFactor,
            879.4955 * scaleFactor, 565.45771 * scaleFactor,
            883.21005 * scaleFactor, 577.3979 * scaleFactor,
            873.92379 * scaleFactor, 604.95217 * scaleFactor,
            903.63994 * scaleFactor, 626.07711 * scaleFactor,
            926.85569 * scaleFactor, 622.40321 * scaleFactor,
            916.64075 * scaleFactor, 655.46833 * scaleFactor,
            833.99258 * scaleFactor, 724.35402 * scaleFactor,
            699.34114 * scaleFactor, 685.77804 * scaleFactor,
            649.19508 * scaleFactor, 715.16926 * scaleFactor,
            638.98014 * scaleFactor, 780.38104 * scaleFactor,
            567.47556 * scaleFactor, 788.64732 * scaleFactor,
            482.04151 * scaleFactor, 744.56048 * scaleFactor,
            480.18425 * scaleFactor, 757.41914 * scaleFactor,
            436.5386 * scaleFactor, 758.33761 * scaleFactor,
            325.1029 * scaleFactor, 693.12584 * scaleFactor,
            348.31867 * scaleFactor, 681.18566 * scaleFactor,
            381.74939 * scaleFactor, 443.30044 * scaleFactor,
            339.64059 * scaleFactor, 424.03474 * scaleFactor,
            320.45975 * scaleFactor, 390.02885 * scaleFactor,
            297.24398 * scaleFactor, 352.37135 * scaleFactor,
            302.81576 * scaleFactor, 332.16488 * scaleFactor,
            276.15622 * scaleFactor, 331.3582 * scaleFactor,
            248.69521 * scaleFactor, 316.28279 * scaleFactor,
            227.64597 * scaleFactor, 300.41468 * scaleFactor,
            194.57466 * scaleFactor, 300.40068 * scaleFactor,
            190.77703 * scaleFactor, 285.12666 * scaleFactor,
            172.80743 * scaleFactor, 276.13784 * scaleFactor,
            197.78995 * scaleFactor, 272.31257 * scaleFactor,
            193.23732 * scaleFactor, 246.74662 * scaleFactor,
            170.95017 * scaleFactor, 252.25746 * scaleFactor,
            174.66469 * scaleFactor, 233.88795 * scaleFactor,
            193.16726 * scaleFactor, 228.10134 * scaleFactor,
            218.07575 * scaleFactor, 223.33372 * scaleFactor,
            243.38339 * scaleFactor, 223.78471 * scaleFactor,
            274.95683 * scaleFactor, 211.84453 * scaleFactor,
            294.45808 * scaleFactor, 242.15423 * scaleFactor,
            365.96265 * scaleFactor, 232.9695 * scaleFactor
        ]);
        
        this.graphics = this.add.graphics({ lineStyle: { width: 3, color: 0xf5ad42 } });
        this.graphics.strokePoints(this.countryOutline.points, true);

        this.triangles = this.triangulateCountry(this.countryOutline);
        this.drawTriangles(this, this.triangles);
    }

    update() {
        
    }

    triangulateCountry(countryOutline) {
        let points = countryOutline.points.map(p => [p.x, p.y]); // Convert Phaser points to array
        let delaunay = Delaunator.from(points);
        let triangles = [];

        for (let i = 0; i < delaunay.triangles.length; i += 3) {
            let p1 = points[delaunay.triangles[i]];
            let p2 = points[delaunay.triangles[i + 1]];
            let p3 = points[delaunay.triangles[i + 2]];

            // Calculate center of the triangle
            let centerX = (p1[0] + p2[0] + p3[0]) / 3;
            let centerY = (p1[1] + p2[1] + p3[1]) / 3;

            // Check if the triangle's center is inside the polygon
            if (Phaser.Geom.Polygon.Contains(countryOutline, centerX, centerY)) {
                let t = new Phaser.Geom.Triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
                triangles.push(t);
            }
        }

        return triangles;
    }

    drawTriangles(scene, triangles) {
        triangles.forEach(triangle => {
            let graphics = scene.add.graphics({ lineStyle: { width: 3, color: 0xf5ad42 } });
            graphics.strokeTriangleShape(triangle);
    
            // Make interactive
            graphics.setInteractive(triangle, Phaser.Geom.Triangle.Contains);
            graphics.on('pointerdown', function () {
                console.log("Triangle clicked:", triangle);
                let graphics = scene.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } });
                graphics.fillTriangleShape(triangle);
            });
        });
    }
}