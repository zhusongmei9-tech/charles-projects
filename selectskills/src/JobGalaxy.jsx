import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { jobsMatchingAllSkills } from "./jobGraph.js";
import { ink } from "./theme.js";

// 纸面底色：球体不发光，靠环境光与主光形成哑光实体感。
const TYPE_STYLE = {
  category: { opacity: 1 },
  job: { opacity: 0.95 },
  skill: { opacity: 0.92 },
};

const STAGE_COLOR = 0xf4f1ea;
const HEAT_RAMP = ["#6ee7a8", "#d6e85f", "#ffb347", "#ff5f57"];

export function JobGalaxy({ graph, selected, selectedSkillIds = [], onSelect, layerView, skillCategoryFilterId }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const objectsRef = useRef(new Map());
  const linesRef = useRef([]);
  const fixedLabelsRef = useRef(null);
  const fixedLabelDataRef = useRef([]);
  const selectedRef = useRef(selected);
  const graphRef = useRef(graph);
  const onSelectRef = useRef(onSelect);
  const layerViewRef = useRef(layerView);
  const [tooltip, setTooltip] = useState(null);

  const highlighted = useMemo(
    () => buildHighlightSet(graph, selected, skillCategoryFilterId, selectedSkillIds),
    [graph, selected, selectedSkillIds, skillCategoryFilterId],
  );
  const skillVisuals = useMemo(() => skillVisualsForSelection(graph, selected), [graph, selected]);
  const skillSelectionSummary = useMemo(() => {
    const node = selected ? graph.nodeById.get(selected.id) : null;
    if (node?.type !== "skill") return null;
    const activeSkillIds = selectedSkillIds.length > 0 ? selectedSkillIds : [node.id];
    const skills = activeSkillIds.map((skillId) => graph.nodeById.get(skillId)).filter(Boolean);
    const jobCount = jobsMatchingAllSkills(graph, activeSkillIds).length;
    return {
      label: skills.length > 1 ? "已选技能组合" : "已选技能",
      title: skills.map((skill) => skill.label).join(" + "),
      description: skills.length > 1
        ? `同时要求这几项技能的岗位有 ${jobCount} 个。`
        : `有 ${jobCount} 个岗位在描述里提到这项技能。`,
    };
  }, [graph, selected, selectedSkillIds]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    graphRef.current = graph;
  }, [graph]);

  useEffect(() => {
    layerViewRef.current = layerView;
  }, [layerView]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(STAGE_COLOR);
    scene.fog = new THREE.Fog(STAGE_COLOR, 150, 260);
    sceneRef.current = scene;

    const aspect = mount.clientWidth / mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 320);
    camera.position.set(0, 20, Math.max(106, 106 / aspect));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 42;
    controls.maxDistance = 240;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(18, 42, 26);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfe6f2, 0.55);
    rim.position.set(-30, 6, -34);
    scene.add(rim);

    addReferenceRings(scene);
    createGraphObjects(scene, graph, objectsRef.current, linesRef.current);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = null;
    let pointerMoved = false;

    const updatePointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pick = (event) => {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);
      const meshes = [...objectsRef.current.values()].filter((mesh) => mesh.visible);
      const hits = raycaster.intersectObjects(meshes, false);
      const hit = hits.find((item) => item.object.userData.node.type === "category") || hits[0];
      return hit?.object || null;
    };

    const onMove = (event) => {
      pointerMoved = true;
      const object = pick(event);
      if (object !== hovered) {
        hovered = object;
        renderer.domElement.style.cursor = object ? "pointer" : "grab";
      }
      if (object) {
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          label: object.userData.node.label,
          type: object.userData.node.type,
        });
      } else {
        setTooltip(null);
      }
    };

    const onClick = (event) => {
      const object = pick(event);
      if (object) {
        const node = object.userData.node;
        onSelectRef.current({ id: node.id, type: node.type });
      } else {
        pointerMoved = false;
        return;
      }
      pointerMoved = false;
    };

    const onLeave = () => {
      hovered = null;
      setTooltip(null);
    };

    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    const onResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    let frameId = 0;
    const animate = () => {
      const elapsed = performance.now() / 1000;
      const selectedNode = selectedRef.current ? graphRef.current.nodeById.get(selectedRef.current.id) : null;
      for (const mesh of objectsRef.current.values()) {
        const node = mesh.userData.node;
        const targetPosition = targetNodePosition(node, selectedNode, layerViewRef.current);
        mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetPosition.x, 0.085);
        mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetPosition.z, 0.085);
        mesh.position.y = THREE.MathUtils.lerp(
          mesh.position.y,
          targetPosition.y + Math.sin(elapsed * 0.8 + node.index) * 0.18,
          0.085,
        );
        const targetRadius = mesh.userData.targetRadius ?? node.radius;
        mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetRadius, 0.12));
        if (mesh.userData.highlightMaterial) {
          mesh.userData.highlightMaterial.uniforms.uTime.value = elapsed;
        }
        updateCategoryLabel(mesh);
      }
      updateLinePositions(linesRef.current);
      updateFixedLabels(fixedLabelsRef.current, fixedLabelDataRef.current, objectsRef.current, camera, renderer);
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      disposeScene(scene);
      objectsRef.current.clear();
      linesRef.current = [];
    };
  }, [graph]);

  useEffect(() => {
    applyHighlight(objectsRef.current, linesRef.current, highlighted, skillVisuals);
  }, [highlighted, skillVisuals]);

  useEffect(() => {
    const layer = fixedLabelsRef.current;
    if (!layer) return;

    const node = selected ? graph.nodeById.get(selected.id) : null;
    const labelData =
      node?.type === "job"
        ? [
            ...node.skillIds
              .map((id) => graph.nodeById.get(id))
              .filter(Boolean)
              .map((skill) => ({ id: skill.id, type: "skill", label: skill.label })),
          ]
        : [];

    fixedLabelDataRef.current = labelData;
    layer.replaceChildren(
      ...labelData.map((item) => {
        const element = document.createElement("div");
        element.className = `fixed-node-label ${item.type}`;
        element.dataset.nodeId = item.id;

        const type = document.createElement("span");
        type.textContent = item.type === "skill" ? "" : typeLabel(item.type);
        if (item.type === "skill") type.hidden = true;
        const label = document.createElement("strong");
        label.textContent = item.label;
        element.append(type, label);
        return element;
      }),
    );
  }, [graph, selected]);

  return (
    <div className="galaxy" ref={mountRef} aria-label="岗位、大类与技能的三维关系图">
      <div className="skill-heat-legend" aria-hidden="true">
        <span style={{ "--heat-color": ink(HEAT_RAMP[0]) }}>低频</span>
        <span style={{ "--heat-color": ink(HEAT_RAMP[1]) }}>中低</span>
        <span style={{ "--heat-color": ink(HEAT_RAMP[2]) }}>中高</span>
        <span style={{ "--heat-color": ink(HEAT_RAMP[3]) }}>高频</span>
      </div>
      <div className="job-heat-legend" aria-hidden="true">
        <strong>岗位技能数</strong>
        <span>少</span>
        <i />
        <span>多</span>
      </div>
      {skillSelectionSummary ? (
        <div className="skill-selection-summary" aria-live="polite">
          <span>{skillSelectionSummary.label}</span>
          <strong>{skillSelectionSummary.title}</strong>
          <p>{skillSelectionSummary.description}</p>
        </div>
      ) : null}
      {tooltip ? (
        <div className="tooltip" style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}>
          <span>{typeLabel(tooltip.type)}</span>
          {tooltip.label}
        </div>
      ) : null}
      <div className="fixed-label-layer" ref={fixedLabelsRef} aria-hidden="true" />
    </div>
  );
}

function createGraphObjects(scene, graph, objectMap, lineList) {
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  for (const node of graph.nodes) {
    const style = TYPE_STYLE[node.type];
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(ink(node.color || "#8d9199")),
      roughness: node.type === "category" ? 0.44 : 0.58,
      metalness: 0.02,
      transparent: true,
      opacity: style.opacity,
    });
    const mesh = new THREE.Mesh(sphere, material);
    mesh.position.set(node.x, node.y, node.z);
    mesh.scale.setScalar(node.radius);
    const baseColor = material.color.clone();
    mesh.userData = {
      node,
      baseMaterial: material,
      highlightMaterial: createParticleSphereMaterial(baseColor),
      baseColor,
      baseOpacity: style.opacity,
      targetRadius: node.radius,
    };
    scene.add(mesh);
    objectMap.set(node.id, mesh);

    if (node.type === "category") {
      mesh.userData.categoryLabel = addTextLabel(scene, node.label, node.x, node.y + node.radius + 1.35, node.z, ink(node.color || "#17181c"));
    }
  }

  for (const link of graph.links) {
    const source = objectMap.get(link.source);
    const target = objectMap.get(link.target);
    if (!source || !target) continue;
    const geometry = new THREE.BufferGeometry().setFromPoints([source.position, target.position]);
    const material = new THREE.LineBasicMaterial({
      color: link.type === "category-job" ? 0x8fa2ad : 0xb3a184,
      transparent: true,
      opacity: link.type === "category-job" ? 0.42 : 0.26,
    });
    const line = new THREE.Line(geometry, material);
    line.userData = { link, source, target, baseOpacity: material.opacity };
    scene.add(line);
    lineList.push(line);
  }
}

// 浅底上的高亮不再"发光"，而是把球体压成更深、更饱和的同色，并让边缘加深。
function createParticleSphereMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color.clone() },
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uOpacity: { value: 1 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vPosition;
      varying vec3 vNormal;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uOpacity;
      varying vec3 vPosition;
      varying vec3 vNormal;
      void main() {
        vec3 normal = normalize(vNormal);
        float rim = pow(1.0 - abs(normal.z), 2.1);
        float latitude = sin((vPosition.y + uTime * 0.24) * 32.0);
        float longitude = sin((atan(vPosition.z, vPosition.x) + uTime * 0.55) * 18.0);
        float sparkle = smoothstep(0.9, 1.0, latitude * longitude);
        float scan = smoothstep(0.035, 0.0, abs(fract(vPosition.y * 2.7 + uTime * 0.45) - 0.5));
        vec3 deep = uColor * 0.34;
        vec3 shade = mix(uColor, deep, clamp(rim * 0.85 + sparkle * 0.5 + scan * 0.25, 0.0, 1.0) * uIntensity);
        gl_FragColor = vec4(shade, uOpacity);
      }
    `,
    transparent: true,
    depthWrite: true,
    blending: THREE.NormalBlending,
  });
}

function addReferenceRings(scene) {
  const levels = [
    { y: 26, color: 0xc3cfd4, radius: 42 },
    { y: 0, color: 0xcfc9bd, radius: 34 },
    { y: -26, color: 0xd5c9ae, radius: 42 },
  ];
  for (const level of levels) {
    const curve = new THREE.EllipseCurve(0, 0, level.radius, level.radius, 0, Math.PI * 2);
    const points = curve.getPoints(96).map((point) => new THREE.Vector3(point.x, level.y, point.y));
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: level.color, transparent: true, opacity: 0.75 }),
    );
    scene.add(line);
  }
}

function addTextLabel(scene, text, x, y, z, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "700 48px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  // 纸色描边让标签压在球体上时依然可读。
  context.lineWidth = 9;
  context.strokeStyle = "rgba(244, 241, 234, 0.92)";
  context.strokeText(text, canvas.width / 2, canvas.height / 2);
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.96,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(10, 2.5, 1);
  sprite.renderOrder = 10;
  scene.add(sprite);
  return sprite;
}

function updateCategoryLabel(mesh) {
  const label = mesh.userData.categoryLabel;
  if (!label) return;
  label.position.set(mesh.position.x, mesh.position.y + mesh.scale.y + 1.35, mesh.position.z);
  label.visible = mesh.visible;
}

function updateLinePositions(lines) {
  for (const line of lines) {
    const positions = line.geometry.attributes.position.array;
    const { source, target } = line.userData;
    positions[0] = source.position.x;
    positions[1] = source.position.y;
    positions[2] = source.position.z;
    positions[3] = target.position.x;
    positions[4] = target.position.y;
    positions[5] = target.position.z;
    line.geometry.attributes.position.needsUpdate = true;
  }
}

function targetNodePosition(node, selectedNode, layerView) {
  if (selectedNode?.type !== "job" || node.type !== "skill") {
    return layerView === "skill" && node.type !== "job" ? { ...node, y: -node.y } : node;
  }

  const skillIndex = selectedNode.skillIds.indexOf(node.id);
  if (skillIndex < 0) {
    return layerView === "skill" ? { ...node, y: -node.y } : node;
  }

  const total = selectedNode.skillIds.length;
  const ring = skillIndex % 2;
  const ringIndex = Math.floor(skillIndex / 2);
  const ringTotal = Math.ceil(total / 2);
  const angleSpan = Math.min(Math.PI * 1.35, Math.PI * (0.72 + total * 0.055));
  const angle = -Math.PI / 2 - angleSpan / 2 + (ringIndex / Math.max(ringTotal - 1, 1)) * angleSpan + ring * 0.16;
  const radius = 17 + Math.min(total, 12) * 1.35 + ring * 5.5;

  return {
    x: selectedNode.x + Math.cos(angle) * radius,
    y: selectedNode.y + (layerView === "skill" ? 1 : -1) * (21 + ring * 2.5),
    z: selectedNode.z + Math.sin(angle) * radius,
  };
}

function updateFixedLabels(layer, labelData, objectMap, camera, renderer) {
  if (!layer || labelData.length === 0) return;
  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;
  const projected = new THREE.Vector3();

  for (let index = 0; index < labelData.length; index += 1) {
    const item = labelData[index];
    const mesh = objectMap.get(item.id);
    const element = layer.querySelector(`[data-node-id="${CSS.escape(item.id)}"]`);
    if (!mesh || !element || !mesh.visible) {
      if (element) element.style.opacity = "0";
      continue;
    }

    projected.copy(mesh.position);
    projected.y += mesh.scale.y * 1.35;
    projected.project(camera);
    const visible = projected.z > -1 && projected.z < 1;
    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-projected.y * 0.5 + 0.5) * height;
    const offset = item.type === "job" ? 16 : 18 + (index % 2) * 16;
    const stagger = item.type === "skill" ? (index % 4) * 18 : 0;
    element.style.opacity = visible ? "1" : "0";
    element.style.transform = `translate(${x + offset}px, ${y - 10 + stagger}px)`;
  }
}

function buildHighlightSet(graph, selected, skillCategoryFilterId, selectedSkillIds) {
  if (!selected) {
    return {
      active: false,
      selectedType: null,
      nodes: new Set(),
      links: new Set(),
      contextNodes: new Set(),
      contextLinks: new Set(),
      skillCategoryFilterId: null,
      skillIntersectionActive: false,
    };
  }
  const node = graph.nodeById.get(selected.id);
  const activeSkillIds = node?.type === "skill" && selectedSkillIds.length > 0 ? selectedSkillIds : [selected.id];
  const nodes = new Set(activeSkillIds);
  const links = new Set();
  const contextNodes = new Set();
  const contextLinks = new Set();
  const activeSkillCategoryFilterId = node?.type === "skill" ? skillCategoryFilterId : null;

  if (node?.type === "category") {
    const categoryJobs = graph.jobsByCategory.get(node.id) || [];
    for (const job of categoryJobs) {
      nodes.add(job.id);
      links.add(`${node.id}->${job.id}`);
      for (const skillId of job.skillIds) {
        nodes.add(skillId);
        links.add(`${job.id}->${skillId}`);
      }
    }
  } else if (node?.type === "job") {
    nodes.add(node.categoryId);
    for (const skillId of node.skillIds) nodes.add(skillId);
    for (const link of graph.links) {
      if ((link.source === node.categoryId && link.target === node.id) || link.source === node.id || link.target === node.id) {
        links.add(link.id);
      } else if (link.type === "category-job" && link.source === node.categoryId) {
        contextNodes.add(link.target);
      }
    }
  } else if (node?.type === "skill") {
    if (activeSkillCategoryFilterId) nodes.add(activeSkillCategoryFilterId);
    const matchingJobs = jobsMatchingAllSkills(graph, activeSkillIds);
    for (const job of matchingJobs) {
      if (activeSkillCategoryFilterId && job.categoryId !== activeSkillCategoryFilterId) continue;
      nodes.add(job.id);
      for (const skillId of activeSkillIds) {
        links.add(`${job.id}->${skillId}`);
      }
    }
  }

  return {
    active: true,
    selectedType: node?.type || selected.type,
    nodes,
    links,
    contextNodes,
    contextLinks,
    skillCategoryFilterId: activeSkillCategoryFilterId,
    skillIntersectionActive: node?.type === "skill" && activeSkillIds.length > 1,
  };
}

function skillVisualsForSelection(graph, selected) {
  const node = selected ? graph.nodeById.get(selected.id) : null;
  const categoryId = node?.type === "category" ? node.id : node?.type === "job" ? node.categoryId : null;
  return (categoryId && graph.skillVisualsByCategory.get(categoryId)) || graph.globalSkillVisuals;
}

function applyHighlight(objectMap, lines, highlighted, skillVisuals) {
  for (const [id, mesh] of objectMap.entries()) {
    const skillVisual = mesh.userData.node.type === "skill" ? skillVisuals.get(id) : null;
    const highlightGlobalSkill = !highlighted.active && mesh.userData.node.type === "skill";
    if (skillVisual) {
      const skillInk = ink(skillVisual.color);
      mesh.userData.baseMaterial.color.set(skillInk);
      mesh.userData.baseMaterial.transparent = !highlightGlobalSkill;
      mesh.userData.highlightMaterial.uniforms.uColor.value.set(skillInk);
      mesh.userData.baseColor.set(skillInk);
    }
    mesh.userData.targetRadius = skillVisual?.radius ?? mesh.userData.node.radius;

    const isActive = !highlighted.active || highlighted.nodes.has(id);
    const isHighlighted = highlighted.active && highlighted.nodes.has(id);
    const isContext = highlighted.contextNodes?.has(id);
    const isCategoryFocus = highlighted.selectedType === "category";
    const hideInactiveSkill = highlighted.active && !isCategoryFocus && mesh.userData.node.type === "skill" && !isActive;
    const hideInactiveCategoryJob = isCategoryFocus && mesh.userData.node.type === "job" && !isActive;
    const hideOtherCategoryJob =
      highlighted.selectedType === "job" &&
      mesh.userData.node.type === "job" &&
      !isHighlighted &&
      !isContext;
    const hideFilteredSkillJob =
      highlighted.skillCategoryFilterId &&
      mesh.userData.node.type === "job" &&
      !isHighlighted;
    const hideNonIntersectionJob =
      highlighted.skillIntersectionActive &&
      mesh.userData.node.type === "job" &&
      !isHighlighted;
    const hideSampledFullLinkJob = !highlighted.active && mesh.userData.node.type === "job" && mesh.userData.node.index % 2 === 1;
    mesh.visible =
      !hideInactiveSkill &&
      !hideInactiveCategoryJob &&
      !hideOtherCategoryJob &&
      !hideFilteredSkillJob &&
      !hideNonIntersectionJob &&
      !hideSampledFullLinkJob;
    const inactiveOpacity =
      isCategoryFocus && mesh.userData.node.type === "category"
        ? 1
        : inactiveNodeOpacity(mesh.userData.node.type, highlighted.selectedType);
    mesh.material = highlightGlobalSkill
      ? mesh.userData.baseMaterial
      : isHighlighted || isContext
        ? mesh.userData.highlightMaterial
        : mesh.userData.baseMaterial;
    mesh.material.opacity = isHighlighted || highlightGlobalSkill
      ? 1
      : isContext
        ? 0.68
        : isActive
          ? mesh.userData.baseOpacity
          : inactiveOpacity;
    const highlightMaterial = mesh.userData.highlightMaterial;
    highlightMaterial.uniforms.uIntensity.value = isHighlighted ? 1 : isContext ? 0.5 : 0;
    highlightMaterial.uniforms.uOpacity.value = mesh.material.opacity;
  }

  for (const line of lines) {
    const isActive = !highlighted.active || highlighted.links.has(line.userData.link.id);
    line.visible = isActive && line.userData.source.visible && line.userData.target.visible;
    line.material.opacity = isActive ? (highlighted.active ? 0.72 : line.userData.baseOpacity) : 0.06;
  }
}

function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (material.map) material.map.dispose();
        material.dispose();
      }
    }
  });
}

function typeLabel(type) {
  if (type === "category") return "大类";
  if (type === "job") return "职位";
  return "技能";
}

function inactiveNodeOpacity(nodeType, selectedType) {
  if (selectedType === "category") {
    if (nodeType === "category") return 0.7;
    if (nodeType === "job") return 0.32;
    return 0.26;
  }
  if (selectedType === "job" && nodeType === "category") return 1;
  if (nodeType === "category") return 0.5;
  return 0.16;
}
