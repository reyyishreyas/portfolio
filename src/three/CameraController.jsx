import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { journeyState, pathAt } from './journey';
import { groundHeight } from './utils';

const START_Z = 17.9;
const INTRO_SECONDS = 5;
const EYE_HEIGHT = 1.7;

/**
 * Human-height camera driven by the scroll journey. Three layers stack
 * up: the path position (scrubbed by scroll, exponentially smoothed so
 * fast scrolling still glides), an entry push that fades out the moment
 * the visitor scrolls, and micro life on top — breathing bob, idle head
 * drift, cursor parallax.
 *
 * @returns {null}
 */
export default function CameraController() {
  const startRef = useRef(null);
  const posRef = useRef({ x: 0, y: EYE_HEIGHT, z: START_Z });
  const yawRef = useRef(0);
  const smoothed = useRef({ yaw: 0, pitch: 0 });

  useFrame((state, delta) => {
    const cam = state.camera;
    if (cam.rotation.order !== 'YXZ') cam.rotation.order = 'YXZ';

    const t = state.clock.elapsedTime;
    if (startRef.current === null) startRef.current = t;
    const intro = Math.min(1, (t - startRef.current) / INTRO_SECONDS);
    const introEase = 0.5 - 0.5 * Math.cos(Math.PI * intro);

    const p = journeyState.progress;
    const target = pathAt(p);

    // entry push: START_Z → path start, forgotten once the walk begins
    const scrollFade = Math.max(0, 1 - p * 33);
    const targetZ = target.z + (START_Z - 16) * (1 - introEase) * scrollFade;
    const targetY = groundHeight(target.x, targetZ) + EYE_HEIGHT;

    // glide toward the scrubbed target: scroll steps, camera doesn't
    const k = 1 - Math.exp(-delta * 5);
    posRef.current.x += (target.x - posRef.current.x) * k;
    posRef.current.y += (targetY - posRef.current.y) * k;
    posRef.current.z += (targetZ - posRef.current.z) * k;

    // face along the path: tangent of two nearby samples
    const a = pathAt(p);
    const b = pathAt(p + 0.012);
    const pathYaw = Math.atan2(-(b.x - a.x), -(b.z - a.z));
    const ky = 1 - Math.exp(-delta * 4);
    yawRef.current += (pathYaw - yawRef.current) * ky;

    // cursor parallax, eased so it never snaps — strong enough that the
    // world visibly swings with the pointer, like looking around in a game
    const kp = 1 - Math.exp(-delta * 3.2);
    smoothed.current.yaw += (-state.pointer.x * 0.1 - smoothed.current.yaw) * kp;
    smoothed.current.pitch += (state.pointer.y * 0.06 - smoothed.current.pitch) * kp;

    const swayX = Math.sin(t * 0.31) * 0.06;
    const bobY = Math.sin(t * 0.9) * 0.025 + Math.sin(t * 0.23) * 0.02;
    const idleYaw = Math.sin(t * 0.23) * 0.015;
    const introYaw = (1 - introEase) * 0.06;

    cam.position.set(
      posRef.current.x + swayX,
      posRef.current.y + bobY,
      posRef.current.z
    );
    cam.rotation.set(
      smoothed.current.pitch,
      yawRef.current + smoothed.current.yaw + idleYaw + introYaw,
      0
    );
    if (import.meta.env.DEV) {
      journeyState.cam = cam.position.z;
      journeyState.yaw = cam.rotation.y;
    }
  });

  return null;
}
