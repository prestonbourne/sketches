import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { VanillaCanvas } from "src/ui/Canvas";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Sketch: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const renderer = new THREE.WebGLRenderer({ canvas });

            renderer.setSize(width, height);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                75,
                width / height,
                0.1,
                1000
            );
            camera.position.z = 30;
            camera.position.y = 30;
            camera.lookAt(0, 0, 0);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;

            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0, 1, 2);
            light.castShadow = true;
            scene.add(light);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const grid = 55;
            const size = 0.5;
            const gridSize = grid * size;
            const geometry = new THREE.BoxGeometry(size, 4, size);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x1084ff,
                metalness: 0,
                roughness: 0.0,
            });
            const mesh = new THREE.InstancedMesh(
                geometry,
                material,
                grid * grid
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const totalColor =
                material.color.r + material.color.g + material.color.b;
            const colorVec = new THREE.Vector3();
            const color = new THREE.Color();
            const weights = new THREE.Vector3();
            weights.x = material.color.r;
            weights.y = material.color.g;
            weights.z = material.color.b;
            // Normalize the color weights
            weights.divideScalar(totalColor);
            // Scaled Invert the weights
            weights.multiplyScalar(-0.7);

            // Add 1 to the weights to ensure the color is always positive
            weights.addScalar(1);

            const dummy = new THREE.Object3D();

            let i = 0;
            for (let x = 0; x < grid; x++) {
                for (let y = 0; y < grid; y++) {
                    dummy.position.set(
                        x * size - gridSize / 2 + size / 2,
                        0,
                        y * size - gridSize / 2 + size / 2
                    );
                    dummy.updateMatrix();
                    mesh.setMatrixAt(i, dummy.matrix);
                    const gradientScale = 0.17;
                    const center = 1 - dummy.position.length() * gradientScale;
                    colorVec.set(
                        center * weights.x + (1 - weights.x),
                        center * weights.y + (1 - weights.y),
                        center * weights.z + (1 - weights.z)
                    );

                    color.setFromVector3(colorVec);
                    mesh.setColorAt(i, color);
                    i++;
                }
            }

            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();

            scene.add(mesh);

            const vertexHead = `

  uniform float uTime;
  mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

  void main(){
`;
            const projectVertex = `
        vec4 position = instanceMatrix[3];
        float toCenter = length(position.xz);

        // transformed = rotate(transformed, vec3(0., 1., 1. ),  uTime + toCenter * 0.4 );

        transformed.y += sin(uTime * 2. + toCenter) * 0.3;

        // Code goes above this
        vec4 mvPosition = vec4( transformed, 1.0 );

        #ifdef USE_INSTANCING

          mvPosition = instanceMatrix * mvPosition;

        #endif

        mvPosition = modelViewMatrix * mvPosition;

        gl_Position = projectionMatrix * mvPosition;
`;
            const uniforms = {
                uTime: { value: 0 },
            };

            mesh.material.onBeforeCompile = shader => {
                shader.vertexShader = shader.vertexShader.replace(
                    "void main() {",
                    vertexHead
                );
                shader.vertexShader = shader.vertexShader.replace(
                    "#include <project_vertex>",
                    projectVertex
                );
                shader.uniforms.uTime = uniforms.uTime;
                mesh.material.userData.shader = shader;
            };

            mesh.customDepthMaterial = new THREE.MeshDepthMaterial({});
            mesh.customDepthMaterial!.onBeforeCompile = shader => {
                shader.vertexShader = shader.vertexShader.replace(
                    "void main() {",
                    vertexHead
                );
                shader.vertexShader = shader.vertexShader.replace(
                    "#include <project_vertex>",
                    projectVertex
                );
                shader.uniforms.uTime = uniforms.uTime;
            };
            (mesh.customDepthMaterial as THREE.MeshDepthMaterial).depthPacking =
                THREE.RGBADepthPacking;

            const clock = new THREE.Clock();
            const animate = () => {
                requestAnimationFrame(animate);

                if (mesh.material.userData.shader) {
                    mesh.material.userData.shader.uniforms.uTime.value =
                        clock.getElapsedTime();
                }

                renderer.render(scene, camera);
            };

            animate();
        }
    }, []);

    return <VanillaCanvas ref={canvasRef} />;
};

export default Sketch;
