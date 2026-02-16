import {computed, Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: "root"
})
export class GameConfigService {
  readonly seed = signal('Hello, Milo! World is here!');
  readonly numericSeed = computed(() => this.seedToNumbers(this.seed()));

  public seedToNumbers(seed: string): string {
    return Array.from(seed).map(char => {
      // Проверяем, является ли символ цифрой (0–9)
      if (/\d/.test(char)) {
        return char; // оставляем цифру как есть
      } else {
        return char.charCodeAt(0); // заменяем на код
      }
    }).join('');
  }
}
