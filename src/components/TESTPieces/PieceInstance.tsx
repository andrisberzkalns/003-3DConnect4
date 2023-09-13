import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber';
import { GLTF } from 'three-stdlib'
import { getPos } from '~/components/PositionMap';

type ActionName = 'PieceAction'
type GLTFActions = Record<ActionName, THREE.AnimationAction>
type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

const material = new THREE.MeshStandardMaterial({
    color: 0xaaaaff,
    transparent: true,
    opacity: 0.8,
    metalness: 0.2
});
const matrix = new THREE.Matrix4();

// const geometry = new THREE.BufferGeometry();
const boxesGeometry = new THREE.SphereGeometry(0.01, 1, 8);
boxesGeometry.scale(0.2,35,0.2);

export const PieceInstance: React.FC<{gameState: any}> = ({ gameState }) => {
    const refLight = useRef<any>();
    const refDark = useRef<any>();
    const { nodes, materials, animations } = useGLTF('/assets/pieceAnimation.gltf') as GLTFResult
    const count = gameState.board.reduce((acc: number, row: number[][]) => {
        return acc + row.reduce((acc: number, col: number[]) => {
            return acc + col.reduce((acc: number, piece: number) => {
                return acc + (piece == 0 ? 0 : 1);
            }, 0);
        }, 0);
    }, 0);

    useEffect(() => {
        let count = 0;
        console.log(gameState);
        gameState.board.forEach((row: number[][], i: number) => {
            row.forEach((col, j: number) => {
                col.forEach((piece, k: number) => {
                    // 0 - empty, 1 - light, 2 - dark'
                    console.log(piece);
                    if (piece == 0) return;
                    count++;
                    const dummy = new THREE.Object3D();

                    const position = getPos(i, j);
                    console.log(position);

                    dummy.position.x = position.x * 66.6;
                    dummy.position.y = position.y * 66.6;
                    dummy.position.z = -28 + (k * -18);

                    dummy.updateMatrix()
                    if (piece == 1) refLight.current.setMatrixAt(count, dummy.matrix);
                    if (piece == 2) refDark.current.setMatrixAt(count, dummy.matrix);
                        // return <Piece height={k} pos={new THREE.Vector2(i, j)} isDark={gameState.state != GameState.LightWin && (gameState.state == GameState.DarkWin || piece == 2)}/>
                });
            });
        });
    }, [gameState]);

    // useFrame(({ clock }) => {
    //     let count = 0;
    //     gameState.board.forEach((row: number[][], i: number) => {
    //         row.forEach((col, j: number) => {
    //             col.forEach((piece, k: number) => {
    //                 // 0 - empty, 1 - light, 2 - dark
    //                 if (piece == 0) return;
    //                 count++;

    //                 const dummy = new THREE.Object3D();
    //                 matrix.decompose(dummy.position, dummy.rotation, dummy.scale);

    //                 const position = getPos(i, j);

    //                 dummy.position.x = position.x;
    //                 dummy.position.y = 0.29 + (k * 0.27);
    //                 dummy.position.z = position.y;

    //                 dummy.updateMatrix()
    //                 ref.current.setMatrixAt(count, dummy.matrix);
    //                     // return <Piece height={k} pos={new THREE.Vector2(i, j)} isDark={gameState.state != GameState.LightWin && (gameState.state == GameState.DarkWin || piece == 2)}/>
    //             });
    //         })
    //     })
    //     ref.current.instanceMatrix.needsUpdate = true;
    // });


    return (
        <>
            <instancedMesh
                ref={refLight}
                args={[nodes.Piece.geometry, materials.Light, count]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.015}
                castShadow
                receiveShadow
            />
            <instancedMesh
                ref={refDark}
                args={[nodes.Piece.geometry, materials.Dark, count]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.015}
                castShadow
                receiveShadow
            />
        </>
    )
}

useGLTF.preload('/assets/pieceAnimation.gltf');
