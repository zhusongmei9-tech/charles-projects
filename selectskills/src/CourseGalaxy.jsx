import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildCourse3dLayout, courseRadius } from "./courseGraph.js";
import { inkHue } from "./theme.js";

const TYPE_LABEL = {
  course: "课程",
  major: "专业",
};

const STAGE_COLOR = 0xf4f1ea;

export function CourseGalaxy({ model, selection, mathCourseIds, showMathCourses, onSelect }) {
  const mountRef = useRef(null);
  const labelLayerRef = useRef(null);
  const objectMapRef = useRef(new Map());
  const baseLinesRef = useRef({ majorCourse: null, mathCourse: null });
  const activeLinesRef = useRef([]);
  const selectionRef = useRef(selection);
  const onSelectRef = useRef(onSelect);
  const layout = useMemo(() => buildCourse3dLayout(model), [model]);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(STAGE_COLOR);
    scene.fog = new THREE.Fog(STAGE_COLOR, 165, 255);

    const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / mount.clientHeight, 0.1, 320);
    camera.position.set(0, 22, 148);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 82;
    controls.maxDistance = 225;
    controls.target.set(0, -2, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.45));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(24, 68, 46);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xdfe6f2, 0.5);
    rimLight.position.set(-40, -10, -44);
    scene.add(rimLight);

    addLayerRing(scene, 38, 64, 47, 0xcfc9bd);
    addLayerRing(scene, -38, 70, 52, 0xcfc9bd);

    createNodes(scene, model, layout, objectMapRef.current);
    const mathLinks = model.links.filter((link) => mathCourseIds.has(link.courseId));
    baseLinesRef.current.majorCourse = createLineSegments(
      scene,
      model.links.filter((link) => !mathCourseIds.has(link.courseId)),
      layout,
      "majorId",
      "courseId",
      0x9aa6ac,
      0.16,
    );
    baseLinesRef.current.mathCourse = createLineSegments(
      scene,
      mathLinks,
      layout,
      "majorId",
      "courseId",
      0x9aa6ac,
      0.16,
    );
    buildLabelLayer(labelLayerRef.current, model.majors);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const pick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects([...objectMapRef.current.values()].filter((object) => object.visible), false)[0]?.object || null;
    };

    const handlePointerMove = (event) => {
      const object = pick(event);
      renderer.domElement.style.cursor = object ? "pointer" : "grab";
      if (!object) {
        setTooltip(null);
        return;
      }
      const rect = mount.getBoundingClientRect();
      const node = object.userData.node;
      setTooltip({
        x: event.clientX - rect.left + 14,
        y: event.clientY - rect.top + 14,
        node,
      });
    };

    const handleClick = (event) => {
      const node = pick(event)?.userData.node;
      if (node) {
        onSelectRef.current({ id: node.id, type: node.type });
      }
    };

    const handleLeave = () => setTooltip(null);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("click", handleClick);
    renderer.domElement.addEventListener("pointerleave", handleLeave);

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    let frameId = 0;
    const animate = () => {
      for (const mesh of objectMapRef.current.values()) {
        const nextScale = THREE.MathUtils.lerp(mesh.scale.x, mesh.userData.targetScale, 0.11);
        mesh.scale.setScalar(nextScale);
      }
      controls.update();
      updateLabels(labelLayerRef.current, objectMapRef.current, camera, renderer);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("pointerleave", handleLeave);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      objectMapRef.current.clear();
      activeLinesRef.current = [];
    };
  }, [layout, mathCourseIds, model]);

  useEffect(() => {
    applySelection({
      model,
      layout,
      selection,
      objectMap: objectMapRef.current,
      baseLines: baseLinesRef.current,
      activeLines: activeLinesRef.current,
      mathCourseIds,
      showMathCourses,
    });
  }, [layout, mathCourseIds, model, selection, showMathCourses]);

  return (
    <div className="course-galaxy" ref={mountRef} role="img" aria-label="专业和课程的两层立体关系图">
      <div className="course-3d-layer-legend" aria-hidden="true">
        <span><i className="major" />上层 · 专业</span>
        <span><i className="course" />下层 · 课程</span>
      </div>
      <p className="course-3d-hint">拖动旋转视角 · 滚轮缩放 · 点击球体查看关联</p>
      {tooltip ? (
        <div className="course-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <span>{TYPE_LABEL[tooltip.node.type]}</span>
          <strong>{tooltip.node.label}</strong>
          <b>{nodeMeta(tooltip.node)}</b>
        </div>
      ) : null}
      <div className="course-3d-label-layer" ref={labelLayerRef} aria-hidden="true" />
    </div>
  );
}

function createNodes(scene, model, layout, objectMap) {
  const geometry = new THREE.SphereGeometry(1, 20, 14);
  const nodes = [...model.courses, ...model.majors];
  nodes.forEach((node, index) => {
    const baseRadius = nodeRadius(node, model.stats.maxMentions);
    const color = nodeColor(node, index, model.stats.maxMentions);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: node.type === "course" ? 0.6 : 0.46,
      metalness: 0.02,
      transparent: true,
      opacity: node.type === "course" ? 0.85 : 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const position = layout.get(node.id);
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.setScalar(baseRadius);
    mesh.userData = {
      node,
      baseColor: new THREE.Color(color),
      baseRadius,
      targetScale: baseRadius,
    };
    scene.add(mesh);
    objectMap.set(node.id, mesh);
  });
}

function applySelection({ model, layout, selection, objectMap, baseLines, activeLines, mathCourseIds, showMathCourses }) {
  if (objectMap.size === 0) return;
  const selectedMajor = selection?.type === "major" ? model.majorById.get(selection.id) || null : null;
  const selectedCourse = selection?.type === "course" ? model.courseById.get(selection.id) || null : null;
  const activeCourseIds = new Set(selectedMajor?.courseIds || (selectedCourse ? [selectedCourse.id] : []));
  const activeMajorIds = new Set(selectedCourse?.majorIds || (selectedMajor ? [selectedMajor.id] : []));

  for (const mesh of objectMap.values()) {
    const { node, baseColor, baseRadius } = mesh.userData;
    mesh.visible = node.type !== "course" || showMathCourses || !mathCourseIds.has(node.id);
    const active = !selection ||
      (node.type === "major" && activeMajorIds.has(node.id)) ||
      (node.type === "course" && activeCourseIds.has(node.id));
    const selected = node.id === selection?.id;
    mesh.material.opacity = active ? (node.type === "course" ? 0.92 : 1) : (node.type === "course" ? 0.1 : 0.24);
    mesh.material.color.copy(baseColor);
    mesh.userData.targetScale = baseRadius * (selected ? 1.3 : active && selection ? 1.08 : 1);
  }

  if (baseLines.majorCourse) baseLines.majorCourse.material.opacity = selection ? 0.05 : 0.16;
  if (baseLines.mathCourse) {
    baseLines.mathCourse.visible = showMathCourses;
    baseLines.mathCourse.material.opacity = selection ? 0.05 : 0.16;
  }

  activeLines.splice(0).forEach((line) => {
    line.parent?.remove(line);
    line.geometry.dispose();
    line.material.dispose();
  });
  if (!selection) return;

  const scene = objectMap.values().next().value.parent;
  const majorCourseLinks = model.links.filter((link) => {
    if (!showMathCourses && mathCourseIds.has(link.courseId)) return false;
    return selectedMajor ? link.majorId === selectedMajor.id : link.courseId === selectedCourse?.id;
  });
  activeLines.push(
    createLineSegments(
      scene,
      majorCourseLinks,
      layout,
      "majorId",
      "courseId",
      selectedCourse ? 0xa16207 : 0x0d6e66,
      0.75,
    ),
  );
}

function createLineSegments(scene, links, layout, sourceKey, targetKey, color, opacity) {
  const coordinates = new Float32Array(links.length * 6);
  links.forEach((link, index) => {
    const source = layout.get(link[sourceKey]);
    const target = layout.get(link[targetKey]);
    coordinates.set([source.x, source.y, source.z, target.x, target.y, target.z], index * 6);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(coordinates, 3));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const lines = new THREE.LineSegments(geometry, material);
  scene.add(lines);
  return lines;
}

function addLayerRing(scene, y, radiusX, radiusZ, color) {
  const points = Array.from({ length: 129 }, (_, index) => {
    const angle = (index / 128) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radiusX, y, Math.sin(angle) * radiusZ);
  });
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.34 });
  scene.add(new THREE.Line(geometry, material));
}

function buildLabelLayer(layer, nodes) {
  if (!layer) return;
  layer.replaceChildren(...nodes.map((node) => {
    const label = document.createElement("div");
    label.className = `course-3d-label ${node.type}`;
    label.dataset.nodeId = node.id;
    label.textContent = shortNodeLabel(node);
    return label;
  }));
}

function updateLabels(layer, objectMap, camera, renderer) {
  if (!layer) return;
  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;
  layer.querySelectorAll("[data-node-id]").forEach((label) => {
    const mesh = objectMap.get(label.dataset.nodeId);
    if (!mesh) return;
    const point = mesh.position.clone().project(camera);
    const visible = point.z > -1 && point.z < 1;
    label.style.opacity = visible ? String(Math.max(0.16, Math.min(1, mesh.material.opacity))) : "0";
    label.style.transform = `translate(-50%, -50%) translate(${(point.x * 0.5 + 0.5) * width}px, ${(-point.y * 0.5 + 0.5) * height - mesh.scale.x * 4}px)`;
  });
}

function nodeRadius(node, maxMentions) {
  if (node.type === "major") return 3.4;
  const scaled = courseRadius(node.mentionCount, maxMentions);
  return 0.52 + ((scaled - 5.5) / 11.5) * 1.15;
}

// 提得越多越偏红，越少越偏绿；统一压暗以适配纸面底色。
function nodeColor(node, index, maxMentions) {
  if (node.type === "course") {
    const level = maxMentions <= 1 ? 0 : (node.mentionCount - 1) / (maxMentions - 1);
    return new THREE.Color(inkHue(145 - level * 145, 0.62, 0.42));
  }
  return new THREE.Color(inkHue((index * 47 + 165) % 360, 0.55, 0.4));
}

function nodeMeta(node) {
  if (node.type === "major") return `${node.courseIds.length} 门课程`;
  return `${node.mentionCount} 个专业提到`;
}

function shortNodeLabel(node) {
  const label = node.type === "major" ? node.label.replace(/（.*?）/g, "") : node.label;
  const limit = node.type === "major" ? 8 : 11;
  return label.length > limit ? `${label.slice(0, limit)}…` : label;
}

function disposeScene(scene) {
  const geometries = new Set();
  const materials = new Set();
  scene.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material));
    else if (object.material) materials.add(object.material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
