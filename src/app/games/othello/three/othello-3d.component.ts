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
  mesh: any;
  from: CellState;
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
  private tileMeshes: any[] = [];
  private pieceMeshes = new Map<string, any>();

  private animationFrameId?: number;
  private resizeObserver?: ResizeObserver;
  private boardSubscription?: Subscription;

  private previousBoard: CellState[][] = [];
  private activeFlips: FlipAnimation[] = [];

  private readonly tileGeometry = new THREE.BoxGeometry(0.95, 0.18, 0.95);
  private readonly pieceGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 36);

  private readonly tileMaterialA = new THREE.MeshStandardMaterial({ color: 0x1d4f37, roughness: 0.65, metalness: 0.1 });
  private readonly tileMaterialB = new THREE.MeshStandardMaterial({ color: 0x1a3f2d, roughness: 0.65, metalness: 0.1 });
  private readonly blackPieceMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.35 });
  private readonly whitePieceMaterial = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.2 });
  private readonly dualPieceMaterial = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.35, metalness: 0.25 });

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
    this.tileGeometry.dispose();
    this.pieceGeometry.dispose();
    this.tileMaterialA.dispose();
    this.tileMaterialB.dispose();
    this.blackPieceMaterial.dispose();
    this.whitePieceMaterial.dispose();
    this.dualPieceMaterial.dispose();
  }

  private initThree(): void {
    const container = this.canvasContainerRef.nativeElement;

    this.scene.background = new THREE.Color(0x070b14);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 8.2, 8.6);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.45;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.95);
    directionalLight.position.set(8, 12, 6);

    this.scene.add(ambientLight, directionalLight, this.tileGroup, this.pieceGroup);

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
          const mesh = new THREE.Mesh(this.pieceGeometry, this.materialForState(state));
          mesh.position.set(this.toBoardX(col), 0.16, this.toBoardZ(row));
          mesh.rotation.x = Math.PI / 2;
          this.pieceGroup.add(mesh);
          this.pieceMeshes.set(key, mesh);
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

  private queueFlip(mesh: any, from: CellState, to: CellState): void {
    if (from === 'empty' || to === 'empty') {
      mesh.material = this.materialForState(to);
      return;
    }

    this.activeFlips = this.activeFlips.filter((flip) => flip.mesh !== mesh);
    this.activeFlips.push({
      mesh,
      from,
      to,
      start: performance.now(),
      duration: 360,
      switched: false,
    });
  }

  private removePiece(key: string): void {
    const mesh = this.pieceMeshes.get(key);
    if (!mesh) {
      return;
    }

    this.activeFlips = this.activeFlips.filter((flip) => flip.mesh !== mesh);
    this.pieceGroup.remove(mesh);
    this.pieceMeshes.delete(key);
  }

  private materialForState(state: CellState): any {
    switch (state) {
      case 'black':
        return this.blackPieceMaterial;
      case 'white':
        return this.whitePieceMaterial;
      case 'dual':
        return this.dualPieceMaterial;
      default:
        return this.blackPieceMaterial;
    }
  }

  private animate = (): void => {
    const now = performance.now();

    if (this.activeFlips.length > 0) {
      this.activeFlips = this.activeFlips.filter((flip) => {
        const elapsed = now - flip.start;
        const progress = Math.min(elapsed / flip.duration, 1);

        flip.mesh.rotation.x = Math.PI / 2 + Math.PI * progress;

        if (!flip.switched && progress >= 0.5) {
          flip.mesh.material = this.materialForState(flip.to);
          flip.switched = true;
        }

        if (progress >= 1) {
          flip.mesh.rotation.x = Math.PI / 2;
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
