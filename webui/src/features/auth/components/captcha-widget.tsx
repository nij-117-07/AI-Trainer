// src/features/auth/components/captcha-widget.tsx
/**
 * Client component for CSS-distorted text CAPTCHA.
 * Fetches a code from the server, renders it with per-character distortion,
 * and provides an input for the user's response.
 */

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { fetchCaptcha } from '../actions/captcha';

const COLORS = ['#2563eb', '#9333ea', '#0891b2', '#be123c', '#ca8a04', '#16a34a'];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface CharStyle {
  rotation: number;
  color: string;
  offsetY: number;
  fontSize: number;
}

function generateCharStyles(code: string): CharStyle[] {
  return code.split('').map((_, i) => ({
    rotation: Math.round((pseudoRandom(i * 7 + 1) - 0.5) * 40),
    color: COLORS[Math.floor(pseudoRandom(i * 13 + 3) * COLORS.length)],
    offsetY: Math.round((pseudoRandom(i * 11 + 5) - 0.5) * 6),
    fontSize: 26 + Math.round((pseudoRandom(i * 17 + 9) - 0.5) * 8),
  }));
}

function generateNoiseLines(seed: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const s = seed * 31 + i * 7;
    lines.push({
      x1: pseudoRandom(s) * 200,
      y1: pseudoRandom(s + 1) * 50,
      x2: 40 + pseudoRandom(s + 2) * 160,
      y2: pseudoRandom(s + 3) * 50,
    });
  }
  return lines;
}

interface CaptchaWidgetProps {
  name?: string;
}

export function CaptchaWidget({ name = 'captcha' }: CaptchaWidgetProps) {
  const [code, setCode] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [seed, setSeed] = useState(() => Math.random() * 10000);

  function loadCaptcha() {
    setValue('');
    setSeed(Math.random() * 10000);
    setLoading(true);
    fetchCaptcha().then((newCode) => {
      setCode(newCode);
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchCaptcha().then((newCode) => {
      setCode(newCode);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = value;
    }
  }, [value]);

  const charStyles = useMemo(() => generateCharStyles(code), [code]);
  const noiseLines = useMemo(() => generateNoiseLines(seed), [seed]);

  return (
    <div className="space-y-2">
      <Label>Enter the code below</Label>
      <div className="relative overflow-hidden rounded-md border bg-white px-4 py-3 select-none">
        {loading ? (
          <div className="h-9 flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="relative flex items-center justify-center gap-0.5 h-9">
              {code.split('').map((char, i) => (
                <span
                  key={i}
                  className="inline-block font-bold tracking-widest"
                  style={{
                    transform: `rotate(${charStyles[i].rotation}deg) translateY(${charStyles[i].offsetY}px)`,
                    color: charStyles[i].color,
                    fontSize: `${charStyles[i].fontSize}px`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 200 50"
              preserveAspectRatio="none"
            >
              {noiseLines.map((line, i) => (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              ))}
            </svg>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type the code"
          disabled={loading}
          className="flex-1 uppercase"
          maxLength={6}
          autoComplete="off"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={loadCaptcha}
          disabled={loading}
          title="Refresh code"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <input ref={hiddenRef} type="hidden" name={name} value={value} />
    </div>
  );
}
