"use client"

import { Billboard, Line, useTexture } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import mascotRunning from "@/assets/brand/mascot-running.webp"

/**
 * ฉากหน้าแรก: สนามวิ่งจำลองขนาดเล็ก + น้องฮึบ
 * สนาม ต้นไม้ ซุ้ม START และนักวิ่งตัวเล็กเป็น 3D จริง ส่วนน้องฮึบเป็นภาพ 2D (billboard)
 * ถ้าได้โมเดล .glb ของน้องที่มีท่าวิ่งแล้ว ให้แทน <Mascot /> ด้วย useGLTF + useAnimations
 *
 * ไฟล์นี้โหลดแบบ lazy ผ่าน hero-visual.tsx เท่านั้น อย่า import ตรงจากหน้าอื่น
 */

const palette = {
  royal: "#124bc5",
  lane: "#2a63d8",
  navy: "#102a56",
  ice: "#eaf2ff",
  white: "#ffffff",
  gold: "#f3c65b",
  leaf: "#4cae4f",
  leafDark: "#2f8a3a",
  trunk: "#8a6a55",
  skin: "#f5d0b5",
}

/** วงรีของลู่วิ่ง (x = a·cosθ, z = b·sinθ) */
const track = {
  inner: { a: 3.3, b: 1.8 },
  outer: { a: 4.5, b: 2.8 },
}

const base = { a: 5.6, b: 3.9 }

export type HeroSceneProps = {
  paused: boolean
  onReady?: () => void
}

export default function HeroScene({ paused, onReady }: HeroSceneProps) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      frameloop={paused ? "demand" : "always"}
      camera={{ position: [0, 7.4, 11.8], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <LookAt target={[0, 0.8, 0.4]} />
      <hemisphereLight args={[palette.white, palette.ice, 1.4]} />
      <directionalLight
        position={[5, 9, 5]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0005}
      />
      <ParallaxGroup baseYaw={-0.42}>
        <Ground />
        <Track />
        <StartArch angle={-Math.PI * 0.12} />
        <Trees />
        <Flags />
        <Runners />
        <Clouds />
      </ParallaxGroup>
      {/* น้องอยู่นอกกลุ่มที่หมุน จะได้อยู่ด้านหน้ากลางเฟรมเสมอ */}
      <Suspense fallback={null}>
        <Mascot />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}

function LookAt({ target }: { target: [number, number, number] }) {
  const camera = useThree((s) => s.camera)
  useLayoutEffect(() => {
    camera.lookAt(...target)
  }, [camera, target])
  return null
}

/** เรียก onReady หลังภาพน้องโหลดเสร็จ (อยู่ใน Suspense เดียวกัน) เพื่อเฟดภาพสำรองออก */
function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.()
  }, [onReady])
  return null
}

/** เอียงฉากตามเมาส์/นิ้วเล็กน้อย */
function ParallaxGroup({ children, baseYaw }: { children: React.ReactNode; baseYaw: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state, delta) => {
    const group = ref.current
    if (!group) return
    const targetY =
      baseYaw + state.pointer.x * 0.12 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03
    const targetX = -state.pointer.y * 0.04
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 3, delta)
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 3, delta)
  })
  return (
    <group ref={ref} rotation-y={baseYaw}>
      {children}
    </group>
  )
}

function ellipseShape(a: number, b: number) {
  const shape = new THREE.Shape()
  shape.absellipse(0, 0, a, b, 0, Math.PI * 2, false, 0)
  return shape
}

function ellipsePoints(a: number, b: number, y: number, segments = 96) {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = (i / segments) * Math.PI * 2
    return new THREE.Vector3(a * Math.cos(t), y, b * Math.sin(t))
  })
}

function Ground() {
  const geometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(ellipseShape(base.a, base.b), {
        depth: 0.5,
        bevelEnabled: true,
        bevelSize: 0.2,
        bevelThickness: 0.2,
        bevelSegments: 4,
        curveSegments: 96,
      }),
    [],
  )
  const field = useMemo(
    () => new THREE.ShapeGeometry(ellipseShape(track.inner.a, track.inner.b), 96),
    [],
  )

  return (
    <group>
      <mesh geometry={geometry} rotation-x={-Math.PI / 2} position-y={-0.7} receiveShadow>
        <meshStandardMaterial color={palette.white} roughness={0.9} />
      </mesh>
      <mesh geometry={field} rotation-x={-Math.PI / 2} position-y={0.005} receiveShadow>
        <meshStandardMaterial color="#dff0d8" roughness={1} />
      </mesh>
    </group>
  )
}

function Track() {
  const geometry = useMemo(() => {
    const shape = ellipseShape(track.outer.a, track.outer.b)
    const hole = new THREE.Path()
    hole.absellipse(0, 0, track.inner.a, track.inner.b, 0, Math.PI * 2, true, 0)
    shape.holes.push(hole)
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: false,
      curveSegments: 128,
    })
  }, [])

  const lanes = useMemo(
    () =>
      [0.25, 0.5, 0.75].map((f) =>
        ellipsePoints(
          track.inner.a + (track.outer.a - track.inner.a) * f,
          track.inner.b + (track.outer.b - track.inner.b) * f,
          0.125,
        ),
      ),
    [],
  )

  return (
    <group>
      <mesh geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow>
        <meshStandardMaterial color={palette.lane} roughness={0.7} />
      </mesh>
      {lanes.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={palette.white}
          lineWidth={1.4}
          transparent
          opacity={0.8}
        />
      ))}
    </group>
  )
}

function useStartTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = palette.royal
    ctx.fillRect(0, 0, 512, 128)
    ctx.fillStyle = palette.white
    ctx.font = "italic 800 84px system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("START", 256, 68)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

/** ซุ้ม START คร่อมลู่ที่มุม angle */
function StartArch({ angle }: { angle: number }) {
  const texture = useStartTexture()
  const inner = new THREE.Vector3(
    (track.inner.a - 0.1) * Math.cos(angle),
    0,
    (track.inner.b - 0.1) * Math.sin(angle),
  )
  const outer = new THREE.Vector3(
    (track.outer.a + 0.1) * Math.cos(angle),
    0,
    (track.outer.b + 0.1) * Math.sin(angle),
  )
  const mid = inner.clone().add(outer).multiplyScalar(0.5)
  const span = inner.distanceTo(outer)
  const rotationY = -Math.atan2(outer.z - inner.z, outer.x - inner.x)
  const height = 1.25

  return (
    <group position={[mid.x, 0, mid.z]} rotation-y={rotationY}>
      {[-span / 2, span / 2].map((x) => (
        <mesh key={x} position={[x, height / 2, 0]} castShadow>
          <boxGeometry args={[0.18, height, 0.22]} />
          <meshStandardMaterial color={palette.royal} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.1, 0]} castShadow>
        <boxGeometry args={[span + 0.3, 0.36, 0.24]} />
        <meshStandardMaterial color={palette.royal} roughness={0.6} />
      </mesh>
      {[0.125, -0.125].map((z) => (
        <mesh key={z} position={[0, height + 0.1, z]} rotation-y={z > 0 ? 0 : Math.PI}>
          <planeGeometry args={[span * 0.8, (span * 0.8) / 4]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** สุ่มแบบกำหนดผลได้ ให้ฉากเหมือนเดิมทุกครั้ง */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function Trees() {
  const trees = useMemo(() => {
    const rand = seeded(7)
    const list: { x: number; z: number; scale: number }[] = []
    // รอบนอกสนาม
    for (let i = 0; i < 22; i++) {
      const t = rand() * Math.PI * 2
      const f = 1.08 + rand() * 0.12
      list.push({
        x: base.a * 0.93 * Math.cos(t) * (f / 1.2),
        z: base.b * 0.93 * Math.sin(t) * (f / 1.2),
        scale: 0.7 + rand() * 0.5,
      })
    }
    // ในสนาม
    for (let i = 0; i < 9; i++) {
      const t = rand() * Math.PI * 2
      const r = 0.25 + rand() * 0.55
      list.push({
        x: track.inner.a * r * Math.cos(t),
        z: track.inner.b * r * Math.sin(t),
        scale: 0.6 + rand() * 0.4,
      })
    }
    return list
  }, [])

  return (
    <group>
      {trees.map(({ x, z, scale }, i) => (
        <group key={i} position={[x, 0, z]} scale={scale}>
          <mesh position-y={0.15} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.3, 6]} />
            <meshStandardMaterial color={palette.trunk} />
          </mesh>
          <mesh position-y={0.48} castShadow>
            <icosahedronGeometry args={[0.28, 1]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? palette.leafDark : palette.leaf}
              roughness={0.8}
              flatShading
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Flags() {
  const flags = useMemo(
    () =>
      [0.35, 0.62, 0.9, 1.15, 1.45, 1.75].map((k, i) => {
        const t = k * Math.PI
        return {
          x: (track.outer.a + 0.35) * Math.cos(t),
          z: (track.outer.b + 0.35) * Math.sin(t),
          color: i % 3 === 2 ? palette.gold : palette.royal,
        }
      }),
    [],
  )
  return (
    <group>
      {flags.map(({ x, z, color }, i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={0.45} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
            <meshStandardMaterial color={palette.navy} />
          </mesh>
          <mesh position={[0.12, 0.72, 0]}>
            <boxGeometry args={[0.22, 0.32, 0.02]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Runners() {
  const runners = useMemo(() => {
    const rand = seeded(42)
    const shirts = [palette.royal, palette.white, palette.gold, palette.navy]
    return Array.from({ length: 12 }, (_, i) => ({
      lane: 0.15 + rand() * 0.7,
      phase: rand() * Math.PI * 2,
      speed: 0.12 + rand() * 0.08,
      shirt: shirts[i % shirts.length],
    }))
  }, [])
  const refs = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    runners.forEach((runner, i) => {
      const group = refs.current[i]
      if (!group) return
      const a = track.inner.a + (track.outer.a - track.inner.a) * runner.lane
      const b = track.inner.b + (track.outer.b - track.inner.b) * runner.lane
      const t = runner.phase + time * runner.speed
      group.position.set(
        a * Math.cos(t),
        0.12 + Math.abs(Math.sin(time * 9 + i)) * 0.04,
        b * Math.sin(t),
      )
      group.rotation.y = -Math.atan2(b * Math.cos(t), -a * Math.sin(t)) + Math.PI / 2
    })
  })

  return (
    <group>
      {runners.map((runner, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <mesh position-y={0.16} castShadow>
            <capsuleGeometry args={[0.06, 0.14, 4, 8]} />
            <meshStandardMaterial color={runner.shirt} roughness={0.7} />
          </mesh>
          <mesh position-y={0.36} castShadow>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color={palette.skin} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Clouds() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.6
  })
  const clouds: [number, number, number][] = [
    [-3.5, 3.2, -3.5],
    [2.5, 3.6, -4.5],
    [4.8, 2.6, -1.5],
  ]
  return (
    <group ref={ref}>
      {clouds.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {[
            [0, 0, 0, 0.42],
            [0.42, -0.08, 0.05, 0.3],
            [-0.4, -0.1, 0, 0.28],
          ].map(([cx, cy, cz, r], j) => (
            <mesh key={j} position={[cx, cy, cz]}>
              <sphereGeometry args={[r, 16, 16]} />
              <meshStandardMaterial color={palette.white} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** น้องฮึบ (ภาพ 2D หันหาเสมอ) วิ่งอยู่กับที่ด้านหน้าฉาก */
function Mascot() {
  const texture = useTexture(mascotRunning.src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
  })
  const body = useRef<THREE.Group>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const height = 3.8
  const width = height * (mascotRunning.width / mascotRunning.height)

  useFrame((state) => {
    const step = Math.sin(state.clock.elapsedTime * 7)
    const lift = Math.abs(step) * 0.14
    if (body.current) {
      body.current.position.y = height / 2 + lift
      body.current.rotation.z = step * 0.035
    }
    if (shadow.current) {
      const s = 1 - lift * 1.5
      shadow.current.scale.set(s, s, s)
    }
  })

  return (
    <group position={[-1.1, 0.12, 3.3]}>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position-y={0.01} scale-z={0.4}>
        <circleGeometry args={[0.75, 32]} />
        <meshBasicMaterial color={palette.navy} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <Billboard lockX lockZ>
        <group ref={body}>
          <mesh>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={texture} transparent alphaTest={0.4} toneMapped={false} />
          </mesh>
        </group>
      </Billboard>
    </group>
  )
}
