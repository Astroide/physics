function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}
function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rotateThings(d, cls) {
    try {
        d = d || (10 / 360);
        cls = cls || 9;
        cls = '.mtk' + cls;
        let color = getComputedStyle(document.querySelector(cls)).getPropertyValue('color');
        let r, g, b;
        if (color.length == 7) {
            r = parseInt(color.substring(1, 3), 16);
            g = parseInt(color.substring(3, 5), 16);
            b = parseInt(color.substring(5, 7), 16);
        } else if (/rgb\(\d+, \d+, \d+\)/.test(color)) {
            let rgb = color.match(/\d+/g);
            r = parseInt(rgb[0]);
            g = parseInt(rgb[1]);
            b = parseInt(rgb[2]);
        } else {
            r = parseInt(color.substring(1, 2), 16);
            g = parseInt(color.substring(2, 3), 16);
            b = parseInt(color.substring(3, 4), 16);
        }
        /** @type {HTMLStyleElement} */
        let element = document.querySelector('#color-rotate-style-' + cls.slice(1));
        if (element == null) {
            element = document.createElement('style');
            element.id = 'color-rotate-style-' + cls.slice(1);
            document.body.appendChild(element);
        }
        // console.log('rgb:', r, g, b);
        const hsl = rgbToHsl(r, g, b);
        // console.log('hsl:', +hsl[0].toFixed(2), +hsl[1].toFixed(2), +hsl[2].toFixed(2));
        // console.log(hsl[0]);
        hsl[0] += d;
        if (hsl[0] >= 1) {
            hsl[0] -= 1;
        }
        // console.log(hsl[0]);
        // console.log('new hsl:', +hsl[0].toFixed(2), +hsl[1].toFixed(2), +hsl[2].toFixed(2));
        const newRgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        // console.log(hsl[0]);
        // console.log('new rgb:', newRgb[0], newRgb[1], newRgb[2]);
        let r1 = newRgb[0];
        let g1 = newRgb[1];
        let b1 = newRgb[2];
        // console.log('rgb:', r1, g1, b1);
        element.innerText = `
    ${cls} {
        color: #${r1.toString(16).padStart(2, '0')}${g1.toString(16).padStart(2, '0')}${b1.toString(16).padStart(2, '0')} !important;
    }
    `;
    } catch (e) { }
}
setInterval(() => {
    for (let i = 0; i < 20; i++) {
        rotateThings(0.005, i);
    }
}, 20);