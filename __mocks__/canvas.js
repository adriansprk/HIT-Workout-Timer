const createCanvas = () => ({
    getContext: () => ({
        measureText: () => ({
            width: 0,
        }),
        fillText: () => { },
        fillRect: () => { },
        clearRect: () => { },
        save: () => { },
        restore: () => { },
        translate: () => { },
        rotate: () => { },
        beginPath: () => { },
        moveTo: () => { },
        lineTo: () => { },
        stroke: () => { },
        fill: () => { },
        arc: () => { },
        closePath: () => { },
    }),
    toDataURL: () => '',
    width: 0,
    height: 0,
});

module.exports = {
    createCanvas,
    Canvas: class {
        constructor() {
            return createCanvas();
        }
    },
}; 