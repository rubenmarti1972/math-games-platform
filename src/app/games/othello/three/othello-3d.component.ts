import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Subscription } from 'rxjs';
import { CellState, GameService } from '../services/game.service';

interface FlipAnimation {
  piece: any;
  to: CellState;
  start: number;
  duration: number;
  switched: boolean;
}

@Component({
  selector: 'app-othello-3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './othello-3d.component.html',
  styleUrls: ['./othello-3d.component.scss'],
})
export class Othello3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true })
  private canvasContainerRef!: ElementRef<HTMLDivElement>;

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  private controls!: any;

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();

  private boardSize = 8;
  private readonly cellSize = 1;

  private tileGroup = new THREE.Group();
  private pieceGroup = new THREE.Group();
  private propsGroup = new THREE.Group();
  private tileMeshes: any[] = [];
  private pieceMeshes = new Map<string, any>();

  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;
  private boardSubscription?: Subscription;

  private previousBoard: CellState[][] = [];
  private activeFlips: FlipAnimation[] = [];

  private readonly tileGeometry = new THREE.BoxGeometry(0.95, 0.18, 0.95);
  private readonly pedestalGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 28);
  private readonly bodyGeometry = new THREE.CylinderGeometry(0.2, 0.24, 0.3, 18);
  private readonly headGeometry = new THREE.SphereGeometry(0.14, 18, 14);
  private readonly hatGeometry = new THREE.ConeGeometry(0.16, 0.22, 16);
  private readonly strawHatGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16);
  private readonly backpackGeometry = new THREE.BoxGeometry(0.12, 0.16, 0.09);

  private readonly tileMaterialA = new THREE.MeshStandardMaterial({ color: 0x295c3f, roughness: 0.68, metalness: 0.08 });
  private readonly tileMaterialB = new THREE.MeshStandardMaterial({ color: 0x225136, roughness: 0.68, metalness: 0.08 });
  private readonly blackPedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x2f2419, roughness: 0.45, metalness: 0.12 });
  private readonly whitePedestalMaterial = new THREE.MeshStandardMaterial({ color: 0xe4cfab, roughness: 0.4, metalness: 0.06 });
  private readonly dualPedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.38, metalness: 0.22 });

  private readonly darkFarmerBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5, metalness: 0.08 });
  private readonly darkFarmerHeadMaterial = new THREE.MeshStandardMaterial({ color: 0xf3cfa4, roughness: 0.65, metalness: 0.03 });
  private readonly darkFarmerHatMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.25 });
  private readonly darkFarmerPackMaterial = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.6, metalness: 0.05 });

  private readonly lightFarmerBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.5, metalness: 0.08 });
  private readonly lightFarmerHeadMaterial = new THREE.MeshStandardMaterial({ color: 0xffddb8, roughness: 0.65, metalness: 0.03 });
  private readonly lightFarmerHatMaterial = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.52, metalness: 0.07 });
  private readonly lightFarmerPackMaterial = new THREE.MeshStandardMaterial({ color: 0x075985, roughness: 0.6, metalness: 0.05 });

  private readonly propWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x7c4a26, roughness: 0.75, metalness: 0.02 });
  private readonly propGrassMaterial = new THREE.MeshStandardMaterial({ color: 0x3f7c36, roughness: 0.8, metalness: 0.01 });
  private readonly propFlagMaterialDark = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6, metalness: 0.04 });
  private readonly propFlagMaterialLight = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.6, metalness: 0.04 });

  constructor(private readonly gameService: GameService, private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.initThree();
    this.subscribeToBoard();
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy(): void {
    this.boardSubscription?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.canvasContainerRef.nativeElement.removeEventListener('pointerdown', this.onPointerDown);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.controls?.dispose();
    this.renderer.dispose();

    [
      this.tileGeometry,
      this.pedestalGeometry,
      this.bodyGeometry,
      this.headGeometry,
      this.hatGeometry,
      this.strawHatGeometry,
      this.backpackGeometry,
    ].forEach((geometry) => geometry.dispose());

    [
      this.tileMaterialA,
      this.tileMaterialB,
      this.blackPedestalMaterial,
      this.whitePedestalMaterial,
      this.dualPedestalMaterial,
      this.darkFarmerBodyMaterial,
      this.darkFarmerHeadMaterial,
      this.darkFarmerHatMaterial,
      this.darkFarmerPackMaterial,
      this.lightFarmerBodyMaterial,
      this.lightFarmerHeadMaterial,
      this.lightFarmerHatMaterial,
      this.lightFarmerPackMaterial,
      this.propWoodMaterial,
      this.propGrassMaterial,
      this.propFlagMaterialDark,
      this.propFlagMaterialLight,
    ].forEach((material) => material.dispose());
  }

  private initThree(): void {
    const container = this.canvasContainerRef.nativeElement;

    this.scene.background = new THREE.Color(0x0b1220);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 8.8, 8.2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.4;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2.04;
    this.controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(8, 12, 7);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.35);
    rimLight.position.set(-10, 6, -7);

    this.scene.add(ambientLight, directionalLight, rimLight, this.tileGroup, this.pieceGroup, this.propsGroup);

    container.addEventListener('pointerdown', this.onPointerDown);

    this.resizeObserver = new ResizeObserver(() => this.resizeRenderer());
    this.resizeObserver.observe(container);
    this.resizeRenderer();
  }

  private subscribeToBoard(): void {
    this.boardSubscription = this.gameService.board$.subscribe((board) => {
      if (!board.length || !board[0]?.length) {
        return;
      }

      const nextSize = board.length;
      if (nextSize !== this.boardSize || this.tileMeshes.length === 0) {
        this.boardSize = nextSize;
        this.buildTiles();
        this.buildConquestProps();
      }

      this.updatePieces(board);
      this.previousBoard = board.map((row) => [...row]);
    });
  }

  private buildTiles(): void {
    this.tileGroup.clear();
    this.tileMeshes = [];

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const material = (row + col) % 2 === 0 ? this.tileMaterialA : this.tileMaterialB;
        const tile = new THREE.Mesh(this.tileGeometry, material);
        tile.position.set(this.toBoardX(col), 0, this.toBoardZ(row));
        tile.userData = { row, col };
        this.tileGroup.add(tile);
        this.tileMeshes.push(tile);
      }
    }

    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private buildConquestProps(): void {
    this.propsGroup.clear();

    const half = (this.boardSize - 1) / 2;
    const ringDistance = (half + 1.25) * this.cellSize;

    const createFence = (x: number, z: number, rotationY: number): void => {
      const postGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.45, 8);
      const railGeometry = new THREE.BoxGeometry(0.42, 0.04, 0.05);

      const fence = new THREE.Group();
      for (const offset of [-0.16, 0.16]) {
        const post = new THREE.Mesh(postGeometry, this.propWoodMaterial);
        post.position.set(offset, 0.2, 0);
        fence.add(post);
      }

      const railTop = new THREE.Mesh(railGeometry, this.propWoodMaterial);
      railTop.position.set(0, 0.3, 0);
      const railBottom = new THREE.Mesh(railGeometry, this.propWoodMaterial);
      railBottom.position.set(0, 0.15, 0);
      fence.add(railTop, railBottom);

      fence.position.set(x, 0, z);
      fence.rotation.y = rotationY;
      this.propsGroup.add(fence);
    };

    const createFlag = (x: number, z: number, isDark: boolean): void => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.8, 10), this.propWoodMaterial);
      pole.position.y = 0.4;

      const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.02), isDark ? this.propFlagMaterialDark : this.propFlagMaterialLight);
      cloth.position.set(0.14, 0.63, 0);

      const patch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16), this.propGrassMaterial);
      patch.rotation.x = Math.PI / 2;
      patch.position.y = 0.02;

      const flag = new THREE.Group();
      flag.add(pole, cloth, patch);
      flag.position.set(x, 0, z);
      this.propsGroup.add(flag);
    };

    const createCropCrate = (x: number, z: number): void => {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.35), this.propWoodMaterial);
      crate.position.set(x, 0.1, z);

      const crop = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), this.propGrassMaterial);
      crop.position.set(x - 0.08, 0.26, z - 0.05);
      const crop2 = crop.clone();
      crop2.position.set(x + 0.08, 0.26, z + 0.06);

      this.propsGroup.add(crate, crop, crop2);
    };

    for (let i = -half; i <= half; i += 1) {
      createFence(i, ringDistance, 0);
      createFence(i, -ringDistance, 0);
      createFence(ringDistance, i, Math.PI / 2);
      createFence(-ringDistance, i, Math.PI / 2);
    }

    createFlag(ringDistance + 0.4, 0.8, true);
    createFlag(-ringDistance - 0.4, -0.7, false);
    createCropCrate(ringDistance - 0.2, -ringDistance + 0.2);
    createCropCrate(-ringDistance + 0.2, ringDistance - 0.2);
  }

  private updatePieces(board: CellState[][]): void {
    const activeKeys = new Set<string>();

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const state = board[row][col];
        const key = `${row},${col}`;

        if (state === 'empty') {
          this.removePiece(key);
          continue;
        }

        activeKeys.add(key);

        const existing = this.pieceMeshes.get(key);
        if (!existing) {
          const piece = this.createCharacterPiece(state);
          piece.position.set(this.toBoardX(col), 0.12, this.toBoardZ(row));
          this.pieceGroup.add(piece);
          this.pieceMeshes.set(key, piece);
          continue;
        }

        const previous = this.previousBoard[row]?.[col] ?? 'empty';
        if (previous !== state) {
          this.queueFlip(existing, previous, state);
        }
      }
    }

    Array.from(this.pieceMeshes.keys()).forEach((key) => {
      if (!activeKeys.has(key)) {
        this.removePiece(key);
      }
    });
  }

  private createCharacterPiece(state: CellState): any {
    const root = new THREE.Group();

    const pedestal = new THREE.Mesh(this.pedestalGeometry, this.materialForPedestal(state));
    pedestal.rotation.x = Math.PI / 2;
    pedestal.position.y = 0.04;
    pedestal.userData = { role: 'pedestal' };

    const body = new THREE.Mesh(this.bodyGeometry, this.darkFarmerBodyMaterial);
    body.position.y = 0.23;
    body.userData = { role: 'body' };

    const head = new THREE.Mesh(this.headGeometry, this.darkFarmerHeadMaterial);
    head.position.y = 0.47;
    head.userData = { role: 'head' };

    const hat = new THREE.Mesh(this.hatGeometry, this.darkFarmerHatMaterial);
    hat.position.y = 0.62;
    hat.userData = { role: 'hat' };

    const backpack = new THREE.Mesh(this.backpackGeometry, this.darkFarmerPackMaterial);
    backpack.position.set(0, 0.27, -0.15);
    backpack.userData = { role: 'pack' };

    root.add(pedestal, body, head, hat, backpack);
    root.userData = { state };

    this.applyCharacterStyle(root, state);
    return root;
  }

  private queueFlip(piece: any, from: CellState, to: CellState): void {
    if (from === 'empty' || to === 'empty') {
      this.applyCharacterStyle(piece, to);
      return;
    }

    this.activeFlips = this.activeFlips.filter((flip) => flip.piece !== piece);
    this.activeFlips.push({
      piece,
      to,
      start: performance.now(),
      duration: 420,
      switched: false,
    });
  }

  private applyCharacterStyle(piece: any, state: CellState): void {
    piece.userData.state = state;

    piece.children.forEach((part: any) => {
      switch (part.userData.role) {
        case 'pedestal':
          part.material = this.materialForPedestal(state);
          break;
        case 'body':
          part.material = state === 'white' ? this.lightFarmerBodyMaterial : this.darkFarmerBodyMaterial;
          break;
        case 'head':
          part.material = state === 'white' ? this.lightFarmerHeadMaterial : this.darkFarmerHeadMaterial;
          break;
        case 'hat':
          part.geometry = state === 'white' ? this.strawHatGeometry : this.hatGeometry;
          part.material = state === 'white' ? this.lightFarmerHatMaterial : this.darkFarmerHatMaterial;
          part.position.y = state === 'white' ? 0.58 : 0.62;
          break;
        case 'pack':
          part.material = state === 'white' ? this.lightFarmerPackMaterial : this.darkFarmerPackMaterial;
          break;
        default:
          break;
      }
    });

    if (state === 'dual') {
      const body = piece.children.find((part: any) => part.userData.role === 'body');
      if (body) {
        body.material = this.dualPedestalMaterial;
      }
    }
  }

  private materialForPedestal(state: CellState): any {
    switch (state) {
      case 'black':
        return this.blackPedestalMaterial;
      case 'white':
        return this.whitePedestalMaterial;
      case 'dual':
        return this.dualPedestalMaterial;
      default:
        return this.blackPedestalMaterial;
    }
  }

  private removePiece(key: string): void {
    const piece = this.pieceMeshes.get(key);
    if (!piece) {
      return;
    }

    this.activeFlips = this.activeFlips.filter((flip) => flip.piece !== piece);
    this.pieceGroup.remove(piece);
    this.pieceMeshes.delete(key);
  }

  private animate = (): void => {
    const now = performance.now();

    if (this.activeFlips.length > 0) {
      this.activeFlips = this.activeFlips.filter((flip) => {
        const elapsed = now - flip.start;
        const progress = Math.min(elapsed / flip.duration, 1);

        flip.piece.rotation.x = Math.PI * progress;

        if (!flip.switched && progress >= 0.5) {
          this.applyCharacterStyle(flip.piece, flip.to);
          flip.switched = true;
        }

        if (progress >= 1) {
          flip.piece.rotation.x = 0;
          return false;
        }

        return true;
      });
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private resizeRenderer(): void {
    const container = this.canvasContainerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) {
      return;
    }

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private onPointerDown = (event: PointerEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const [hit] = this.raycaster.intersectObjects(this.tileMeshes, false);

    if (!hit) {
      return;
    }

    const { row, col } = hit.object.userData as { row: number; col: number };
    this.zone.run(() => this.gameService.tryMove(row, col));
  };

  private toBoardX(col: number): number {
    return (col - (this.boardSize - 1) / 2) * this.cellSize;
  }

  private toBoardZ(row: number): number {
    return (row - (this.boardSize - 1) / 2) * this.cellSize;
  }
}
