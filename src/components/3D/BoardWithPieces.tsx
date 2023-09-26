import * as THREE from "three";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    ["TTT-field-circle_1"]: THREE.Mesh;
    ["TTT-field-circle_2"]: THREE.Mesh;
    ["TTT-field-circle_3"]: THREE.Mesh;
    ["TTT-field-circle_4"]: THREE.Mesh;
    ["TTT-piece-circle"]: THREE.Mesh;
    ["TTT-piece-circle001"]: THREE.Mesh;
  };
  materials: {
    Ply_sides: THREE.MeshStandardMaterial;
    Ply_top: THREE.MeshStandardMaterial;
    Ply_sticks: THREE.MeshStandardMaterial;
    Ply_edges: THREE.MeshStandardMaterial;
    Light: THREE.MeshStandardMaterial;
    ["Dark.001"]: THREE.MeshPhysicalMaterial;
  };
};

type ContextType = Record<
  string,
  React.ForwardRefExoticComponent<JSX.IntrinsicElements["mesh"]>
>;

export function BoardWithPieces(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/assets/boardWithPieces-transformed.glb",
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group
        position={[-0.001, 0.656, -0.003]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.015}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["TTT-field-circle_1"].geometry}
          material={materials.Ply_sides}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["TTT-field-circle_2"].geometry}
          material={materials.Ply_top}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["TTT-field-circle_3"].geometry}
          material={materials.Ply_sticks}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["TTT-field-circle_4"].geometry}
          material={materials.Ply_edges}
        />
      </group>
      {/* <mesh castShadow receiveShadow geometry={nodes['TTT-piece-circle'].geometry} material={materials.Light} position={[-0.471, 0.426, 0.466]} rotation={[Math.PI / 2, 0, 0]} scale={0.015} /> */}
      {/* <mesh castShadow receiveShadow geometry={nodes['TTT-piece-circle001'].geometry} material={materials['Dark.001']} position={[0.469, 0.426, -0.472]} rotation={[Math.PI / 2, 0, 0]} scale={0.015} /> */}
    </group>
  );
}

useGLTF.preload("/assets/boardWithPieces-transformed.glb");