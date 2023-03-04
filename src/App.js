import React, { useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import "./styles.css";
import { useSphere, Physics, usePlane } from "@react-three/cannon";
import useKeyboardControls from "./useKeyboardControls";
import { Vector3 } from "three";

const SPEED = 6;

export function Person(props) {
  const { camera } = useThree();
  const { forward, backward, left, right, jump } = useKeyboardControls();

  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: "Dynamic",
    ...props
  }));

  const velocity = React.useRef([0, 0, -5]);
  useEffect(() => {
    api.velocity.subscribe((v) => (velocity.current = v));
  }, [api.velocity]);

  useFrame(() => {
    const { x, y, z } = ref.current.position;
    const newPosition = { ...ref.current.position, x: x, y: y + 6, z: z + 5 };
    camera.position.copy(newPosition);
    const direction = new Vector3();
    // console.log(ref.current.position.getPositionFromMatrix());

    // console.log("frame", ref.current.position);

    const frontVector = new Vector3(0, 0, Number(backward) - Number(forward));
    const sideVector = new Vector3(Number(left) - Number(right), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);

    api.velocity.set(direction.x, velocity.current[1], direction.z);
    ref.current.getWorldPosition(ref.current.position);
  });

  return (
    <>
      <mesh ref={ref}>
        <boxBufferGeometry />
        <meshPhongMaterial color="royalblue" />
      </mesh>
    </>
  );
}
function Plane(props) {
  const [ref] = usePlane(() => ({ mass: 0, ...props }));
  return (
    <mesh ref={ref} receiveShadow>
      <color attach="background" args={["red"]} />

      <planeGeometry args={[25, 25]} />
      <meshStandardMaterial />
    </mesh>
  );
}
function MyRotatingBox() {
  const myMesh = React.useRef();

  useFrame(({ clock, keyboard }) => {
    // console.log(keyboard);
    const a = clock.getElapsedTime();
    myMesh.current.rotation.x = a;
  });

  return (
    <mesh ref={myMesh}>
      <boxBufferGeometry />
      <meshPhongMaterial color="royalblue" />
    </mesh>
  );
}

export default function App() {
  return (
    <div className="App">
      <Canvas camera={{ position: [0, 3, 4], fov: 55 }}>
        <Physics>
          <color attach="background" args={["lightblue"]} />
          <ambientLight intensity={0.1} />
          <directionalLight />
          {/* <MyRotatingBox /> */}
          <Person position={[0, 3, 1]} />
          <Plane rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} />
        </Physics>
      </Canvas>
    </div>
  );
}
