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
  pulse: number;
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
    this.seedSymbols();
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
    const count = Math.max(90, Math.floor((this.width * this.height) / 12000));
    this.particles.length = 0;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 2 + 0.8,
        glow: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  private seedSymbols(): void {
    this.symbols.length = 0;
    for (let i = 0; i < 10; i++) {
      this.symbols.push(this.createSymbol(Math.random() * this.width, Math.random() * this.height));
    }
  }

  private createSymbol(x: number, y: number): SymbolSprite {
    return {
      glyph: this.symbolGlyphs[Math.floor(Math.random() * this.symbolGlyphs.length)],
      x,
      y,
      size: Math.random() * 20 + 16,
      opacity: Math.random() * 0.18 + 0.08,
      speedY: Math.random() * 0.22 + 0.1,
      drift: Math.random() * 0.7 + 0.25,
      phase: Math.random() * Math.PI * 2
    };
  }

  private animate = (): void => {
    this.time += 0.012;
    this.renderFrame();
    this.frameId = requestAnimationFrame(this.animate);
  };

  private renderFrame(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const baseGradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    baseGradient.addColorStop(0, '#0a0f25');
    baseGradient.addColorStop(0.45, '#16214e');
    baseGradient.addColorStop(1, '#1f2560');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawAuroraGlow();
    this.drawWaves();
    this.updateParticles();
    this.drawConnections();
    this.drawSymbols();
  }

  private drawAuroraGlow(): void {
    const ctx = this.ctx;
    const x = this.width * (0.5 + Math.sin(this.time * 0.25) * 0.18);
    const y = this.height * (0.42 + Math.cos(this.time * 0.2) * 0.08);
    const glow = ctx.createRadialGradient(x, y, 20, x, y, this.width * 0.5);
    glow.addColorStop(0, 'rgba(90, 130, 255, 0.24)');
    glow.addColorStop(0.55, 'rgba(75, 95, 240, 0.1)');
    glow.addColorStop(1, 'rgba(10, 15, 37, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private updateParticles(): void {
    const ctx = this.ctx;

    for (const particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.pulse += 0.03;

      if (particle.x < -14) {
        particle.x = this.width + 14;
      } else if (particle.x > this.width + 14) {
        particle.x = -14;
      }

      if (particle.y < -14) {
        particle.y = this.height + 14;
      } else if (particle.y > this.height + 14) {
        particle.y = -14;
      }

      const pulseFactor = 0.75 + Math.sin(particle.pulse) * 0.25;
      const radius = particle.radius * pulseFactor;
      const alpha = (0.3 + particle.glow * 0.45) * pulseFactor;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(98, 233, 255, ${alpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(98, 233, 255, 0.45)';
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  private drawConnections(): void {
    const ctx = this.ctx;
    const maxDistance = 150;

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.34;
          ctx.strokeStyle = `rgba(116, 149, 255, ${alpha})`;
          ctx.lineWidth = 1;
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
      { amp: 28, freq: 0.013, speed: 0.9, y: this.height * 0.32, alpha: 0.11 },
      { amp: 40, freq: 0.009, speed: 0.62, y: this.height * 0.56, alpha: 0.13 },
      { amp: 22, freq: 0.016, speed: 1.2, y: this.height * 0.76, alpha: 0.09 }
    ];

    for (const wave of waveConfigs) {
      ctx.beginPath();
      for (let x = 0; x <= this.width; x += 7) {
        const y = wave.y + Math.sin(x * wave.freq + this.time * wave.speed) * wave.amp;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = `rgba(98, 233, 255, ${wave.alpha})`;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }
  }

  private drawSymbols(): void {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const symbol of this.symbols) {
      symbol.y -= symbol.speedY;
      symbol.phase += 0.016;
      symbol.x += Math.sin(symbol.phase) * symbol.drift;

      if (symbol.y < -40) {
        Object.assign(symbol, this.createSymbol(Math.random() * this.width, this.height + 30));
      }

      ctx.font = `${symbol.size}px Montserrat, sans-serif`;
      ctx.fillStyle = `rgba(173, 222, 255, ${symbol.opacity})`;
      ctx.fillText(symbol.glyph, symbol.x, symbol.y);
    }
  }
}
