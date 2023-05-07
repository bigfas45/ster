import {isDevMode, Pipe, PipeTransform} from '@angular/core';

@Pipe({ name: 'assetUrl' })

  export class AssetUrlPipe implements PipeTransform {
    lang = localStorage.getItem('lang') || 'en-us'
      transform(value: string): string {
          const baseURL = isDevMode() ? 'http://localhost:9006/assets/' : `https://devtest.stanbicibtc.com:9000/OnlineBankingTransfer/${this.lang}/assets/`
          return baseURL + value;
      }
  }

