/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 .\boardWithPieces-animation.gltf --types 
*/

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    ['TTT-field-circle_1']: THREE.Mesh
    ['TTT-field-circle_2']: THREE.Mesh
    ['TTT-field-circle_3']: THREE.Mesh
    ['TTT-field-circle_4']: THREE.Mesh
    ['TTT-piece-circle']: THREE.Mesh
    ['TTT-piece-circle001']: THREE.Mesh
    Plane: THREE.Mesh
  }
  materials: {
    Ply_sides: THREE.MeshStandardMaterial
    Ply_top: THREE.MeshStandardMaterial
    Ply_sticks: THREE.MeshStandardMaterial
    Ply_edges: THREE.MeshStandardMaterial
    Light: THREE.MeshStandardMaterial
    ['Dark.001']: THREE.MeshPhysicalMaterial
  }
}

type ActionName = 'TTT-piece-circle.001Action'
type GLTFActions = Record<ActionName, THREE.AnimationAction>

type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

export function Model(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>()
  const { nodes, materials, animations } = useGLTF('/boardWithPieces-animation.gltf') as GLTFResult
  const { actions } = useAnimations<GLTFActions>(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="TTT-field-circle" position={[-0.001, 0.656, -0.003]} rotation={[Math.PI / 2, 0, 0]} scale={0.015}>
          <mesh name="TTT-field-circle_1" geometry={nodes['TTT-field-circle_1'].geometry} material={materials.Ply_sides} />
          <mesh name="TTT-field-circle_2" geometry={nodes['TTT-field-circle_2'].geometry} material={materials.Ply_top} />
          <mesh name="TTT-field-circle_3" geometry={nodes['TTT-field-circle_3'].geometry} material={materials.Ply_sticks} />
          <mesh name="TTT-field-circle_4" geometry={nodes['TTT-field-circle_4'].geometry} material={materials.Ply_edges} />
        </group>
        <mesh name="TTT-piece-circle" geometry={nodes['TTT-piece-circle'].geometry} material={materials.Light} position={[-0.471, 0.426, 0.466]} rotation={[Math.PI / 2, 0, 0]} scale={0.015} />
        <mesh name="TTT-piece-circle001" geometry={nodes['TTT-piece-circle001'].geometry} material={materials['Dark.001']} position={[0.469, 14.256, -0.472]} rotation={[Math.PI / 2, 0, 0]} scale={0.015} />
        <mesh name="Plane" geometry={nodes.Plane.geometry} material={nodes.Plane.material} position={[0, 0.279, 0]} scale={3.725} />
      </group>
    </group>
  )
}

useGLTF.preload('/boardWithPieces-animation.gltf')