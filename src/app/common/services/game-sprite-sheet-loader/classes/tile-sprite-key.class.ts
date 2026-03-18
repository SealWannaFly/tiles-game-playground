import { MAP_DIRECTION_ORDER, MapDirection } from '../../../enums/map-direction.enum';

export interface AdjacentTileSprite {
  key: string;
  connections: Map<MapDirection, boolean>;
}

export class TileSpriteKey {
  private static readonly separator = '|';

  private readonly _mainTileKey: string;
  private readonly _adjacentTiles: AdjacentTileSprite[];

  constructor(mainTileKey: string, adjacentTiles: AdjacentTileSprite[] = []) {
    this._mainTileKey = mainTileKey;
    this._adjacentTiles = adjacentTiles;
  }

  public get mainTileKey() {
    return this._mainTileKey;
  }

  /**
   * Добавляет смежный тайл с информацией о соединениях
   */
  addAdjacentTile(key: string, connections: Partial<Record<MapDirection, boolean>>): this {
    const connectionMap = new Map<MapDirection, boolean>();

    // Устанавливаем значения для всех направлений по умолчанию (false)
    MAP_DIRECTION_ORDER.forEach((dir) => {
      connectionMap.set(dir, connections[dir] || false);
    });

    this._adjacentTiles.push({
      key,
      connections: connectionMap,
    });

    return this;
  }

  /**
   * Создает битовую маску соединений для конкретного смежного тайла
   */
  private createConnectionMask(connections: Map<MapDirection, boolean>): string {
    return MAP_DIRECTION_ORDER.reduce((mask, dir) => {
      return (mask += Number(connections.get(dir) || 0));
    }, '');
  }

  /**
   * Генерирует составной ключ
   */
  generateKey(): string {
    const parts: string[] = [this._mainTileKey];

    this._adjacentTiles.forEach((adjacent) => {
      parts.push(adjacent.key);
      parts.push(this.createConnectionMask(adjacent.connections));
    });

    return parts.join(TileSpriteKey.separator);
  }

  /**
   * Статический метод для создания ключа из параметров
   */
  static createKey(
    mainTileKey: string,
    adjacentTiles: Array<{
      key: string;
      connections: Partial<Record<MapDirection, boolean>>;
    }>,
  ): TileSpriteKey {
    const tileSpriteKey = new TileSpriteKey(mainTileKey);

    adjacentTiles.forEach((adjacent) => {
      tileSpriteKey.addAdjacentTile(adjacent.key, adjacent.connections);
    });

    return tileSpriteKey;
  }

  /**
   * Парсит составной ключ обратно в объект
   */
  static parseKey(key: string): {
    mainTileKey: string;
    adjacentTiles: Array<{
      key: string;
      connections: Record<MapDirection, boolean>;
    }>;
  } {
    const parts = key.split(TileSpriteKey.separator);

    if (parts.length < 1) {
      throw new Error('Invalid key format');
    }

    const mainTileKey = parts[0];
    const adjacentTiles = [];

    // Обрабатываем пары (ключ смежного тайла + маска)
    for (let i = 1; i < parts.length; i += 2) {
      if (i + 1 >= parts.length) {
        throw new Error('Invalid key format: incomplete adjacent tile data');
      }

      const adjacentKey = parts[i];
      const mask = parts[i + 1];

      if (mask.length !== MAP_DIRECTION_ORDER.length) {
        throw new Error(
          `Invalid mask length. Expected ${MAP_DIRECTION_ORDER.length}, got ${mask.length}`,
        );
      }

      const connections: Record<MapDirection, boolean> = {} as Record<MapDirection, boolean>;

      MAP_DIRECTION_ORDER.forEach((dir, index) => {
        connections[dir] = mask[index] === '1';
      });

      adjacentTiles.push({
        key: adjacentKey,
        connections,
      });
    }

    return {
      mainTileKey,
      adjacentTiles,
    };
  }
}
