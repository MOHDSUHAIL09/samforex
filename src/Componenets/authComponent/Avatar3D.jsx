import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { THEME_CONFIGS } from './themes';
import {
  generateStudioEnvironment,
  createIrisCanvasTexture,
} from './avatarTextures';
import { playSuccessChime } from './sound';

export default function Avatar3D({ mood, theme, onMascotClick }) {
  const mountRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mutable refs to keep animation loop decoupled from React render cycle
  const moodRef = useRef(mood);
  const themeRef = useRef(theme);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Track cursor position in normalized coordinates (-1 to 1)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Three.js 3D WebGL Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Environment Map for photorealistic specular highlights on glossy black armor
    const studioEnvMap = generateStudioEnvironment(renderer);
    scene.environment = studioEnvMap;

    // 2. Multi-Point Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    // Key Light: creates sleek white specular reflections on top/side curves of black helmet
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(3.5, 4.8, 4.0);
    scene.add(keyLight);

    // Fill Light: soft cool blue from left
    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 1.6);
    fillLight.position.set(-4.0, 3.0, 3.0);
    scene.add(fillLight);

    // Theme colored Rim Light for glowing silhouette contour
    const themeColor = new THREE.Color(THEME_CONFIGS[themeRef.current].primaryColor);
    const rimLight = new THREE.PointLight(themeColor, 5.5, 16);
    rimLight.position.set(0, 3.8, -2.5);
    scene.add(rimLight);

    // Front Eye & Reactor Glow Point Light
    const glowPointLight = new THREE.PointLight(themeColor, 3.2, 5);
    glowPointLight.position.set(0, 0.2, 1.8);
    scene.add(glowPointLight);

    // 3. Materials
    // A. Glossy Obsidian Black Ceramic Armor
    const blackArmorMat = new THREE.MeshPhysicalMaterial({
      color: 0x070a12,
      roughness: 0.06,
      metalness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 1.6,
    });

    // B. Dark Obsidian Visor Glass (seamless front screen)
    const blackVisorMat = new THREE.MeshPhysicalMaterial({
      color: 0x020307,
      roughness: 0.03,
      metalness: 0.35,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.8,
    });

    // C. Internal Dark Joint / Mechanical Matte Material
    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.45,
      metalness: 0.8,
    });

    // D. Polished Chrome Trims
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.1,
      metalness: 0.95,
    });

    // E. Glowing Electric Cyan Emissive Material (Core lights)
    const emissiveGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
    });

    // F. White-Hot Emissive Core Material
    const whiteCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    // 4. Clean Space Ambient Particles (NO wireframe lattice/ribbon!)
    const spaceParticlesGroup = new THREE.Group();
    scene.add(spaceParticlesGroup);

    const particleCount = 60;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = -0.5 - Math.random() * 3.5;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.036,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    spaceParticlesGroup.add(particles);

    // 5. Robot Root Group
    const robotRoot = new THREE.Group();
    robotRoot.position.set(0, 0.0, 0);
    scene.add(robotRoot);

    // Soft Contact Floor Shadow
    const shadowGeo = new THREE.PlaneGeometry(2.4, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.30,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.92, 0);
    robotRoot.add(shadowMesh);

    // -------------------------------------------------------------
    // TORSO & CHEST ARC REACTOR: `( O )`
    // Positioned cleanly below the chin so the entire body is visible!
    // -------------------------------------------------------------
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, -0.38, 0);
    robotRoot.add(torsoGroup);

    // Torso Glossy Black Shell
    const torsoGeo = new THREE.CylinderGeometry(0.56, 0.65, 0.74, 36);
    const torsoMesh = new THREE.Mesh(torsoGeo, blackArmorMat);
    torsoMesh.scale.set(1.05, 1.0, 0.88);
    torsoGroup.add(torsoMesh);

    // Lower Waist Disc
    const waistDiscGeo = new THREE.CylinderGeometry(0.60, 0.64, 0.12, 36);
    const waistDisc = new THREE.Mesh(waistDiscGeo, darkJointMat);
    waistDisc.position.set(0, -0.37, 0);
    torsoGroup.add(waistDisc);

    // CHEST ARC REACTOR: `( O )`
    const chestReactorGroup = new THREE.Group();
    chestReactorGroup.position.set(0, 0.05, 0.35);
    torsoGroup.add(chestReactorGroup);

    // Center Circular Glowing Core `O`
    const coreDiscGeo = new THREE.CircleGeometry(0.17, 32);
    const coreDisc = new THREE.Mesh(coreDiscGeo, emissiveGlowMat);
    chestReactorGroup.add(coreDisc);

    // Center Inner White Core
    const coreInnerGeo = new THREE.CircleGeometry(0.08, 28);
    const coreInner = new THREE.Mesh(coreInnerGeo, whiteCoreMat);
    coreInner.position.set(0, 0, 0.002);
    chestReactorGroup.add(coreInner);

    // Chrome Bezel Collar around Core
    const coreCollarGeo = new THREE.TorusGeometry(0.175, 0.014, 16, 36);
    const coreCollar = new THREE.Mesh(coreCollarGeo, chromeMat);
    chestReactorGroup.add(coreCollar);

    // Left Glowing Cyan Crescent Arc `(`
    const leftArcGeo = new THREE.TorusGeometry(0.26, 0.020, 16, 32, Math.PI * 0.72);
    const leftArc = new THREE.Mesh(leftArcGeo, emissiveGlowMat);
    leftArc.rotation.z = Math.PI * 0.64;
    chestReactorGroup.add(leftArc);

    // Right Glowing Cyan Crescent Arc `)`
    const rightArcGeo = new THREE.TorusGeometry(0.26, 0.020, 16, 32, Math.PI * 0.72);
    const rightArc = new THREE.Mesh(rightArcGeo, emissiveGlowMat);
    rightArc.rotation.z = -Math.PI * 0.36;
    chestReactorGroup.add(rightArc);

    // -------------------------------------------------------------
    // NECK (Joint between Torso and Head)
    // -------------------------------------------------------------
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.40, 0);
    torsoGroup.add(neckGroup);

    const neckRingGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.14, 28);
    const neckRing = new THREE.Mesh(neckRingGeo, darkJointMat);
    neckGroup.add(neckRing);

    // -------------------------------------------------------------
    // HEAD GROUP (Cute Oval Glossy Black Helmet + Antenna + Visor)
    // -------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.46, 0);
    neckGroup.add(headGroup);

    // Main Oval Helmet: Chubby, wide horizontal pebble shape
    const headGeo = new THREE.SphereGeometry(0.96, 64, 48);
    const headMesh = new THREE.Mesh(headGeo, blackArmorMat);
    headMesh.scale.set(1.24, 0.92, 1.02); // Exact cute proportions from reference image!
    headGroup.add(headMesh);

    // Seamless Obsidian Front Visor Faceplate
    const visorGeo = new THREE.SphereGeometry(0.94, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.46);
    visorGeo.rotateX(Math.PI / 2);
    const visorMesh = new THREE.Mesh(visorGeo, blackVisorMat);
    visorMesh.scale.set(1.22, 0.90, 0.50);
    visorMesh.position.set(0, 0.02, 0.50);
    headGroup.add(visorMesh);

    // -------------------------------------------------------------
    // TOP ANTENNA (Signature feature with glowing cyan beacon)
    // -------------------------------------------------------------
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0, 0.88, 0);
    headGroup.add(antennaGroup);

    // Base Collar
    const antennaCollarGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.05, 20);
    const antennaCollar = new THREE.Mesh(antennaCollarGeo, darkJointMat);
    antennaGroup.add(antennaCollar);

    // Slender Vertical Stalk
    const antennaStalkGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.34, 16);
    antennaStalkGeo.translate(0, 0.17, 0);
    const antennaStalk = new THREE.Mesh(antennaStalkGeo, darkJointMat);
    antennaGroup.add(antennaStalk);

    // Glowing Neon Cyan Beacon Ball on top
    const antennaBeaconGeo = new THREE.SphereGeometry(0.13, 32, 32);
    antennaBeaconGeo.translate(0, 0.36, 0);
    const antennaBeacon = new THREE.Mesh(antennaBeaconGeo, emissiveGlowMat);
    antennaGroup.add(antennaBeacon);

    // Local light from beacon
    const beaconLight = new THREE.PointLight(themeColor, 1.4, 3);
    beaconLight.position.set(0, 0.36, 0);
    antennaGroup.add(beaconLight);

    // -------------------------------------------------------------
    // EAR PODS (Left & Right cylindrical ear cups with glowing neon cyan rings)
    // -------------------------------------------------------------
    const earGroupLeft = new THREE.Group();
    earGroupLeft.position.set(-1.24, 0.06, 0);
    earGroupLeft.rotation.z = Math.PI / 2;
    headGroup.add(earGroupLeft);

    const earBaseGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.20, 32);
    const earBaseLeft = new THREE.Mesh(earBaseGeo, blackArmorMat);
    earGroupLeft.add(earBaseLeft);

    const earCapLeft = new THREE.Mesh(new THREE.CircleGeometry(0.26, 32), darkJointMat);
    earCapLeft.position.set(0, 0.102, 0);
    earCapLeft.rotation.x = -Math.PI / 2;
    earGroupLeft.add(earCapLeft);

    const earRingGeo = new THREE.TorusGeometry(0.26, 0.020, 16, 36);
    earRingGeo.rotateX(Math.PI / 2);
    const earRingLeft = new THREE.Mesh(earRingGeo, emissiveGlowMat);
    earRingLeft.position.set(0, 0.105, 0);
    earGroupLeft.add(earRingLeft);

    // Right Ear Pod
    const earGroupRight = new THREE.Group();
    earGroupRight.position.set(1.24, 0.06, 0);
    earGroupRight.rotation.z = -Math.PI / 2;
    headGroup.add(earGroupRight);

    const earBaseRight = new THREE.Mesh(earBaseGeo, blackArmorMat);
    earGroupRight.add(earBaseRight);

    const earCapRight = new THREE.Mesh(new THREE.CircleGeometry(0.26, 32), darkJointMat);
    earCapRight.position.set(0, 0.102, 0);
    earCapRight.rotation.x = -Math.PI / 2;
    earGroupRight.add(earCapRight);

    const earRingRight = new THREE.Mesh(earRingGeo, emissiveGlowMat);
    earRingRight.position.set(0, 0.105, 0);
    earGroupRight.add(earRingRight);

    // -------------------------------------------------------------
    // EYES HOLDER (Two glowing cyan capsule/pill eyes)
    // -------------------------------------------------------------
    const eyesHolder = new THREE.Group();
    eyesHolder.position.set(0, 0.08, 0.95);
    headGroup.add(eyesHolder);

    // LEFT EYE (Stays cute/winking during password show)
    const leftEyeRoot = new THREE.Group();
    leftEyeRoot.position.set(-0.38, 0, 0);
    leftEyeRoot.rotation.z = 0.08; // cute inward slant

    const leftCapsuleGeo = new THREE.CapsuleGeometry(0.105, 0.22, 16, 24);
    leftCapsuleGeo.rotateZ(Math.PI / 2);
    const leftPillMesh = new THREE.Mesh(leftCapsuleGeo, emissiveGlowMat);
    leftEyeRoot.add(leftPillMesh);

    const leftInnerCapsuleGeo = new THREE.CapsuleGeometry(0.055, 0.16, 12, 16);
    leftInnerCapsuleGeo.rotateZ(Math.PI / 2);
    const leftInnerCore = new THREE.Mesh(leftInnerCapsuleGeo, whiteCoreMat);
    leftInnerCore.position.set(0, 0, 0.025);
    leftEyeRoot.add(leftInnerCore);

    // Soft pill-shaped curved glow (capsule geometry so NO square box artifacts!)
    const haloCapsuleGeo = new THREE.CapsuleGeometry(0.125, 0.24, 12, 16);
    haloCapsuleGeo.rotateZ(Math.PI / 2);
    const leftHaloMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const leftHaloMesh = new THREE.Mesh(haloCapsuleGeo, leftHaloMat);
    leftHaloMesh.position.set(0, 0, -0.005);
    leftEyeRoot.add(leftHaloMesh);
    eyesHolder.add(leftEyeRoot);

    // RIGHT EYE (Normal Cyan Pill)
    const rightEyeRoot = new THREE.Group();
    rightEyeRoot.position.set(0.38, 0, 0);
    rightEyeRoot.rotation.z = -0.08; // cute inward slant

    const rightCapsuleGeo = new THREE.CapsuleGeometry(0.105, 0.22, 16, 24);
    rightCapsuleGeo.rotateZ(Math.PI / 2);
    const rightPillMesh = new THREE.Mesh(rightCapsuleGeo, emissiveGlowMat);
    rightEyeRoot.add(rightPillMesh);

    const rightInnerCapsuleGeo = new THREE.CapsuleGeometry(0.055, 0.16, 12, 16);
    rightInnerCapsuleGeo.rotateZ(Math.PI / 2);
    const rightInnerCore = new THREE.Mesh(rightInnerCapsuleGeo, whiteCoreMat);
    rightInnerCore.position.set(0, 0, 0.025);
    rightEyeRoot.add(rightInnerCore);

    const rightHaloMat = leftHaloMat.clone();
    const rightHaloMesh = new THREE.Mesh(haloCapsuleGeo, rightHaloMat);
    rightHaloMesh.position.set(0, 0, -0.005);
    rightEyeRoot.add(rightHaloMesh);
    eyesHolder.add(rightEyeRoot);

    // -------------------------------------------------------------
    // ONE EXTENDING TELESCOPING EYE ("Password show kare to EK eye bahar nikal kar aaye")
    // Mounted exactly at the right eye position!
    // -------------------------------------------------------------
    const singleTelescopeEye = new THREE.Group();
    singleTelescopeEye.position.set(0.38, 0.08, 0.82);
    headGroup.add(singleTelescopeEye);
    singleTelescopeEye.visible = false; // Hidden when not peeking!

    // Base Mounting Collar Ring
    const baseCollarGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.10, 32);
    baseCollarGeo.rotateX(Math.PI / 2);
    const baseCollar = new THREE.Mesh(baseCollarGeo, darkJointMat);
    singleTelescopeEye.add(baseCollar);

    const baseRimGeo = new THREE.TorusGeometry(0.225, 0.012, 12, 32);
    const baseRim = new THREE.Mesh(baseRimGeo, chromeMat);
    baseRim.position.set(0, 0, 0.05);
    singleTelescopeEye.add(baseRim);

    // Stage 1 Extending Barrel Sleeve
    const stage1Barrel = new THREE.Group();
    singleTelescopeEye.add(stage1Barrel);

    const s1Geo = new THREE.CylinderGeometry(0.20, 0.20, 0.24, 32);
    s1Geo.rotateX(Math.PI / 2);
    const s1Mesh = new THREE.Mesh(s1Geo, darkJointMat);
    stage1Barrel.add(s1Mesh);

    const s1RingGeo = new THREE.TorusGeometry(0.202, 0.010, 12, 32);
    const s1Ring = new THREE.Mesh(s1RingGeo, chromeMat);
    s1Ring.position.set(0, 0, 0.12);
    stage1Barrel.add(s1Ring);

    // Stage 2 Extending Main Optical Camera Tube
    const stage2Barrel = new THREE.Group();
    stage1Barrel.add(stage2Barrel);

    const s2Geo = new THREE.CylinderGeometry(0.175, 0.175, 0.30, 32);
    s2Geo.rotateX(Math.PI / 2);
    const s2Mesh = new THREE.Mesh(s2Geo, chromeMat);
    stage2Barrel.add(s2Mesh);

    // Ribbed focusing grip rings on stage 2
    for (let r = 0; r < 3; r++) {
      const gripGeo = new THREE.TorusGeometry(0.177, 0.006, 8, 28);
      const gripMesh = new THREE.Mesh(gripGeo, darkJointMat);
      gripMesh.position.set(0, 0, 0.04 + r * 0.05);
      stage2Barrel.add(gripMesh);
    }

    // Front Camera Lens Bezel
    const lensApertureGeo = new THREE.TorusGeometry(0.168, 0.012, 16, 32);
    const lensAperture = new THREE.Mesh(lensApertureGeo, darkJointMat);
    lensAperture.position.set(0, 0, 0.15);
    stage2Barrel.add(lensAperture);

    // Glowing Cyan Aperture Iris Face
    const irisTexture = createIrisCanvasTexture(THEME_CONFIGS[themeRef.current].primaryColor, false);
    const irisDiscMat = new THREE.MeshBasicMaterial({
      map: irisTexture,
      transparent: true,
    });
    const irisMesh = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), irisDiscMat);
    irisMesh.position.set(0, 0, 0.152);
    stage2Barrel.add(irisMesh);

    // Center Bright Glowing Pupil Core
    const pupilMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 24), emissiveGlowMat);
    pupilMesh.position.set(0, 0, 0.156);
    stage2Barrel.add(pupilMesh);

    // Front Convex Glass Optical Cap
    const glassCapGeo = new THREE.SphereGeometry(0.165, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.38);
    glassCapGeo.rotateX(Math.PI / 2);
    const glassCapMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.02,
      clearcoat: 1.0,
      transmission: 0.9,
      ior: 1.5,
    });
    const glassCap = new THREE.Mesh(glassCapGeo, glassCapMat);
    glassCap.position.set(0, 0, 0.153);
    stage2Barrel.add(glassCap);

    // -------------------------------------------------------------
    // FLOATING POD HANDS (Hovering beside torso with glowing cyan lights)
    // -------------------------------------------------------------
    function createFloatingPodHand(isLeft) {
      const handRoot = new THREE.Group();
      handRoot.position.set(isLeft ? -1.15 : 1.15, -0.38, 0.35);
      robotRoot.add(handRoot);

      // Pod Shell: Glossy Obsidian Black Smooth Pebble
      const podGeo = new THREE.SphereGeometry(0.28, 32, 32);
      const podMesh = new THREE.Mesh(podGeo, blackArmorMat);
      podMesh.scale.set(1.15, 0.88, 0.95);
      handRoot.add(podMesh);

      // Front Glowing Cyan Circular Core Light
      const coreLightGeo = new THREE.CircleGeometry(0.12, 32);
      const coreLightMesh = new THREE.Mesh(coreLightGeo, emissiveGlowMat);
      coreLightMesh.position.set(0, 0, 0.27);
      handRoot.add(coreLightMesh);

      // Chrome Bezel Ring around hand light
      const ringGeo = new THREE.TorusGeometry(0.125, 0.012, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, chromeMat);
      ringMesh.position.set(0, 0, 0.268);
      handRoot.add(ringMesh);

      return { handRoot, podMesh, coreLightMesh };
    }

    const leftHand = createFloatingPodHand(true);
    const rightHand = createFloatingPodHand(false);

    // -------------------------------------------------------------
    // MATHEMATICAL CAMERA FRAMING HELPER ("Bot Pura Dikhe")
    // Frames the entire robot: antenna top to body waist & floating hands
    // -------------------------------------------------------------
    function updateCameraFraming(width, height) {
      const aspect = width / height;
      camera.aspect = aspect;

      const fovDeg = 36;
      camera.fov = fovDeg;
      const vFovRad = THREE.MathUtils.degToRad(fovDeg);

      // Desired bounding box to fit with generous comfortable padding
      const fitH = 3.6;
      const fitW = 3.6;

      const distForHeight = (fitH / 2) / Math.tan(vFovRad / 2);
      const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
      const distForWidth = (fitW / 2) / Math.tan(hFovRad / 2);

      const targetZ = Math.max(distForHeight, distForWidth, 5.2);
      camera.position.set(0, 0.16, targetZ);
      camera.lookAt(0, 0.10, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    // Initial framing
    updateCameraFraming(container.clientWidth, container.clientHeight);

    // -------------------------------------------------------------
    // ANIMATION LOOP
    // -------------------------------------------------------------
    const clock = new THREE.Clock();
    let animationFrameId;
    let nextBlinkTime = 3.0;
    let blinkProgress = 0;
    let lastMood = moodRef.current;
    let errorStartTime = -999;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();
      const currentMood = moodRef.current;
      const currentThemeConfig = THEME_CONFIGS[themeRef.current];

      // Track when error starts so we shake exactly 1-2 times and stop
      if (currentMood === 'error' && lastMood !== 'error') {
        errorStartTime = elapsed;
      }
      lastMood = currentMood;

      const isErrorMood = currentMood === 'error';
      const errorElapsed = elapsed - errorStartTime;

      // Subtle slow drift of starry space dust
      particles.rotation.y += 0.0015;

      // Dynamic Theme & Error Color: Turn red briefly on error, then fade back smoothly within ~0.85s
      const isRedPhase = isErrorMood && errorElapsed < 0.85;
      const targetGlowHex = isRedPhase ? 0xff1e38 : parseInt(currentThemeConfig.primaryColor.replace('#', '0x'), 16);
      const targetColor = new THREE.Color(targetGlowHex);

      emissiveGlowMat.color.lerp(targetColor, 0.12);
      rimLight.color.lerp(targetColor, 0.12);
      glowPointLight.color.lerp(targetColor, 0.12);
      beaconLight.color.lerp(targetColor, 0.12);
      leftHaloMat.color.lerp(targetColor, 0.12);
      rightHaloMat.color.lerp(targetColor, 0.12);

      // Smooth mouse cursor tracking interpolation
      mouseRef.current.x = THREE.MathUtils.lerp(
        mouseRef.current.x,
        mouseRef.current.targetX,
        0.08
      );
      mouseRef.current.y = THREE.MathUtils.lerp(
        mouseRef.current.y,
        mouseRef.current.targetY,
        0.08
      );

      // Zero-Gravity Robot Floating Hover
      const hoverY = Math.sin(elapsed * 2.2) * 0.05;
      robotRoot.position.y = hoverY;

      // Soft pulse on Antenna beacon & chest reactor
      const pulse = Math.sin(elapsed * 4.0) * 0.08;
      antennaBeacon.scale.setScalar(1.0 + pulse);
      coreDisc.scale.setScalar(1.0 + pulse * 0.5);

      // -----------------------------------------------------------
      // 1. BLINKING & EYE TRACKING
      // -----------------------------------------------------------
      if (elapsed > nextBlinkTime) {
        blinkProgress = 1.0;
        nextBlinkTime = elapsed + 3.0 + Math.random() * 4.0;
      }

      let eyeScaleY = 1.0;
      if (blinkProgress > 0) {
        blinkProgress -= delta * 8.0; // Quick 120ms blink
        const t = Math.max(0, blinkProgress);
        eyeScaleY = THREE.MathUtils.lerp(1.0, 0.08, Math.sin(t * Math.PI));
      }

      // -----------------------------------------------------------
      // 2. ONE TELESCOPING EYE CONTROLLER ("Password show kare to EK eye bahar nikal kar aaye")
      // -----------------------------------------------------------
      const isPeeking = currentMood === 'peeking';

      if (isPeeking) {
        // --- PEEKING STATE ---
        // Left eye squints into a cute focused horizontal slit / wink!
        leftEyeRoot.scale.y = THREE.MathUtils.lerp(leftEyeRoot.scale.y, 0.12, 0.2);
        leftEyeRoot.scale.x = THREE.MathUtils.lerp(leftEyeRoot.scale.x, 0.90, 0.2);

        // Right pill eye hides, and single telescoping eye pops forward!
        rightEyeRoot.visible = false;
        singleTelescopeEye.visible = true;

        // Multi-stage extension: slides forward out from visor towards card!
        stage1Barrel.position.z = THREE.MathUtils.lerp(stage1Barrel.position.z, 0.24, 0.18);
        stage2Barrel.position.z = THREE.MathUtils.lerp(stage2Barrel.position.z, 0.38, 0.18);

        // Slight rotation angle focusing on the password field on the right
        stage2Barrel.rotation.y = THREE.MathUtils.lerp(stage2Barrel.rotation.y, -0.16, 0.15);
        stage2Barrel.rotation.x = THREE.MathUtils.lerp(stage2Barrel.rotation.x, 0.08, 0.15);

        // Pulsing pupil
        const pupilPulse = 1.0 + Math.sin(elapsed * 8.0) * 0.18;
        pupilMesh.scale.setScalar(pupilPulse);
      } else {
        // --- NORMAL / OTHER STATES ---
        // Left eye open and blinking naturally
        leftEyeRoot.scale.y = eyeScaleY;
        leftEyeRoot.scale.x = 1.0;

        // Right pill eye visible and blinking naturally
        rightEyeRoot.visible = true;
        rightEyeRoot.scale.y = eyeScaleY;

        // Single telescope eye retracts and hides
        stage1Barrel.position.z = THREE.MathUtils.lerp(stage1Barrel.position.z, 0.0, 0.25);
        stage2Barrel.position.z = THREE.MathUtils.lerp(stage2Barrel.position.z, 0.0, 0.25);
        stage2Barrel.rotation.set(0, 0, 0);

        if (stage1Barrel.position.z < 0.02) {
          singleTelescopeEye.visible = false;
        }
      }

      // Eye tracking across the visor
      const eyeTrackX = mouseRef.current.x * 0.08;
      const eyeTrackY = mouseRef.current.y * 0.05;
      eyesHolder.position.x = eyeTrackX;
      eyesHolder.position.y = 0.08 + eyeTrackY;

      // -----------------------------------------------------------
      // 3. HEAD BEHAVIOR & ERROR SHAKING
      // -----------------------------------------------------------
      if (isErrorMood && errorElapsed < 0.70) {
        // "Ek ya do bar hile bas": 2 clean cycles in 0.70s (left-right-left-right-center)
        const progress = errorElapsed / 0.70;
        const decay = Math.pow(1.0 - progress, 1.4);
        const shakeY = Math.sin(progress * Math.PI * 4) * 0.28 * decay;
        headGroup.rotation.y = shakeY;
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.04, 0.2);
        headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, 0, 0.2);

        // Moderate light intensity
        beaconLight.intensity = 2.8;
        glowPointLight.intensity = 3.2;
      } else if (currentMood === 'hiding_eyes') {
        // Head tilted down modestly
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.18, 0.1);
        headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, 0, 0.1);
        glowPointLight.intensity = 2.0;
      } else if (currentMood === 'peeking') {
        // Curious forward lean towards right (towards the password card!)
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0.08, 0.12);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.04, 0.12);
        headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, -0.04, 0.12);
        glowPointLight.intensity = 3.6;
      } else if (currentMood === 'celebrating') {
        // Happy victory sway
        headGroup.rotation.y = THREE.MathUtils.lerp(
          headGroup.rotation.y,
          Math.sin(elapsed * 4.0) * 0.18,
          0.12
        );
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.10, 0.12);
        headGroup.rotation.z = THREE.MathUtils.lerp(
          headGroup.rotation.z,
          Math.cos(elapsed * 4.0) * 0.06,
          0.12
        );
        glowPointLight.intensity = 3.5;
      } else {
        // Responsive cursor gaze tracking
        const targetHeadRotY = mouseRef.current.x * 0.44;
        const targetHeadRotX = -mouseRef.current.y * 0.28;
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, 0.1);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, 0.1);
        headGroup.rotation.z = THREE.MathUtils.lerp(
          headGroup.rotation.z,
          -targetHeadRotY * 0.06,
          0.1
        );
        glowPointLight.intensity = 2.8;
      }

      // -----------------------------------------------------------
      // 4. FLOATING POD HANDS CONTROLLER
      // -----------------------------------------------------------
      const leftBob = Math.sin(elapsed * 2.8) * 0.06;
      const rightBob = Math.cos(elapsed * 2.8) * 0.06;

      if (currentMood === 'hiding_eyes') {
        // --- POSE: COVERING VISOR EYES ---
        leftHand.handRoot.position.x = THREE.MathUtils.lerp(leftHand.handRoot.position.x, -0.38, 0.16);
        leftHand.handRoot.position.y = THREE.MathUtils.lerp(leftHand.handRoot.position.y, 0.15, 0.16);
        leftHand.handRoot.position.z = THREE.MathUtils.lerp(leftHand.handRoot.position.z, 1.25, 0.16);
        leftHand.handRoot.rotation.z = THREE.MathUtils.lerp(leftHand.handRoot.rotation.z, 0.22, 0.16);

        rightHand.handRoot.position.x = THREE.MathUtils.lerp(rightHand.handRoot.position.x, 0.38, 0.16);
        rightHand.handRoot.position.y = THREE.MathUtils.lerp(rightHand.handRoot.position.y, 0.15, 0.16);
        rightHand.handRoot.position.z = THREE.MathUtils.lerp(rightHand.handRoot.position.z, 1.25, 0.16);
        rightHand.handRoot.rotation.z = THREE.MathUtils.lerp(rightHand.handRoot.rotation.z, -0.22, 0.16);
      } else if (currentMood === 'celebrating') {
        // --- POSE: VICTORY CELEBRATION (Hands Raised High) ---
        const cheerWave = Math.sin(elapsed * 12) * 0.09;
        leftHand.handRoot.position.x = THREE.MathUtils.lerp(leftHand.handRoot.position.x, -1.25, 0.16);
        leftHand.handRoot.position.y = THREE.MathUtils.lerp(leftHand.handRoot.position.y, 0.72 + cheerWave, 0.16);
        leftHand.handRoot.position.z = THREE.MathUtils.lerp(leftHand.handRoot.position.z, 0.2, 0.16);
        leftHand.handRoot.rotation.z = THREE.MathUtils.lerp(leftHand.handRoot.rotation.z, 0.38, 0.16);

        rightHand.handRoot.position.x = THREE.MathUtils.lerp(rightHand.handRoot.position.x, 1.25, 0.16);
        rightHand.handRoot.position.y = THREE.MathUtils.lerp(rightHand.handRoot.position.y, 0.72 - cheerWave, 0.16);
        rightHand.handRoot.position.z = THREE.MathUtils.lerp(rightHand.handRoot.position.z, 0.2, 0.16);
        rightHand.handRoot.rotation.z = THREE.MathUtils.lerp(rightHand.handRoot.rotation.z, -0.38, 0.16);
      } else if (currentMood === 'typing') {
        // --- POSE: HOLOGRAPHIC TYPING (Alternate Air Tapping) ---
        const typeSpeed = elapsed * 24;
        const lTap = Math.sin(typeSpeed) * 0.10;
        const rTap = Math.cos(typeSpeed + 1.2) * 0.10;

        leftHand.handRoot.position.x = THREE.MathUtils.lerp(leftHand.handRoot.position.x, -0.68, 0.25);
        leftHand.handRoot.position.y = THREE.MathUtils.lerp(leftHand.handRoot.position.y, -0.38 + lTap, 0.25);
        leftHand.handRoot.position.z = THREE.MathUtils.lerp(leftHand.handRoot.position.z, 0.75, 0.25);

        rightHand.handRoot.position.x = THREE.MathUtils.lerp(rightHand.handRoot.position.x, 0.68, 0.25);
        rightHand.handRoot.position.y = THREE.MathUtils.lerp(rightHand.handRoot.position.y, -0.38 + rTap, 0.25);
        rightHand.handRoot.position.z = THREE.MathUtils.lerp(rightHand.handRoot.position.z, 0.75, 0.25);
      } else if (currentMood === 'peeking') {
        // --- POSE: ASTONISHED INSPECTION (Hands drop slightly, left hand points) ---
        leftHand.handRoot.position.x = THREE.MathUtils.lerp(leftHand.handRoot.position.x, -1.18, 0.16);
        leftHand.handRoot.position.y = THREE.MathUtils.lerp(leftHand.handRoot.position.y, -0.55 + leftBob, 0.16);
        leftHand.handRoot.position.z = THREE.MathUtils.lerp(leftHand.handRoot.position.z, 0.2, 0.16);

        rightHand.handRoot.position.x = THREE.MathUtils.lerp(rightHand.handRoot.position.x, 1.18, 0.16);
        rightHand.handRoot.position.y = THREE.MathUtils.lerp(rightHand.handRoot.position.y, -0.55 + rightBob, 0.16);
        rightHand.handRoot.position.z = THREE.MathUtils.lerp(rightHand.handRoot.position.z, 0.2, 0.16);
      } else {
        // --- POSE: DEFAULT HOVERING (Subtle tracking with mouse) ---
        const handTrackX = mouseRef.current.x * 0.10;
        const handTrackY = mouseRef.current.y * 0.08;

        leftHand.handRoot.position.x = THREE.MathUtils.lerp(leftHand.handRoot.position.x, -1.15 + handTrackX, 0.1);
        leftHand.handRoot.position.y = THREE.MathUtils.lerp(leftHand.handRoot.position.y, -0.38 + leftBob + handTrackY, 0.1);
        leftHand.handRoot.position.z = THREE.MathUtils.lerp(leftHand.handRoot.position.z, 0.35, 0.1);
        leftHand.handRoot.rotation.z = THREE.MathUtils.lerp(leftHand.handRoot.rotation.z, 0.06, 0.1);

        rightHand.handRoot.position.x = THREE.MathUtils.lerp(rightHand.handRoot.position.x, 1.15 + handTrackX, 0.1);
        rightHand.handRoot.position.y = THREE.MathUtils.lerp(rightHand.handRoot.position.y, -0.38 + rightBob + handTrackY, 0.1);
        rightHand.handRoot.position.z = THREE.MathUtils.lerp(rightHand.handRoot.position.z, 0.35, 0.1);
        rightHand.handRoot.rotation.z = THREE.MathUtils.lerp(rightHand.handRoot.rotation.z, -0.06, 0.1);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer for responsive canvas scaling and dynamic camera framing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          updateCameraFraming(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleTap = () => {
    playSuccessChime();
    if (onMascotClick) {
      onMascotClick();
    }
  };

  return (
    <div
      id="mascot-avatar-container"
      onClick={handleTap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-center justify-center select-none cursor-pointer group w-full"
      title="Click me to celebrate!"
    >
      {/* Real 3D WebGL Three.js Canvas Container matching the requested Cyber Black Mascot */}
      <div
        ref={mountRef}
        className="relative w-full h-[460px] sm:h-[500px] md:h-[540px] lg:h-[580px] max-w-[500px] flex items-center justify-center transition-transform duration-300"
        style={{
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        }}
      />
    </div>
  );
}
