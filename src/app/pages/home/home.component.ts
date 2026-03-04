import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  glow: number;
}

interface SymbolSprite {
  glyph: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedY: number;
  drift: number;
  phase: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('backgroundCanvas', { static: true })
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly particles: Particle[] = [];
  private readonly symbols: SymbolSprite[] = [];
  private readonly symbolGlyphs = ['π', 'Σ', '√', '∞'];
  private frameId = 0;
  private ctx!: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private time = 0;

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    const context = this.canvasRef.nativeElement.getContext('2d');
    if (!context) {
      return;
    }

    this.ctx = context;
    this.resizeCanvas();
    this.seedParticles();
    this.seedSymbols();

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize, { passive: true });
      this.animate();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
  }

  private readonly onResize = (): void => {
    this.resizeCanvas();
    this.seedParticles();
  };

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.width = canvas.clientWidth || window.innerWidth;
    this.height = canvas.clientHeight || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(this.width * this.dpr);
    canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private seedParticles(): void {
    const count = Math.max(60, Math.floor((this.width * this.height) / 17000));
    this.particles.length = 0;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.8 + 0.7,
        glow: Math.random() * 0.7 + 0.3
      });
    }
  }

  private seedSymbols(): void {
    this.symbols.length = 0;
    for (let i = 0; i < 8; i++) {
      this.symbols.push(this.createSymbol(Math.random() * this.width, Math.random() * this.height));
    }
  }

  private createSymbol(x: number, y: number): SymbolSprite {
    return {
      glyph: this.symbolGlyphs[Math.floor(Math.random() * this.symbolGlyphs.length)],
      x,
      y,
      size: Math.random() * 16 + 14,
      opacity: Math.random() * 0.17 + 0.05,
      speedY: Math.random() * 0.18 + 0.08,
      drift: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2
    };
  }

  private animate = (): void => {
    this.time += 0.008;
    this.renderFrame();
    this.frameId = requestAnimationFrame(this.animate);
  };

  private renderFrame(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const baseGradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    baseGradient.addColorStop(0, '#0a0f25');
    baseGradient.addColorStop(0.55, '#121d44');
    baseGradient.addColorStop(1, '#1a2258');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawWaves();
    this.updateParticles();
    this.drawConnections();
    this.drawSymbols();
  }

  private updateParticles(): void {
    const ctx = this.ctx;

    for (const particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) {
        particle.x = this.width + 10;
      } else if (particle.x > this.width + 10) {
        particle.x = -10;
      }

      if (particle.y < -10) {
        particle.y = this.height + 10;
      } else if (particle.y > this.height + 10) {
        particle.y = -10;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(102, 229, 255, ${0.35 * particle.glow})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(102, 229, 255, 0.3)';
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  private drawConnections(): void {
    const ctx = this.ctx;
    const maxDistance = 120;

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.22;
          ctx.strokeStyle = `rgba(125, 152, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  private drawWaves(): void {
    const ctx = this.ctx;
    const waveConfigs = [
      { amp: 24, freq: 0.012, speed: 0.8, y: this.height * 0.35, alpha: 0.08 },
      { amp: 36, freq: 0.009, speed: 0.55, y: this.height * 0.58, alpha: 0.1 },
      { amp: 18, freq: 0.014, speed: 1.1, y: this.height * 0.75, alpha: 0.06 }
    ];

    for (const wave of waveConfigs) {
      ctx.beginPath();
      for (let x = 0; x <= this.width; x += 8) {
        const y = wave.y + Math.sin(x * wave.freq + this.time * wave.speed) * wave.amp;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = `rgba(102, 229, 255, ${wave.alpha})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
  }

  private drawSymbols(): void {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const symbol of this.symbols) {
      symbol.y -= symbol.speedY;
      symbol.phase += 0.012;
      symbol.x += Math.sin(symbol.phase) * symbol.drift;

      if (symbol.y < -32) {
        Object.assign(symbol, this.createSymbol(Math.random() * this.width, this.height + 24));
      }

      ctx.font = `${symbol.size}px Montserrat, sans-serif`;
      ctx.fillStyle = `rgba(170, 215, 255, ${symbol.opacity})`;
      ctx.fillText(symbol.glyph, symbol.x, symbol.y);
    }
  }
}
