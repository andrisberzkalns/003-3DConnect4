import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { positionMap, getPos } from '~/components/PositionMap';

export const BoardSelections: React.FC<{addPiece: (a: THREE.Vector2) => void}> = (props) => {
    let hovered = useRef<any|null>(null);
    let selected = useRef<string|null>(null);
    const { camera, scene } = useThree((state) => state);
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (event: any) => {
        if (!camera) {
            console.log(props);
            console.log("no camera");
            return;
        }
        event.preventDefault();

        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        const selections = intersects.filter((selection) => selection.object.userData.isSelection);
        // Hide all selections that aren't the hovered one and aren't the selected one
        scene.children.forEach((child) => {
            if (child.userData.isSelection && child.userData.id !== selected.current) child.visible = false;
        })
        if (selections.length > 0) {
            const closestObj = selections[0]?.object;
            if (closestObj) {
                closestObj.visible = true;
                hovered.current = closestObj;
            }
        } else {
            hovered.current = null;
        }
    }

    const onMouseClick = (event: any) => {
        // Hide all selections that aren't the hovered one
        scene.children.forEach((child) => {
            if (child?.userData?.isSelection && hovered?.current?.userData?.id !== child?.userData?.id) child.visible = false;
        });
        // Double click logic
        if (selected.current == hovered?.current?.userData?.id) {
            const coords: string[] | undefined = selected?.current?.split(',');
            if (coords && coords[0] && coords[1]) {
                props.addPiece(new THREE.Vector2(parseInt(coords[0]), parseInt(coords[1])));
            }
            if (hovered?.current?.userData) {
                hovered.current.userData.isSelected = false;
                selected.current = null;
            }
            return;
        }
        if (hovered.current !== null) {
            selected.current = hovered.current.userData.id;
        }
    }


    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onMouseClick, false);
        return () => {
            window.removeEventListener('mousemove', onMouseMove, false);
            window.removeEventListener('click', onMouseClick, false);
        }
    }, [])

    return (
        <>
            {
                [...Array(4)].map((_, i) => {
                    return [...Array(4)].map((_, j) => <Selection pos={new THREE.Vector2(i, j)} placeable={true} hovered={true}/>);
                })
            }
        </>
    )
}


export const Selection: React.FC<{pos: THREE.Vector2, placeable: boolean, hovered: boolean}> = (props) => {
    const { hovered, placeable } = props;
    const [clicked, click] = useState(false);
    const positions = getPos(props.pos.x, props.pos.y);

    // const [hovered, hover] = useState(false);

    return (
        <>
            <mesh
                visible={false}
                userData={{ isSelection: true, isSelected: false, id: props.pos.x + ',' + props.pos.y }}
                position={[positions.x, 0.85, positions.y]}
                rotation={[0, 0, 0]}
                {...props}
                onClick={(event) => click(!clicked)}
                // onPointerOver={(event) => hover(true)}
                // onPointerOut={(event) => hover(false)}
                castShadow={true}
                receiveShadow={true}
            >
                <cylinderGeometry attach="geometry" args={[0.4, 0.4, 1.2]} />
                <meshStandardMaterial
                    attach="material"
                    color={"#FFFFFF"}
                    roughness={0.75}
                    metalness={0.5}
                    alphaTest={0.01}
                    transparent={true}
                    opacity={hovered && placeable ? 0.4 : 0}
                />
            </mesh>
        </>
    )
}