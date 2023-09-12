import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React, { useCallback } from "react";
import * as THREE from 'three';
import { CameraControls, Center, PerspectiveCamera, Stage, Stars, Text3D, useFont, Environment, useGLTF, useHelper, SoftShadows, MeshTransmissionMaterial, BakeShadows } from '@react-three/drei'

import { api } from "~/utils/api";
import { Canvas } from '@react-three/fiber'
import { BoardWithPieces } from "~/components/BoardWithPieces";
import { BoardSelections } from "~/components/BoardSelections";
import { Piece } from "~/components/Piece";

import { CSpotLight, CAmbientLight } from "~/components/Lights";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen bg-gradient-to-b from-yellow-500 to-orange-900">
        <div className="w-screen h-screen">
          <Scene/>
        </div>
      </main>
    </>
  );
}

const Scene: React.FC = () => {
  const playerTurnRef = React.useRef<boolean>(true);
  const [gameState, setGameState] = React.useState<{playerTurn: boolean, board: number[][][]}>({
    playerTurn: true,
    board: [
    [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
    [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
    [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
    [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
  ]});

  const addPiece = (positionVector: THREE.Vector2) => {
    setGameState((prevState) => {
      const newState = JSON.parse(JSON.stringify(prevState));
      const pieceHeight = newState.board[positionVector.x][positionVector.y].filter((piece) => piece !== 0).length;
      if (pieceHeight > 3) return prevState;
      newState.board[positionVector.x][positionVector.y][pieceHeight] = !prevState.playerTurn ? 1 : 2;
      newState.playerTurn = !prevState.playerTurn;
      return newState;
    });
  }

  return (
    <Canvas shadows>
      <CSpotLight 
        id={1}
        position={{
          x: 3,
          y: 6,
          z: 3,
        }}
        visible={true}
        color={"#FFDDB5"}
        intensity={100}
        castShadow={true}
      />
      <CSpotLight
        id={2}
        position={{
          x: -3,
          y: 6,
          z: 3,
        }}
        visible={true}
        color={"#FFDDB5"}
        intensity={100}
        castShadow={true}
      />
      <CAmbientLight
        color={"#FFDDB5"}
        intensity={0.5}
      />

      {/* <PerspectiveCamera
        makeDefault
        position={[0, 0.8, 5]}
        fov={75}
        aspect={2}
        near={0.1}
        far={1000}
      /> */}
      <CameraControls/>
      <React.Suspense fallback={null}>
        <BoardWithPieces/>
        {
          gameState.board.map((row, i) => {
            return row.map((col, j) => {
              return col.map((piece, k) => {
                // 0 - empty, 1 - light, 2 - dark
                if (piece == 0) return (<></>);
                return <Piece height={k} pos={new THREE.Vector2(i, j)} isDark={piece == 2}/>
              });
            })
          })
        }
        <SoftShadows size={60} samples={8} focus={0.5}/>
        {/* <BakeShadows /> */}
        <BoardSelections addPiece={(positionVector: THREE.Vector2) => addPiece(positionVector)}/>
      </React.Suspense>
    </Canvas>
  )
}

