import React, { useEffect, useRef, useState } from 'react'
import { AmbientLight, DirectionalLight, DirectionalLightHelper, SpotLight, SpotLightHelper, PointLight, PointLightHelper } from "three";
import { CameraControls, Center, PerspectiveCamera, Sky, Stage, Stars, Text3D, useFont, Environment, useGLTF, useHelper, SoftShadows, MeshTransmissionMaterial } from '@react-three/drei'
import { useControls } from 'leva';

export const CAmbientLight: React.FC<any> = (props) => {
    // const ambLight = useRef<AmbientLight>(null);
    // const ambCtl = useControls(`Ambient Light ${props.id || 1}`, {
    //     visible: props.visible,
    //     color: props.color,
    //     intensity: props.intensity,
    // });
    return (
        <ambientLight {...props}
            // ref={ambLight}
            // intensity={ambCtl.intensity}
            // color={ambCtl.color}
            // visible={ambCtl.visible}
        />
    )
}

export const CDirectionalLight: React.FC<any> = ({ position, intensity }) => {
    const dirLight = useRef<DirectionalLight>(null);
    return (
        <>
            <directionalLight
                ref={dirLight}
                color={"#FFDDB5"}
                visible={true}
                position={[
                    position.x,
                    position.y,
                    position.z,
                ]}
                intensity={intensity}
                castShadow={true}
                shadow-mapSize={[4096, 4096]}
            >
                <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
            </directionalLight>
        </>
    );
};

export const CSpotLight: React.FC<any> = (props) => {
    const spotLight = useRef<SpotLight>(null);
    //@ts-ignore
    // useHelper(spotLight, SpotLightHelper, "red");
    const spotCtl = useControls(`Spot Light ${props.id}`, {
        visible: props.visible,
        position: {
            x: props.position.x,
            y: props.position.y,
            z: props.position.z,
        },
        color: props.color,
        intensity: props.intensity,
        castShadow: props.castShadow,
    });

    return (
        <spotLight
            ref={spotLight}
            color={spotCtl.color}
            position={[
                spotCtl.position.x,
                spotCtl.position.y,
                spotCtl.position.z,
            ]}
            visible={spotCtl.visible}
            intensity={spotCtl.intensity}
            castShadow={spotCtl.castShadow}
            shadow-mapSize={[4096, 4096]}
        >

        </spotLight>
    );
};

export const CPointLight = () => {
    const pointLight = useRef<PointLight>(null);
    //@ts-ignore
    useHelper(pointLight, PointLightHelper, "red");
    const pointCtl = useControls('Point Light', {
        visible: true,
        position: {
            x: 1.9,
            y: 2.7,
            z: -10.7,
        },
        color: "#FFDDB5",
        intensity: 500,
        castShadow: true,
    });

    return (
        <>
            <pointLight
                color={pointCtl.color}
                ref={pointLight}
                visible={pointCtl.visible}
                position={[
                    pointCtl.position.x,
                    pointCtl.position.y,
                    pointCtl.position.z,
                ]}
                intensity={pointCtl.intensity}
            />
        </>
    );
}