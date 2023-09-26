/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 .\pieceAnimation.gltf --types 
*/

import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import {
  useThree,
  MeshProps,
  MeshStandardMaterialProps,
} from "@react-three/fiber";
import { useGLTF, useAnimations, PositionalAudio } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { positionMap, getPos } from "~/components/3D/PositionMap";
import { ESquareState } from "~/types/game.types";

type GLTFResult = GLTF & {
  nodes: {
    Piece: THREE.Mesh;
  };
  materials: {
    Dark: THREE.MeshPhysicalMaterial;
    Light: THREE.MeshPhysicalMaterial;
  };
};
type ActionName = "PieceAction";
type GLTFActions = Record<ActionName, THREE.AnimationAction>;
type ContextType = Record<
  string,
  React.ForwardRefExoticComponent<JSX.IntrinsicElements["mesh"]>
>;

export const Piece = (
  props: JSX.IntrinsicElements["group"] & {
    pos: THREE.Vector3;
    square: ESquareState;
  },
) => {
  const { square } = props;
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF(
    "/assets/pieceAnimation.gltf",
  ) as GLTFResult;
  const { mixer } = useAnimations<THREE.AnimationClip>(animations, group);

  const ESquareMaterialMap: {
    [key in ESquareState]: {
      mesh?: MeshProps;
      meshStandardMaterial?: MeshStandardMaterialProps;
    };
  } = {
    [ESquareState.Empty]: {
      mesh: {
        material: materials.Light,
      },
    },
    [ESquareState.Light]: {
      mesh: {
        material: materials.Light,
      },
    },
    [ESquareState.Dark]: {
      mesh: {
        material: materials.Dark,
      },
    },
    [ESquareState.LightHighlighted]: {
      mesh: {
        material: materials.Light,
      },
      meshStandardMaterial: {
        emissive: "#FF6600",
        roughness: 1,
      },
    },
    [ESquareState.DarkHighlighted]: {
      mesh: {
        material: materials.Dark,
      },
      meshStandardMaterial: {
        emissive: "#001166",
        emissiveIntensity: 0.1,
        roughness: 1,
      },
    },
  };

  useEffect(() => {
    if (animations[0] && group.current) {
      const animation = mixer.clipAction(animations[0], group.current);
      animation.setLoop(THREE.LoopOnce, 1);
      animation.clampWhenFinished = true;
      animation.enabled = true;
      animation.play();
    }
  });

  const positions = getPos(props.pos.x, props.pos.y);

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      position={[positions.x, 0.29 + props.pos.z * 0.27, positions.y]}
      rotation={[
        0,
        positions.x + positions.y + (props.pos.z / 27) * 2 * Math.PI,
        0,
      ]}
    >
      <group name="Scene">
        <mesh
          name="Piece"
          geometry={nodes.Piece.geometry}
          position={[0, 14.256, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.015}
          castShadow
          receiveShadow
          {...ESquareMaterialMap[square].mesh}
        >
          {ESquareMaterialMap[square].meshStandardMaterial !== undefined && (
            <meshStandardMaterial
              attach="material"
              name="Glow"
              color="#ff0000"
              {...ESquareMaterialMap[square].meshStandardMaterial}
            />
          )}
        </mesh>
        <PositionalAudio
          autoplay
          url="/assets/drop.ogg"
          distance={1}
          loop={false}
        />
      </group>
    </group>
  );
};

useGLTF.preload("/assets/pieceAnimation.gltf");
