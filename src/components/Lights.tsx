import React, { useEffect, useRef, useState } from 'react'
import { AmbientLight, DirectionalLight, DirectionalLightHelper, SpotLight, SpotLightHelper, PointLight, PointLightHelper } from "three";
import { CameraControls, Center, PerspectiveCamera, Sky, Stage, Stars, Text3D, useFont, Environment, useGLTF, useHelper, SoftShadows, MeshTransmissionMaterial } from '@react-three/drei'
import { useControls } from 'leva';
import { AmbientLightProps, DirectionalLightProps, SpotLightProps, PointLightProps } from '@react-three/fiber'

export const CAmbientLight: React.FC<AmbientLightProps> = (props) => {
    return (
        <ambientLight {...props}/>
    )
}

export const CDirectionalLight: React.FC<DirectionalLightProps> = ({ position, intensity }) => {
    const dirLight = useRef<DirectionalLight>(null);
    return (
        <>
            <directionalLight
                ref={dirLight}
                color={"#FFDDB5"}
                visible={true}
                position={position}
                intensity={intensity}
                castShadow={true}
                shadow-mapSize={[4096, 4096]}
            >
                <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
            </directionalLight>
        </>
    );
};

export const CSpotLight: React.FC<SpotLightProps> = (props) => {
    const spotLight = useRef<SpotLight>(null);

    return (
        <spotLight
            ref={spotLight}
            shadow-mapSize={[4096, 4096]}
            {...props}
        >

        </spotLight>
    );
};
