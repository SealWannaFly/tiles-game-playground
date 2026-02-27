import { GlobalMapTile } from '../interfaces/global-map-tile.interface';
import { Utils } from '../../../../common/utils/utils';
import { BoundingBox } from '../../../../common/models/bounding-box.class';

export class ContinentInfo {
  public readonly root: GlobalMapTile;
  public readonly tiles: Map<string, GlobalMapTile>;
  public readonly boundingBox: BoundingBox;

  constructor(root: GlobalMapTile) {
    this.root = root;
    this.tiles = new Map<string, GlobalMapTile>();
    this.boundingBox = new BoundingBox(root);
  }

  public addTile(tile: GlobalMapTile): void {
    this.tiles.set(Utils.getKeyFromCoordinates(tile), tile);

    this.boundingBox.update(tile);
  }
}
