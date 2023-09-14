import * as THREE from 'three'

// export const positionMap: THREE.Vector2[] = [
//     new THREE.Vector2(-1.37, 1.37),
//     new THREE.Vector2(-1.37, 0.45),
//     new THREE.Vector2(-1.37, -0.45),
//     new THREE.Vector2(-1.37, -1.37),
//     new THREE.Vector2(-0.45, 1.37),
//     new THREE.Vector2(-0.45, 0.45),
//     new THREE.Vector2(-0.45, -0.45),
//     new THREE.Vector2(-0.45, -1.37),
//     new THREE.Vector2(0.45, 1.37),
//     new THREE.Vector2(0.45, 0.45),
//     new THREE.Vector2(0.45, -0.45),
//     new THREE.Vector2(0.45, -1.37),
//     new THREE.Vector2(1.37, 1.37),
//     new THREE.Vector2(1.37, 0.45),
//     new THREE.Vector2(1.37, -0.45),
//     new THREE.Vector2(1.37, -1.37)
// ]

export const positionMap: THREE.Vector2[][] = [[
    new THREE.Vector2(-1.37, 1.37),
    new THREE.Vector2(-1.37, 0.45),
    new THREE.Vector2(-1.37, -0.45),
    new THREE.Vector2(-1.37, -1.37),
],[
    new THREE.Vector2(-0.45, 1.37),
    new THREE.Vector2(-0.45, 0.45),
    new THREE.Vector2(-0.45, -0.45),
    new THREE.Vector2(-0.45, -1.37),
],[
    new THREE.Vector2(0.45, 1.37),
    new THREE.Vector2(0.45, 0.45),
    new THREE.Vector2(0.45, -0.45),
    new THREE.Vector2(0.45, -1.37),
],[
    new THREE.Vector2(1.37, 1.37),
    new THREE.Vector2(1.37, 0.45),
    new THREE.Vector2(1.37, -0.45),
    new THREE.Vector2(1.37, -1.37)
]];

export const getPos = (x: number, y: number) => {
    const positionRow = positionMap[x];
    if (positionRow === undefined) {
        return new THREE.Vector2(0, 0);
    }
    const position = positionRow[y];
    if (position === undefined) {
        return new THREE.Vector2(0, 0);
    }
    return position;
}