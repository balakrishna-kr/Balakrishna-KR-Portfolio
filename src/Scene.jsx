import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// Scroll keyframes for the hero object: [progress, x, y, z, scale]
const desk = [[0, 2.3, 0.1, 0, 1], [0.18, -2.6, -0.2, -1, 0.8], [0.4, 2.8, 0.3, -2, 0.65], [0.7, 0, 0, -3, 0.5], [1, 0, -0.3, 0, 1.1]]
const mob = [[0, 1.4, -0.4, -4, 0.5], [0.3, 1.2, 0, -2, 0.55], [0.7, -1, 0, -3, 0.45], [1, 0, 0, -1, 0.8]]

function sample(keys, p) {
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1]
    if (p <= b[0]) {
      const t = THREE.MathUtils.smootherstep(p, a[0], b[0])
      return a.map((v, k) => v + (b[k] - v) * t)
    }
  }
  return keys[keys.length - 1]
}

function Monolith({ scroll, mobile, light }) {
  const g = useRef(), shell = useRef(), core = useRef()
  const coreC = useMemo(() => new THREE.Color(), []), wireC = useMemo(() => new THREE.Color(), [])
  useFrame((s, d) => {
    const p = scroll.get()
    const [, x, y, z, sc] = sample(mobile ? mob : desk, p)
    g.current.position.lerp(new THREE.Vector3(x, y, z), 0.08)
    // hidden over the hero; grows in once the About section comes into view
    const show = THREE.MathUtils.smoothstep(window.scrollY, window.innerHeight * 0.45, window.innerHeight * 0.95)
    g.current.scale.setScalar(THREE.MathUtils.lerp(g.current.scale.x, sc * show, 0.08))
    g.current.visible = g.current.scale.x > 0.002
    g.current.rotation.y = p * Math.PI * 4 + s.pointer.x * 0.4
    g.current.rotation.x = p * Math.PI * 1.5 - s.pointer.y * 0.3
    core.current.rotation.z += d * 0.2
    shell.current.rotation.y -= d * 0.1
    shell.current.rotation.x += d * 0.05
    // ease materials toward the current page background
    core.current.material.color.lerp(coreC.set(light ? '#c6c6c6' : '#d8d8d8'), 0.06)
    shell.current.material.color.lerp(wireC.set(light ? '#141414' : '#ffffff'), 0.06)
    shell.current.material.opacity = THREE.MathUtils.lerp(shell.current.material.opacity, light ? 0.22 : 0.12, 0.06)
  })
  return (
    <group ref={g} scale={0}>
      <Float speed={1.4} floatIntensity={0.6} rotationIntensity={0.3}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color="#d8d8d8" metalness={1} roughness={0.08} clearcoat={1} flatShading />
        </mesh>
        <mesh ref={shell} scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.12} />
        </mesh>
      </Float>
    </group>
  )
}

// Slow dust field that drifts upward with scroll
// Soft round sprite for particles
function useDot() {
  return useMemo(() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64
    const x = cv.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.beginPath(); x.arc(32, 32, 32, 0, Math.PI * 2); x.fill()
    return new THREE.CanvasTexture(cv)
  }, [])
}

function Dust({ scroll, count, light }) {
  const ref = useRef(), col = useMemo(() => new THREE.Color(), []), dot = useDot()
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - 0.5) * 18; a[i * 3 + 1] = (Math.random() - 0.5) * 30; a[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2 }
    return a
  }, [count])
  useFrame((s) => {
    ref.current.position.y = scroll.get() * 14
    ref.current.rotation.y = s.clock.elapsedTime * 0.01
    ref.current.material.color.lerp(col.set(light ? '#141414' : '#ffffff'), 0.06)
  })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial map={dot} color="#ffffff" size={0.04} transparent opacity={0.6} alphaTest={0.01} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function Rig({ light }) {
  const fogC = useMemo(() => new THREE.Color(), [])
  useFrame((s) => {
    s.scene.fog?.color.lerp(fogC.set(light ? '#ece8e1' : '#0a0a0a'), 0.06)
    s.camera.position.x = THREE.MathUtils.lerp(s.camera.position.x, s.pointer.x * 0.3, 0.03)
    s.camera.position.y = THREE.MathUtils.lerp(s.camera.position.y, s.pointer.y * 0.2, 0.03)
    s.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene({ scroll, mobile, light }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 7], fov: 40 }} dpr={[1, 1.5]} eventSource={document.body} eventPrefix="client">
        <fog attach="fog" args={['#0a0a0a', 6, 14]} />
        <directionalLight position={[3, 4, 5]} intensity={2.5} />
        <directionalLight position={[-4, -2, 2]} intensity={0.6} />
        <Environment preset="studio" />
        <Rig light={light} />
        <Monolith scroll={scroll} mobile={mobile} light={light} />
        <Dust scroll={scroll} count={mobile ? 1100 : 2600} light={light} />
      </Canvas>
    </div>
  )
}
