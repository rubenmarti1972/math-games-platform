import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AmbientLight,
  CanvasTexture,
  CircleGeometry,
  Clock,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type PortalRoute = '/games/othello' | '/games/panda4x4' | '/games/colores';

interface PortalTarget {
  mesh: Mesh;
  route: PortalRoute;
}

@Component({
  selector: 'app-world3d',
  standalone: true,
  templateUrl: './world3d.component.html',
  styleUrl: './world3d.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class World3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('worldCanvas', { static: true })
  private readonly worldCanvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(60, 1, 0.1, 250);
  private renderer?: WebGLRenderer;
  private controls?: OrbitControls;
  private animationFrameId?: number;
  private readonly clock = new Clock();

  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly portalTargets: PortalTarget[] = [];
  private readonly floatingObjects: Group[] = [];
  private readonly particleSystems: Points[] = [];

  constructor(
    private readonly router: Router,
    private readonly ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    const canvas = this.worldCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    this.initializeRenderer(canvas);
    this.initializeCamera();
    this.buildWorld();
    this.attachListeners(canvas);
    this.startAnimationLoop();
  }

  ngOnDestroy(): void {
    const canvas = this.worldCanvasRef?.nativeElement;

    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }

    canvas?.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('resize', this.resize);

    this.controls?.dispose();
    this.renderer?.dispose();
  }

  private initializeRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor('#050814');
    this.resize();
  }

  private initializeCamera(): void {
    this.camera.position.set(0, 15, 28);
    this.camera.lookAt(0, 0, 0);
  }

  private buildWorld(): void {
    this.scene.background = new Color('#050814');

    const ambient = new AmbientLight('#93c5fd', 0.55);
    this.scene.add(ambient);

    const directional = new DirectionalLight('#fff7d6', 1.1);
    directional.position.set(22, 28, 8);
    this.scene.add(directional);

    const skyDome = new Mesh(
      new SphereGeometry(140, 32, 32),
      new MeshBasicMaterial({ color: '#101c3d', side: 1, fog: false })
    );
    skyDome.scale.set(-1, 1, 1);
    this.scene.add(skyDome);

    this.createIslands();
    this.createFloatingMathSymbols();
    this.createParticles();
  }

  private createIslands(): void {
    this.createIsland({
      name: 'Strategy Island',
      position: new Vector3(-10, 1, 0),
      portalColor: '#34d399',
      route: '/games/othello'
    });

    this.createIsland({
      name: 'Logic Island',
      position: new Vector3(0, 2.5, -8),
      portalColor: '#60a5fa',
      route: '/games/panda4x4'
    });

    this.createIsland({
      name: 'Color Island',
      position: new Vector3(11, 1.4, 2),
      portalColor: '#f472b6',
      route: '/games/colores'
    });
  }

  private createIsland(config: {
    name: string;
    position: Vector3;
    portalColor: string;
    route: PortalRoute;
  }): void {
    const island = new Group();
    island.position.copy(config.position);

    const base = new Mesh(
      new CylinderGeometry(4.8, 6.4, 2.8, 22),
      new MeshStandardMaterial({ color: '#273449', roughness: 0.92, metalness: 0.04 })
    );
    base.position.y = -0.8;

    const top = new Mesh(
      new CircleGeometry(4.7, 24),
      new MeshStandardMaterial({ color: '#1f9d57', roughness: 0.8, metalness: 0 })
    );
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.6;

    const portal = new Mesh(
      new TorusGeometry(1.2, 0.22, 18, 48),
      new MeshBasicMaterial({ color: config.portalColor })
    );
    portal.position.set(0, 2.2, 0);
    portal.rotation.x = Math.PI / 2;

    const portalCore = new Mesh(
      new RingGeometry(0.46, 1.01, 42),
      new MeshBasicMaterial({ color: config.portalColor, transparent: true, opacity: 0.45, side: 2 })
    );
    portalCore.position.copy(portal.position);
    portalCore.rotation.x = Math.PI / 2;

    const label = this.createLabelSprite(config.name, config.portalColor);
    label.position.set(0, 4.25, 0);

    island.add(base, top, portal, portalCore, label);

    this.portalTargets.push({ mesh: portal, route: config.route });
    this.floatingObjects.push(island);
    this.scene.add(island);
  }

  private createLabelSprite(text: string, color: string): Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (!context) {
      return new Sprite();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(5, 8, 20, 0.65)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = color;
    context.lineWidth = 6;
    context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

    context.font = '700 44px "Inter", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#eef2ff';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new CanvasTexture(canvas);
    const material = new SpriteMaterial({ map: texture, transparent: true });
    const sprite = new Sprite(material);
    sprite.scale.set(7, 1.75, 1);

    return sprite;
  }

  private createFloatingMathSymbols(): void {
    const symbols = ['π', '∑', '√', '∞'];

    symbols.forEach((symbol, index) => {
      const sprite = this.createLabelSprite(symbol, '#c4b5fd');
      sprite.scale.set(2.5, 2.5, 1);
      sprite.position.set(-12 + index * 8, 9 + Math.sin(index) * 2, -6 + index * 2);

      const wrapper = new Group();
      wrapper.add(sprite);

      const orbitShape = new Mesh(
        new SphereGeometry(0.55 + Math.random() * 0.45, 14, 14),
        new MeshStandardMaterial({ color: '#475569', roughness: 0.35, metalness: 0.1 })
      );
      orbitShape.position.set(1.4, -1, 0);
      wrapper.add(orbitShape);

      this.floatingObjects.push(wrapper);
      this.scene.add(wrapper);
    });

    const runway = new Mesh(
      new PlaneGeometry(130, 130),
      new MeshBasicMaterial({ color: '#060913', transparent: true, opacity: 0.68 })
    );
    runway.rotation.x = -Math.PI / 2;
    runway.position.y = -6;
    this.scene.add(runway);
  }

  private createParticles(): void {
    const geometry = new SphereGeometry(1, 1, 1);
    const material = new PointsMaterial({ color: '#93c5fd', size: 0.08, transparent: true, opacity: 0.8 });
    const points = new Points(geometry, material);
    points.scale.set(42, 20, 42);
    this.particleSystems.push(points);
    this.scene.add(points);
  }

  private attachListeners(canvas: HTMLCanvasElement): void {
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = true;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 48;
    this.controls.maxPolarAngle = Math.PI / 2.1;

    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', this.resize);
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    const canvas = this.worldCanvasRef?.nativeElement;
    if (!canvas || !this.renderer) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersections = this.raycaster.intersectObjects(this.portalTargets.map((entry) => entry.mesh), false);
    const hitPortal = intersections.at(0)?.object;
    if (!hitPortal) {
      return;
    }

    const target = this.portalTargets.find((entry) => entry.mesh === hitPortal);
    if (!target) {
      return;
    }

    void this.ngZone.run(() => this.router.navigateByUrl(target.route));
  };

  private readonly resize = (): void => {
    const canvas = this.worldCanvasRef?.nativeElement;
    if (!canvas || !this.renderer) {
      return;
    }

    const host = canvas.parentElement;
    const width = host?.clientWidth ?? window.innerWidth;
    const height = host?.clientHeight ?? window.innerHeight;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  };

  private startAnimationLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const animate = (): void => {
        const elapsed = this.clock.getElapsedTime();

        this.floatingObjects.forEach((item, index) => {
          item.position.y += Math.sin(elapsed * 1.1 + index) * 0.004;
          item.rotation.y += 0.0025 + index * 0.0002;
          item.rotation.z = Math.sin(elapsed * 0.35 + index) * 0.05;
        });

        this.portalTargets.forEach((target, index) => {
          target.mesh.rotation.z += 0.03;
          target.mesh.scale.setScalar(1 + Math.sin(elapsed * 2 + index) * 0.04);
        });

        this.particleSystems.forEach((system, index) => {
          system.rotation.y += 0.0007 + index * 0.0001;
          system.rotation.x = MathUtils.lerp(system.rotation.x, Math.sin(elapsed * 0.2) * 0.08, 0.04);
        });

        this.controls?.update();
        this.renderer?.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    });
  }
}
