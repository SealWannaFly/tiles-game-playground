import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SeedService {
  private readonly _seed = signal('Hello, Milo! World is here!');
  private readonly _params = { a: 1664525, c: 1013904223, m: 4294967296 };

  private _state = 0;

  public seed = this._seed.asReadonly();
  public numericSeed = computed(() => this.seedToNumbers(this.seed()));

  public setSeed(seed: string) {
    this._seed.set(seed);
    this.resetSeed();
  }
  public resetSeed(): void {
    this._state = this.numericSeed();
  }

  // Основной метод получения случайного числа [0, 1)
  public random(): number {
    this._state = (this._state * this._params.a + this._params.c) % this._params.m;

    return this._state / this._params.m;
  }

  // Случайное целое число в диапазоне [min, max]
  public randomIntInRange(min: number, max: number) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // Случайное число с плавающей точкой в диапазоне [min, max)
  public randomFloatInRange(min: number, max: number) {
    return this.random() * (max - min) + min;
  }

  private seedToNumbers(seed: string): number {
    const numericString = Array.from(seed)
      .map((char) => {
        // Проверяем, является ли символ цифрой (0–9)
        if (/\d/.test(char)) {
          return char; // оставляем цифру как есть
        } else {
          return char.charCodeAt(0); // заменяем на код
        }
      })
      .join('');

    console.log('numericString = ', numericString);
    console.log('numeric = ', +numericString.slice(0, 15));
    console.log('');

    return +numericString.slice(0, 15);
  }
}
