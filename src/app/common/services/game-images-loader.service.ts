import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { LoadingStatus } from '../interfaces/loading-status.interface';
import { map, Observable, tap } from 'rxjs';
import { blobToImageElement } from '../utils/blob-to-image-element.util';

@Injectable({
  providedIn: 'root',
})
export class GameImagesLoaderService {
  private _imageCache = new Map<string, HTMLImageElement>();
  private _loadingStatus = signal<LoadingStatus>({
    loaded: 0,
    total: 0,
    percentage: 100,
  });

  readonly loadingStatus = this._loadingStatus.asReadonly();

  constructor(private http: HttpClient) {}

  getImage(key: string): HTMLImageElement | undefined {
    return this._imageCache.get(key);
  }

  loadImage(key: string, url: string): Observable<HTMLImageElement> {
    return this.http
      .get(url, {
        responseType: 'blob',
      })
      .pipe(
        map((svgText) => blobToImageElement(svgText)),
        tap((image) => {
          this._imageCache.set(key, image);

          console.log(`✅ Загружено и закэшировано: ${url}`);
        }),
      );
  }

  clearCache(): void {
    this._imageCache.clear();
  }
}
